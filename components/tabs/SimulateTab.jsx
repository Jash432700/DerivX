'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { blackScholes, greeks, generatePayoffData, binomialTree, forwardPayoff, CHART_COLORS, plotlyLayout } from '@/lib/pricing'
import { showNotif } from '@/components/ui/Notification'

// ── Dynamic Plotly chart wrapper ──
function PlotlyChart({ traces, layout, height = 280 }) {
  const divRef = useRef(null)
  const plotRef = useRef(null)

  useEffect(() => {
    if (!divRef.current) return
    import('plotly.js-dist-min').then(Plotly => {
      if (!divRef.current) return
      const fullLayout = { ...layout, height, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent' }
      if (plotRef.current) {
        Plotly.react(divRef.current, traces, fullLayout, { responsive: true, displayModeBar: false })
      } else {
        Plotly.newPlot(divRef.current, traces, fullLayout, { responsive: true, displayModeBar: false })
        plotRef.current = true
      }
    })
  })

  return <div ref={divRef} style={{ height, width: '100%' }} />
}

// ── Slider row component ──
function SliderRow({ label, val, min, max, step = 1, onChange, format = v => v }) {
  return (
    <div className="sl-row">
      <span className="sl-lbl text-[11px]">{label}: <b className="text-accent">{format(val)}</b></span>
      <input type="range" min={min} max={max} step={step} value={val} onChange={e => onChange(Number(e.target.value))} className="flex-1" />
    </div>
  )
}

// ── CH1 Simulator ──
function Ch1Simulator() {
  const [simTab, setSimTab] = useState('forward')
  const [K, setK] = useState(100)
  const [N, setN] = useState(100)
  const [ST, setST] = useState(115)
  const [optK, setOptK] = useState(100)
  const [prem, setPrem] = useState(10)
  const [optST, setOptST] = useState(115)
  const [optType, setOptType] = useState('call')
  const [arbA, setArbA] = useState(5500)
  const [arbB, setArbB] = useState(5560)
  const [arbC, setArbC] = useState(15)
  const [arbQ, setArbQ] = useState(100)

  const TABS = ['forward', 'options', 'compare', 'arbitrage']

  // Forward chart data
  const fwdSpots = Array.from({ length: 61 }, (_, i) => K - 60 + i * 2)
  const fwdTraces = [
    { x: fwdSpots, y: fwdSpots.map(s => (s - K) * N), name: 'Long Forward', line: { color: CHART_COLORS.green, width: 2.5 }, type: 'scatter', mode: 'lines', hovertemplate: 'S_T: %{x}<br>Payoff: %{y}<extra></extra>' },
    { x: fwdSpots, y: fwdSpots.map(s => (K - s) * N), name: 'Short Forward', line: { color: CHART_COLORS.red, width: 2.5 }, type: 'scatter', mode: 'lines', hovertemplate: 'S_T: %{x}<br>Payoff: %{y}<extra></extra>' },
    { x: [ST], y: [(ST - K) * N], name: 'Your S_T', mode: 'markers', type: 'scatter', marker: { color: CHART_COLORS.gold, size: 10 }, showlegend: false },
  ]

  // Options chart
  const optSpots = Array.from({ length: 61 }, (_, i) => optK - 60 + i * 2)
  let optPayoff, optPL
  if (optType === 'call') { optPayoff = optSpots.map(s => Math.max(s - optK, 0)); optPL = optSpots.map(s => Math.max(s - optK, 0) - prem) }
  else if (optType === 'put') { optPayoff = optSpots.map(s => Math.max(optK - s, 0)); optPL = optSpots.map(s => Math.max(optK - s, 0) - prem) }
  else if (optType === 'shortcall') { optPayoff = optSpots.map(s => -Math.max(s - optK, 0)); optPL = optSpots.map(s => prem - Math.max(s - optK, 0)) }
  else { optPayoff = optSpots.map(s => -Math.max(optK - s, 0)); optPL = optSpots.map(s => prem - Math.max(optK - s, 0)) }
  const optTraces = [
    { x: optSpots, y: optPayoff, name: 'Payoff', line: { color: CHART_COLORS.blue, width: 2.5 }, type: 'scatter', mode: 'lines' },
    { x: optSpots, y: optPL, name: 'P&L', line: { color: CHART_COLORS.gold, width: 2, dash: 'dash' }, type: 'scatter', mode: 'lines' },
    { x: [optST], y: [optType.includes('call') ? Math.max(optST - optK, (optType === 'call' ? -prem : prem - Math.max(optST - optK, 0))) : 0], mode: 'markers', type: 'scatter', marker: { color: CHART_COLORS.gold, size: 10 }, showlegend: false },
  ]

  // Compare traces
  const cmpSpots = Array.from({ length: 61 }, (_, i) => 40 + i * 2)
  const cmpK = 100, cmpP = 8
  const cmpTraces = [
    { x: cmpSpots, y: cmpSpots.map(s => (s - cmpK)), name: 'Long Forward', line: { color: CHART_COLORS.green, width: 2 }, type: 'scatter', mode: 'lines' },
    { x: cmpSpots, y: cmpSpots.map(s => Math.max(s - cmpK, 0) - cmpP), name: 'Long Call P&L', line: { color: CHART_COLORS.blue, width: 2 }, type: 'scatter', mode: 'lines' },
    { x: cmpSpots, y: cmpSpots.map(s => Math.max(cmpK - s, 0) - cmpP), name: 'Long Put P&L', line: { color: CHART_COLORS.gold, width: 2 }, type: 'scatter', mode: 'lines' },
  ]

  // Arb
  const arbProfit = (arbB - arbA - arbC) * arbQ
  const arbExists = arbProfit > 0
  const arbTraces = [
    { x: ['Buy (Market A)', 'Sell (Market B)', 'Trans. Cost', 'Net Profit'], y: [arbA, arbB, -arbC, Math.max(arbProfit / arbQ, 0)], type: 'bar', marker: { color: ['#3b82f6', '#8b5cf6', '#ef4444', arbExists ? '#10b981' : '#4b5a72'] }, hovertemplate: '%{x}: %{y}<extra></extra>' },
  ]

  const longPay = (ST - K) * N
  const shortPay = (K - ST) * N

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-5 border-b border-white/[0.07] pb-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setSimTab(t)}
            className={`px-4 py-2 text-xs rounded-t-lg capitalize transition-all border border-transparent border-b-0 ${simTab === t ? 'bg-bg-3 text-accent border-white/10' : 'text-slate-400 hover:text-white'}`}>
            {t === 'forward' ? '📈 Forward Payoff' : t === 'options' ? '🎯 Options' : t === 'compare' ? '⚖️ Compare' : '🔄 Arbitrage'}
          </button>
        ))}
      </div>

      {simTab === 'forward' && (
        <div className="card">
          <div className="card-title">📈 Forward Contract Payoff Simulator</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SliderRow label="Forward Price K" val={K} min={50} max={200} onChange={setK} format={v => `₹${v}`} />
              <SliderRow label="Contract Size N" val={N} min={1} max={500} onChange={setN} />
              <SliderRow label="Spot at Maturity S_T" val={ST} min={50} max={200} onChange={setST} format={v => `₹${v}`} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-emerald/8 border border-emerald/20 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500 mb-1">LONG payoff</div>
                  <div className={`font-mono text-base font-bold ${longPay >= 0 ? 'text-emerald' : 'text-danger'}`}>{longPay >= 0 ? '+' : ''}₹{longPay.toLocaleString()}</div>
                </div>
                <div className="bg-danger/8 border border-danger/20 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500 mb-1">SHORT payoff</div>
                  <div className={`font-mono text-base font-bold ${shortPay >= 0 ? 'text-emerald' : 'text-danger'}`}>{shortPay >= 0 ? '+' : ''}₹{shortPay.toLocaleString()}</div>
                </div>
              </div>
              <div className="info-box mt-3 text-[11px]">
                {ST > K ? `🟢 S_T > K → Long profits (${((ST - K) / K * 100).toFixed(1)}% above forward)` : ST < K ? `🔴 S_T < K → Short profits (${((K - ST) / K * 100).toFixed(1)}% below forward)` : '⚖️ S_T = K → Zero payoff for both. Breakeven.'}
              </div>
            </div>
            <PlotlyChart traces={fwdTraces} layout={{ ...plotlyLayout('', 'Spot Price at Maturity', 'Payoff (₹)'), showlegend: true }} />
          </div>
        </div>
      )}

      {simTab === 'options' && (
        <div className="card">
          <div className="card-title">🎯 Option Payoff Explorer</div>
          <div className="flex gap-2 flex-wrap mb-4">
            {[['call', '📈 Long Call'], ['put', '📉 Long Put'], ['shortcall', '📉 Short Call'], ['shortput', '📈 Short Put']].map(([t, l]) => (
              <button key={t} onClick={() => setOptType(t)} className={`strat-btn text-xs ${optType === t ? 'strat-btn-sel' : ''}`}>{l}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SliderRow label="Strike K" val={optK} min={50} max={200} onChange={setOptK} format={v => `₹${v}`} />
              <SliderRow label="Premium" val={prem} min={1} max={40} onChange={setPrem} format={v => `₹${v}`} />
              <SliderRow label="Spot at Expiry" val={optST} min={50} max={200} onChange={setOptST} format={v => `₹${v}`} />
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  { label: 'Payoff', val: optType === 'call' ? Math.max(optST - optK, 0) : optType === 'put' ? Math.max(optK - optST, 0) : optType === 'shortcall' ? -Math.max(optST - optK, 0) : -Math.max(optK - optST, 0) },
                  { label: 'P&L', val: optType === 'call' ? Math.max(optST - optK, 0) - prem : optType === 'put' ? Math.max(optK - optST, 0) - prem : optType === 'shortcall' ? prem - Math.max(optST - optK, 0) : prem - Math.max(optK - optST, 0) },
                  { label: 'Breakeven', val: optType.includes('call') ? optK + prem : optK - prem, prefix: '₹', raw: true },
                  { label: 'Max Loss', val: optType === 'call' || optType === 'put' ? prem : optType === 'shortcall' ? '∞' : optK - prem, prefix: optType === 'shortcall' ? '' : '₹', raw: true },
                ].map(s => (
                  <div key={s.label} className="bg-bg-4 border border-white/[0.06] rounded-lg p-2.5 text-center">
                    <div className="text-[10px] text-slate-500 mb-1">{s.label}</div>
                    <div className={`font-mono text-sm font-bold ${s.raw ? 'text-white' : typeof s.val === 'number' && s.val >= 0 ? 'text-emerald' : 'text-danger'}`}>
                      {s.raw ? `${s.prefix || ''}${s.val}` : `${s.val >= 0 ? '+' : ''}₹${typeof s.val === 'number' ? s.val.toFixed(0) : s.val}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <PlotlyChart traces={optTraces} layout={plotlyLayout('', 'Spot Price at Expiry', '₹')} />
          </div>
        </div>
      )}

      {simTab === 'compare' && (
        <div className="card">
          <div className="card-title">⚖️ Instrument Comparison (K=₹100, Premium=₹8)</div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { name: 'Long Forward', emoji: '📅', pl: (ST - 100), note: 'No premium, obligatory' },
              { name: 'Long Call P&L', emoji: '📈', pl: Math.max(ST - 100, 0) - 8, note: 'Premium paid = ₹8' },
              { name: 'Long Put P&L', emoji: '📉', pl: Math.max(100 - ST, 0) - 8, note: 'Premium paid = ₹8' },
            ].map(item => (
              <div key={item.name} className={`bg-bg-4 border rounded-xl p-3 text-center ${item.pl >= 0 ? 'border-emerald/20' : 'border-danger/15'}`}>
                <div className="text-xl mb-1">{item.emoji}</div>
                <div className="text-xs font-semibold text-white mb-0.5">{item.name}</div>
                <div className={`font-mono text-base font-bold ${item.pl >= 0 ? 'text-emerald' : 'text-danger'}`}>
                  {item.pl >= 0 ? '+' : ''}₹{item.pl.toFixed(0)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{item.note}</div>
              </div>
            ))}
          </div>
          <SliderRow label="Spot at Maturity" val={ST} min={50} max={180} onChange={setST} format={v => `₹${v}`} />
          <PlotlyChart traces={cmpTraces} layout={{ ...plotlyLayout('', 'Spot Price', 'P&L (₹)'), showlegend: true }} />
        </div>
      )}

      {simTab === 'arbitrage' && (
        <div className="card">
          <div className="card-title">🔄 Live Arbitrage Detector</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SliderRow label="Market A (Mumbai)" val={arbA} min={5000} max={6000} step={10} onChange={setArbA} format={v => `₹${v.toLocaleString()}`} />
              <SliderRow label="Market B (Delhi)" val={arbB} min={5000} max={6000} step={10} onChange={setArbB} format={v => `₹${v.toLocaleString()}`} />
              <SliderRow label="Transaction Cost" val={arbC} min={0} max={100} step={5} onChange={setArbC} format={v => `₹${v}`} />
              <SliderRow label="Quantity (grams)" val={arbQ} min={10} max={1000} step={10} onChange={setArbQ} />
              <div className={`mt-4 p-4 rounded-xl border ${arbExists ? 'bg-emerald/8 border-emerald/25' : 'bg-danger/8 border-danger/20'}`}>
                <div className="flex justify-between text-xs mb-2"><span className="text-slate-400">Spread (B−A)</span><span className="font-mono text-white">{arbB >= arbA ? '+' : ''}₹{(arbB - arbA)}</span></div>
                <div className="flex justify-between text-xs mb-2"><span className="text-slate-400">Cost</span><span className="font-mono text-danger">−₹{arbC}</span></div>
                <div className="flex justify-between text-xs mb-3 border-t border-white/10 pt-2"><span className="text-slate-300 font-semibold">Net/unit</span><span className={`font-mono font-bold ${arbExists ? 'text-emerald' : 'text-danger'}`}>{arbProfit >= 0 ? '+' : ''}₹{(arbProfit / arbQ).toFixed(0)}</span></div>
                <div className={`text-center text-sm font-bold ${arbExists ? 'text-emerald' : 'text-danger'}`}>
                  {arbExists ? `✅ ARBITRAGE! Total profit: ₹${arbProfit.toLocaleString()}` : '❌ No arbitrage opportunity'}
                </div>
                {arbExists && (
                  <button onClick={() => { showNotif('🔄 Arbitrage!', `+₹${arbProfit.toLocaleString()} locked in`); }} className="exec-btn w-full mt-3 text-xs py-2">⚡ Execute Trade</button>
                )}
              </div>
            </div>
            <PlotlyChart traces={arbTraces} layout={{ ...plotlyLayout('', 'Component', '₹/gram'), showlegend: false, barmode: 'group' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── CH2 Simulator ──
function Ch2Simulator() {
  const [simTab, setSimTab] = useState('margin')
  const [size, setSize] = useState(100)
  const [entry, setEntry] = useState(1250)
  const [move, setMove] = useState(-6)
  const [days, setDays] = useState(10)
  const [spot, setSpot] = useState(100)
  const [fut, setFut] = useState(112)
  const [dte, setDte] = useState(30)
  const [animDay, setAnimDay] = useState(null)

  const TABS = ['margin', 'convergence', 'ccp']
  const initMargin = Math.max(Math.round(entry * size * 0.05 / 100) * 100, 1000)
  const maintMargin = Math.round(initMargin * 0.75 / 100) * 100

  // Margin sim data
  let balance = initMargin
  const marginRows = []
  const balances = [initMargin]
  for (let d = 1; d <= days; d++) {
    const fp = entry + move * d
    const daily = move * size
    balance += daily
    const isCall = balance < maintMargin
    if (isCall) balance = initMargin
    marginRows.push({ d, fp, daily, balance, call: isCall })
    balances.push(balance)
  }

  const marginTraces = [
    { x: ['Open', ...marginRows.map(r => `Day ${r.d}`)], y: balances, name: 'Balance', type: 'scatter', mode: 'lines+markers', line: { color: CHART_COLORS.blue, width: 2.5 }, marker: { color: balances.map((b, i) => i === 0 ? CHART_COLORS.blue : b < maintMargin ? CHART_COLORS.red : b >= initMargin ? CHART_COLORS.green : CHART_COLORS.gold), size: 7 } },
    { x: ['Open', ...marginRows.map(r => `Day ${r.d}`)], y: Array(balances.length).fill(maintMargin), name: 'Maintenance', type: 'scatter', mode: 'lines', line: { color: CHART_COLORS.red, dash: 'dash', width: 1.5 } },
    { x: ['Open', ...marginRows.map(r => `Day ${r.d}`)], y: Array(balances.length).fill(initMargin), name: 'Initial', type: 'scatter', mode: 'lines', line: { color: CHART_COLORS.green, dash: 'dash', width: 1.5 } },
  ]

  // Convergence data
  const pts = Math.min(dte, 40)
  const convLabels = Array.from({ length: pts + 1 }, (_, i) => dte - Math.round(i * dte / pts))
  const futPrices = convLabels.map(t => +(spot + (fut - spot) * (t / dte)).toFixed(2))
  const convTraces = [
    { x: convLabels.map(l => `T-${l}d`), y: Array(convLabels.length).fill(spot), name: 'Spot', type: 'scatter', mode: 'lines', line: { color: CHART_COLORS.green, width: 2.5 } },
    { x: convLabels.map(l => `T-${l}d`), y: futPrices, name: 'Futures', type: 'scatter', mode: 'lines', line: { color: CHART_COLORS.blue, width: 2.5 } },
    { x: convLabels.map(l => `T-${l}d`), y: futPrices.map(f => +(f - spot).toFixed(2)), name: 'Basis', type: 'scatter', mode: 'lines', line: { color: CHART_COLORS.gold, width: 1.5, dash: 'dot' } },
  ]

  const basis = fut - spot
  const calls = marginRows.filter(r => r.call).length

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-5 border-b border-white/[0.07] pb-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setSimTab(t)}
            className={`px-4 py-2 text-xs rounded-t-lg capitalize transition-all border border-transparent border-b-0 ${simTab === t ? 'bg-bg-3 text-accent border-white/10' : 'text-slate-400 hover:text-white'}`}>
            {t === 'margin' ? '💰 Margin Accounts' : t === 'convergence' ? '🎯 Convergence' : '🏦 CCP vs OTC'}
          </button>
        ))}
      </div>

      {simTab === 'margin' && (
        <div className="card">
          <div className="card-title">💰 Live Margin Account Simulator</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SliderRow label="Contract Size (oz)" val={size} min={50} max={200} step={10} onChange={setSize} />
              <SliderRow label="Entry Price ($/oz)" val={entry} min={1100} max={1400} step={10} onChange={setEntry} format={v => `$${v}`} />
              <SliderRow label="Daily Move ($/oz)" val={move} min={-25} max={25} step={1} onChange={setMove} format={v => `${v >= 0 ? '+' : ''}$${v}`} />
              <SliderRow label="Simulation Days" val={days} min={3} max={15} step={1} onChange={setDays} />
              <div className="info-box mt-3 space-y-1 text-[11px]">
                <div className="flex justify-between"><span>Contract Value</span><span className="font-mono">${(entry * size).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Initial Margin</span><span className="font-mono text-emerald">${initMargin.toLocaleString()} ({((initMargin / (entry * size)) * 100).toFixed(1)}%)</span></div>
                <div className="flex justify-between"><span>Maintenance</span><span className="font-mono text-gold">${maintMargin.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Daily P&L</span><span className={`font-mono ${move >= 0 ? 'text-emerald' : 'text-danger'}`}>{move >= 0 ? '+' : ''}${(move * size).toFixed(0)}/day</span></div>
                <div className="flex justify-between"><span>Margin Calls</span><span className={`font-mono font-bold ${calls > 0 ? 'text-danger' : 'text-emerald'}`}>{calls}</span></div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-white/[0.07]">
                  {['Day', 'Price', 'Daily', 'Balance', 'Status'].map(h => (
                    <th key={h} className="text-left py-1.5 px-2 font-mono text-slate-500 uppercase text-[9px] tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {marginRows.map(r => (
                    <tr key={r.d} className={`border-b border-white/[0.04] transition-all ${r.call ? 'bg-danger/6' : r.balance > initMargin * 1.05 ? 'bg-emerald/4' : ''}`}>
                      <td className="py-1.5 px-2 font-mono">{r.d}</td>
                      <td className="py-1.5 px-2 font-mono">${Math.round(r.fp)}</td>
                      <td className={`py-1.5 px-2 font-mono ${r.daily >= 0 ? 'text-emerald' : 'text-danger'}`}>{r.daily >= 0 ? '+' : ''}${r.daily}</td>
                      <td className="py-1.5 px-2 font-mono">${r.balance.toFixed(0)}</td>
                      <td className="py-1.5 px-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${r.call ? 'bg-danger/15 text-danger' : r.balance >= initMargin ? 'bg-emerald/10 text-emerald' : 'bg-gold/10 text-gold'}`}>
                          {r.call ? 'CALL' : r.balance >= initMargin ? 'OK' : 'LOW'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4"><PlotlyChart traces={marginTraces} layout={{ ...plotlyLayout('', 'Day', 'Balance ($)'), showlegend: true }} height={220} /></div>
        </div>
      )}

      {simTab === 'convergence' && (
        <div className="card">
          <div className="card-title">🎯 Futures Price Convergence Simulator</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SliderRow label="Spot Price" val={spot} min={80} max={160} onChange={setSpot} format={v => `₹${v}`} />
              <SliderRow label="Initial Futures" val={fut} min={80} max={160} onChange={setFut} format={v => `₹${v}`} />
              <SliderRow label="Days to Expiry" val={dte} min={5} max={90} onChange={setDte} format={v => `${v}d`} />
              <div className="info-box mt-3 text-[11px] space-y-2">
                <div className={`font-semibold text-sm ${basis > 0 ? 'text-accent' : basis < 0 ? 'text-emerald' : 'text-white'}`}>
                  {basis > 0 ? 'Contango' : basis < 0 ? 'Backwardation' : 'Fair Value'}: Basis = ₹{Math.abs(basis).toFixed(1)} {basis > 0 ? 'premium' : basis < 0 ? 'discount' : ''}
                </div>
                <div className="text-slate-400">At expiry (T=0): futures MUST = ₹{spot}</div>
                {Math.abs(basis) > 0 && <div className="text-gold text-[10px]">💡 {basis > 0 ? 'Buy spot, short futures' : 'Buy futures, short spot'} = arbitrage profit ≈ ₹{Math.abs(basis).toFixed(1)}/unit</div>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-accent/8 border border-accent/20 rounded-lg p-3">
                  <div className="text-[10px] text-accent uppercase mb-1">Contango</div>
                  <div className="text-xs text-slate-300">Futures &gt; Spot. Storage + carry costs. Normal for oil, gold.</div>
                </div>
                <div className="bg-emerald/8 border border-emerald/20 rounded-lg p-3">
                  <div className="text-[10px] text-emerald uppercase mb-1">Backwardation</div>
                  <div className="text-xs text-slate-300">Futures &lt; Spot. Asset scarce now. High convenience yield.</div>
                </div>
              </div>
            </div>
            <PlotlyChart traces={convTraces} layout={{ ...plotlyLayout('', 'Days to Expiry →', 'Price'), showlegend: true }} height={300} />
          </div>
        </div>
      )}

      {simTab === 'ccp' && (
        <div className="card">
          <div className="card-title">🏦 CCP vs OTC Risk Comparison</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-danger/6 border border-danger/20 rounded-xl p-5">
              <div className="font-bold text-sm text-danger mb-3">❌ Without CCP (OTC Bilateral)</div>
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>A ↔ B directly. If B defaults → A loses everything.</p>
                <p>No safety net. Each party must assess every counterparty's creditworthiness.</p>
                <p>A default cascades: if A loses from B's default → A may default on C.</p>
                <p className="font-semibold text-white">Example: Pre-2008 AIG CDS — $440B in OTC derivatives with no central clearing.</p>
              </div>
            </div>
            <div className="bg-emerald/6 border border-emerald/20 rounded-xl p-5">
              <div className="font-bold text-sm text-emerald mb-3">✅ With CCP</div>
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>A → CCP ← B. CCP is counterparty to both.</p>
                <p>If B defaults → CCP pays A using guarantee fund.</p>
                <p>Multilateral netting: A's position with B nets against A's position with C.</p>
                <p className="font-semibold text-white">Example: CME Clearing clears &gt;$1 quadrillion annually. Zero systemic defaults since 2008.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-accent/7 border border-accent/20 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
            <strong className="text-accent">Post-2008 Impact:</strong> Dodd-Frank and EMIR mandated CCPs for standardized OTC derivatives. Now ~80% of interest rate swaps cleared centrally. Systemic risk dramatically reduced — but costs increased for all participants.
          </div>
        </div>
      )}
    </div>
  )
}

export default function SimulateTab({ chId, chData }) {
  return chId === 'ch1' ? <Ch1Simulator /> : <Ch2Simulator />
}
