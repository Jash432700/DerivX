// ═══════════════════════════════════════════
//  DerivX — Core Pricing & Math Library
//  All quantitative models for the platform
// ═══════════════════════════════════════════

// ── Normal distribution CDF (Hart approximation) ──
export function normCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return 0.5 * (1.0 + sign * y)
}

export function normPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

// ── Black-Scholes Model ──
export function blackScholes(S, K, T, r, sigma, type = 'call') {
  if (T <= 0) {
    const intrinsic = type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
    return { price: intrinsic, d1: 0, d2: 0 }
  }
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)
  let price
  if (type === 'call') {
    price = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2)
  } else {
    price = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1)
  }
  return { price: Math.max(price, 0), d1, d2 }
}

// ── Greeks ──
export function greeks(S, K, T, r, sigma, type = 'call') {
  if (T <= 0) return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 }
  const { d1, d2 } = blackScholes(S, K, T, r, sigma, type)
  const sqrtT = Math.sqrt(T)
  const eRt = Math.exp(-r * T)

  const delta = type === 'call' ? normCDF(d1) : normCDF(d1) - 1
  const gamma = normPDF(d1) / (S * sigma * sqrtT)
  const vega = (S * normPDF(d1) * sqrtT) / 100 // per 1% vol change
  const theta =
    type === 'call'
      ? (-(S * normPDF(d1) * sigma) / (2 * sqrtT) - r * K * eRt * normCDF(d2)) / 365
      : (-(S * normPDF(d1) * sigma) / (2 * sqrtT) + r * K * eRt * normCDF(-d2)) / 365
  const rho =
    type === 'call'
      ? (K * T * eRt * normCDF(d2)) / 100
      : (-K * T * eRt * normCDF(-d2)) / 100

  return { delta, gamma, theta, vega, rho }
}

// ── Option Payoff at Expiry ──
export function optionPayoff(S, K, premium, type, position = 'long') {
  let payoff = 0
  if (type === 'call') payoff = Math.max(S - K, 0)
  else if (type === 'put') payoff = Math.max(K - S, 0)
  else if (type === 'forward') payoff = S - K
  else if (type === 'shortforward') payoff = K - S

  if (position === 'short') payoff = -payoff
  return payoff - (position === 'long' ? premium : -premium)
}

// ── Forward Contract Payoff ──
export function forwardPayoff(S, K, N = 1, position = 'long') {
  return position === 'long' ? (S - K) * N : (K - S) * N
}

// ── Strategy Payoffs (Combined) ──
export const strategies = {
  longCall: (S, K, p) => Math.max(S - K, 0) - p,
  shortCall: (S, K, p) => p - Math.max(S - K, 0),
  longPut: (S, K, p) => Math.max(K - S, 0) - p,
  shortPut: (S, K, p) => p - Math.max(K - S, 0),
  straddle: (S, K, cp, pp) => Math.max(S - K, 0) + Math.max(K - S, 0) - cp - pp,
  strangle: (S, Kc, Kp, cp, pp) => Math.max(S - Kc, 0) + Math.max(Kp - S, 0) - cp - pp,
  bullCallSpread: (S, K1, K2, p1, p2) =>
    Math.max(S - K1, 0) - Math.max(S - K2, 0) - (p1 - p2),
  bearPutSpread: (S, K1, K2, p1, p2) =>
    Math.max(K2 - S, 0) - Math.max(K1 - S, 0) - (p2 - p1),
  bullPutSpread: (S, K1, K2, p1, p2) =>
    p1 - p2 - Math.max(K1 - S, 0) + Math.max(K2 - S, 0),
  coveredCall: (S, S0, K, p) => (S - S0) + Math.min(K - S + p, p),
  protectivePut: (S, S0, K, p) => (S - S0) + Math.max(K - S, 0) - p,
  ironCondor: (S, K1, K2, K3, K4, net) =>
    net -
    Math.max(K2 - S, 0) +
    Math.max(K1 - S, 0) +
    Math.max(S - K3, 0) -
    Math.max(S - K4, 0),
}

// ── Breakeven calculations ──
export function breakeven(K, premium, type, position = 'long') {
  if (type === 'call') {
    return position === 'long' ? K + premium : K + premium
  } else {
    return position === 'long' ? K - premium : K - premium
  }
}

// ── Binomial Tree (Cox-Ross-Rubinstein) ──
export function binomialTree(S, K, T, r, sigma, steps, type = 'call', american = false) {
  const dt = T / steps
  const u = Math.exp(sigma * Math.sqrt(dt))
  const d = 1 / u
  const p = (Math.exp(r * dt) - d) / (u - d) // risk-neutral probability
  const disc = Math.exp(-r * dt)

  // Build terminal stock prices
  const ST = []
  for (let i = 0; i <= steps; i++) {
    ST.push(S * Math.pow(u, steps - i) * Math.pow(d, i))
  }

  // Terminal option values
  let optionValues = ST.map((s) => {
    if (type === 'call') return Math.max(s - K, 0)
    return Math.max(K - s, 0)
  })

  // All nodes (for visualization)
  const allNodes = [optionValues.slice()]

  // Backward induction
  for (let step = steps - 1; step >= 0; step--) {
    const newVals = []
    for (let i = 0; i <= step; i++) {
      const hold = disc * (p * optionValues[i] + (1 - p) * optionValues[i + 1])
      if (american) {
        const spotAtNode = S * Math.pow(u, step - i) * Math.pow(d, i)
        const exercise =
          type === 'call' ? Math.max(spotAtNode - K, 0) : Math.max(K - spotAtNode, 0)
        newVals.push(Math.max(hold, exercise))
      } else {
        newVals.push(hold)
      }
    }
    optionValues = newVals
    allNodes.unshift(optionValues.slice())
  }

  return {
    price: optionValues[0],
    u,
    d,
    p,
    steps,
    allNodes,
    ST,
  }
}

// ── Monte Carlo Option Pricing ──
export function monteCarlo(S, K, T, r, sigma, type = 'call', simulations = 10000) {
  const results = []
  let sum = 0
  for (let i = 0; i < simulations; i++) {
    // Box-Muller transform for normal random
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const ST = S * Math.exp((r - 0.5 * sigma * sigma) * T + sigma * Math.sqrt(T) * z)
    const payoff = type === 'call' ? Math.max(ST - K, 0) : Math.max(K - ST, 0)
    sum += payoff
    if (i < 200) results.push(ST) // keep sample paths for viz
  }
  const price = (sum / simulations) * Math.exp(-r * T)
  return { price, samplePaths: results }
}

// ── Generate Payoff Data for Charts ──
export function generatePayoffData(K, premium, type, position = 'long', steps = 100) {
  const minS = K * 0.5
  const maxS = K * 1.5
  const prices = []
  const payoffs = []
  const pls = []
  const breakevens = []

  for (let i = 0; i <= steps; i++) {
    const S = minS + (i / steps) * (maxS - minS)
    prices.push(+S.toFixed(2))

    let payoff = 0
    if (type === 'call') payoff = Math.max(S - K, 0)
    else if (type === 'put') payoff = Math.max(K - S, 0)
    else if (type === 'forward') payoff = S - K

    if (position === 'short') payoff = -payoff
    payoffs.push(+payoff.toFixed(2))
    pls.push(+(payoff - (position === 'long' ? premium : -premium)).toFixed(2))
  }

  return { prices, payoffs, pls }
}

// ── Forward Rate Calculation ──
export function forwardRate(S0, r, T, q = 0) {
  return S0 * Math.exp((r - q) * T)
}

// ── Implied Volatility (Newton-Raphson) ──
export function impliedVolatility(marketPrice, S, K, T, r, type = 'call', maxIter = 100) {
  let sigma = 0.3 // initial guess
  for (let i = 0; i < maxIter; i++) {
    const { price } = blackScholes(S, K, T, r, sigma, type)
    const v = greeks(S, K, T, r, sigma, type).vega * 100 // undo /100 scaling
    const diff = price - marketPrice
    if (Math.abs(diff) < 0.0001) break
    if (Math.abs(v) < 1e-8) break
    sigma = sigma - diff / v
    if (sigma <= 0) sigma = 0.001
  }
  return sigma
}

// ── Risk Metrics ──
export function valueAtRisk(returns, confidence = 0.95) {
  const sorted = [...returns].sort((a, b) => a - b)
  const idx = Math.floor((1 - confidence) * sorted.length)
  return -sorted[idx]
}

export function sharpeRatio(returns, rfRate = 0.05) {
  const n = returns.length
  const mean = returns.reduce((a, b) => a + b, 0) / n
  const std = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / n)
  return ((mean - rfRate / 252) / std) * Math.sqrt(252)
}

// ── Chart Color Palette ──
export const CHART_COLORS = {
  green: '#10b981',
  red: '#ef4444',
  blue: '#5b8dff',
  purple: '#8b5cf6',
  gold: '#f59e0b',
  cyan: '#06b6d4',
  white: '#e2e8f0',
  grid: 'rgba(100,120,255,0.06)',
  text: '#4b5a72',
}

// ── Plotly Layout Defaults ──
export function plotlyLayout(title = '', xTitle = '', yTitle = '') {
  return {
    title: title
      ? { text: title, font: { color: '#94a3b8', size: 13, family: 'DM Sans' } }
      : undefined,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#94a3b8', family: 'DM Sans' },
    xaxis: {
      title: xTitle ? { text: xTitle, font: { size: 11 } } : undefined,
      gridcolor: CHART_COLORS.grid,
      zerolinecolor: 'rgba(100,120,255,0.15)',
      tickfont: { size: 10, color: CHART_COLORS.text },
      showline: false,
    },
    yaxis: {
      title: yTitle ? { text: yTitle, font: { size: 11 } } : undefined,
      gridcolor: CHART_COLORS.grid,
      zerolinecolor: 'rgba(100,120,255,0.15)',
      tickfont: { size: 10, color: CHART_COLORS.text },
      showline: false,
    },
    margin: { l: 50, r: 20, t: title ? 40 : 20, b: 45 },
    legend: {
      font: { size: 10, color: '#94a3b8' },
      bgcolor: 'transparent',
      x: 0,
      y: 1,
    },
    hovermode: 'closest',
    showlegend: true,
  }
}
