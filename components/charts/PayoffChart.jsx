'use client'
import { useEffect, useRef } from 'react'
import { generatePayoffData, plotlyLayout, CHART_COLORS } from '@/lib/pricing'

export default function PayoffChart({ K = 100, premium = 10, type = 'call', position = 'long', height = 280 }) {
  const divRef = useRef(null)
  const plotRef = useRef(null)

  useEffect(() => {
    if (!divRef.current) return
    const { prices, payoffs, pls } = generatePayoffData(K, premium, type, position)

    const traces = [
      {
        x: prices,
        y: payoffs,
        type: 'scatter',
        mode: 'lines',
        name: 'Payoff',
        line: { color: CHART_COLORS.blue, width: 2.5 },
        hovertemplate: 'S_T: %{x}<br>Payoff: %{y}<extra></extra>',
      },
      {
        x: prices,
        y: pls,
        type: 'scatter',
        mode: 'lines',
        name: 'Profit/Loss',
        line: { color: CHART_COLORS.gold, width: 2, dash: 'dash' },
        hovertemplate: 'S_T: %{x}<br>P&L: %{y}<extra></extra>',
      },
      // Zero line
      {
        x: [prices[0], prices[prices.length - 1]],
        y: [0, 0],
        type: 'scatter',
        mode: 'lines',
        name: 'Break-even',
        line: { color: 'rgba(255,255,255,0.2)', width: 1 },
        hoverinfo: 'skip',
        showlegend: false,
      },
    ]

    const layout = {
      ...plotlyLayout('', 'Stock Price at Expiry', 'Payoff / P&L'),
      height,
      shapes: [
        // Vertical line at K
        {
          type: 'line',
          x0: K, x1: K,
          y0: 0, y1: 1,
          yref: 'paper',
          line: { color: 'rgba(91,141,255,0.4)', width: 1, dash: 'dot' },
        },
      ],
      annotations: [
        {
          x: K,
          y: 1,
          yref: 'paper',
          text: `K=${K}`,
          showarrow: false,
          font: { size: 10, color: '#5b8dff' },
          yanchor: 'bottom',
        },
      ],
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
  }, [K, premium, type, position, height])

  return <div ref={divRef} style={{ height }} />
}
