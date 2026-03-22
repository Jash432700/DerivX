'use client'
import { useEffect, useRef } from 'react'
import { greeks, plotlyLayout, CHART_COLORS } from '@/lib/pricing'

export default function GreeksChart({ K = 100, T = 0.5, r = 0.05, sigma = 0.25, greek = 'delta', type = 'call', height = 260 }) {
  const divRef = useRef(null)
  const plotRef = useRef(null)

  useEffect(() => {
    if (!divRef.current) return
    const spots = Array.from({ length: 80 }, (_, i) => K * 0.5 + (i / 79) * K)
    const values = spots.map((S) => {
      const g = greeks(S, K, T, r, sigma, type)
      return g[greek] ?? 0
    })

    const colorMap = {
      delta: CHART_COLORS.blue,
      gamma: CHART_COLORS.green,
      theta: CHART_COLORS.red,
      vega: CHART_COLORS.purple,
      rho: CHART_COLORS.gold,
    }

    const traces = [
      {
        x: spots.map((s) => +s.toFixed(2)),
        y: values.map((v) => +v.toFixed(4)),
        type: 'scatter',
        mode: 'lines',
        name: greek.charAt(0).toUpperCase() + greek.slice(1),
        line: { color: colorMap[greek] || CHART_COLORS.blue, width: 2.5 },
        fill: 'tozeroy',
        fillcolor: (colorMap[greek] || CHART_COLORS.blue).replace(')', ', 0.08)').replace('rgb', 'rgba'),
        hovertemplate: `S: %{x}<br>${greek}: %{y:.4f}<extra></extra>`,
      },
      {
        x: [K, K],
        y: [Math.min(...values) * 0.95, Math.max(...values) * 1.05],
        type: 'scatter',
        mode: 'lines',
        name: 'ATM',
        line: { color: 'rgba(255,255,255,0.2)', width: 1, dash: 'dot' },
        hoverinfo: 'skip',
      },
    ]

    const layout = {
      ...plotlyLayout('', 'Stock Price (S)', greek.charAt(0).toUpperCase() + greek.slice(1)),
      height,
    }

    import('plotly.js-dist-min').then((Plotly) => {
      if (!divRef.current) return
      if (plotRef.current) {
        Plotly.react(divRef.current, traces, layout, { responsive: true, displayModeBar: false })
      } else {
        Plotly.newPlot(divRef.current, traces, layout, { responsive: true, displayModeBar: false })
        plotRef.current = true
      }
    })
  }, [K, T, r, sigma, greek, type, height])

  return <div ref={divRef} style={{ height }} />
}
