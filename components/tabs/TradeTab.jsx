'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { showNotif } from '@/components/ui/Notification'

const SCENARIOS = [
  { id: 'bullish', emoji: '🐂', name: 'Bull Market', desc: 'Prices expected to rise', hint: '→ Consider Long Forward' },
  { id: 'bearish', emoji: '🐻', name: 'Bear Market', desc: 'Prices likely to fall', hint: '→ Consider Short Forward' },
  { id: 'volatile', emoji: '⚡', name: 'High Volatility', desc: 'Big move expected', hint: '→ Consider Straddle' },
  { id: 'neutral', emoji: '😐', name: 'Range-Bound', desc: 'Low movement expected', hint: '→ Sell premium' },
]

const INSTRUMENTS = ['forward', 'futures', 'call', 'put']
const ASSETS = ['RELIANCE', 'TCS', 'NIFTY 50', 'Gold', 'Crude Oil', 'USD/INR']
const LEVELS = ['Intern', 'Analyst', 'Associate', 'VP', 'Director', 'MD', 'Partner', 'Legend']

export default function TradeTab({ chId, chData, store }) {
  const [scenario, setScenario] = useState('bullish')
  const [instrument, setInstrument] = useState('forward')
  const [asset, setAsset] = useState('RELIANCE')
  const [spot, setSpot] = useState(2500)
  const [strike, setStrike] = useState(2520)
  const [qty, setQty] = useState(10)
  const [settlePrice, setSettlePrice] = useState(2500)
  const [tradeMsg, setTradeMsg] = useState(null)
  const [positions, setPositions] = useState([])

  const state = store.state
  const lvl = state.level || 1

  const executeTrade = () => {
    if (!spot || !strike || !qty) { showNotif('⚠️ Error', 'Fill all fields'); return }
    const pos = { id: Date.now(), instrument, asset, entry: strike, qty: Number(qty), spot: Number(spot) }
    setPositions(p => [...p, pos])
    setTradeMsg({ type: 'success', text: `✅ Opened: ${instrument.toUpperCase()} on ${asset} @ ₹${strike} × ${qty}` })
    store.executeTrade(pos)
    if (!state.achievements?.includes('first_trade')) store.unlockAchievement('first_trade')
    showNotif('🚀 Trade Opened', `${instrument.toUpperCase()} on ${asset}`)
  }

  const settle = () => {
    let total = 0
    positions.forEach(p => {
      if (p.instrument === 'forward' || p.instrument === 'futures') total += (settlePrice - p.entry) * p.qty
      else if (p.instrument === 'call') total += (Math.max(settlePrice - p.entry, 0) - 5) * p.qty
      else if (p.instrument === 'put') total += (Math.max(p.entry - settlePrice, 0) - 5) * p.qty
    })
    store.settlePositions(settlePrice)
    setPositions([])
    setTradeMsg(null)
    if (total > 0) {
      store.unlockAchievement('first_win')
      showNotif('💰 Profit!', `+₹${total.toFixed(0)} realized`)
    } else {
      showNotif('📉 Loss', `₹${Math.abs(total).toFixed(0)} — try again`)
    }
  }

  // Live P&L for open positions
  const livePnl = positions.reduce((acc, p) => {
    if (p.instrument === 'forward' || p.instrument === 'futures') return acc + (settlePrice - p.entry) * p.qty
    if (p.instrument === 'call') return acc + (Math.max(settlePrice - p.entry, 0) - 5) * p.qty
    if (p.instrument === 'put') return acc + (Math.max(p.entry - settlePrice, 0) - 5) * p.qty
    return acc
  }, 0)

  return (
    <div>
      {/* Balance Strip */}
      <div className="bg-gradient-to-r from-bg-3 to-bg-4 border border-white/10 rounded-xl px-5 py-4 flex justify-between items-center mb-5 flex-wrap gap-3">
        <div>
          <div className="text-[11px] text-slate-500 mb-1">Virtual Portfolio Balance</div>
          <div className="font-head text-2xl font-black text-emerald">₹{(state.balance || 50000).toLocaleString()}</div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <div className="text-[11px] text-slate-500">Total P&L</div>
            <div className={`font-mono text-base font-semibold ${(state.totalPnl || 0) >= 0 ? 'text-emerald' : 'text-danger'}`}>
              {(state.totalPnl || 0) >= 0 ? '+' : ''}₹{(state.totalPnl || 0).toFixed(0)}
            </div>
          </div>
          <div className="bg-bg-2 border border-gold/30 rounded-xl px-4 py-2 text-center">
            <div className="font-mono text-base text-gold font-semibold">Lv.{lvl}</div>
            <div className="text-[10px] text-slate-500">{LEVELS[Math.min(lvl - 1, 7)]}</div>
          </div>
        </div>
      </div>

      {/* Scenario */}
      <div className="card">
        <div className="card-title">🌍 Market Scenario</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-1">
          {SCENARIOS.map(s => (
            <div key={s.id} onClick={() => setScenario(s.id)}
              className={`bg-bg-4 border rounded-xl p-3 cursor-pointer transition-all hover:border-white/20 ${scenario === s.id ? 'border-accent/50 bg-accent/5' : 'border-white/[0.06]'}`}>
              <div className="text-2xl mb-1.5">{s.emoji}</div>
              <div className="font-head font-semibold text-xs text-white mb-0.5">{s.name}</div>
              <div className="text-[10px] text-slate-500 mb-1.5">{s.desc}</div>
              <div className="text-[10px] text-accent italic">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Instrument + Form */}
      <div className="card">
        <div className="card-title">🎯 Choose Instrument</div>
        <div className="flex gap-2 flex-wrap mb-4">
          {INSTRUMENTS.map(inst => (
            <button key={inst} onClick={() => setInstrument(inst)}
              className={`strat-btn capitalize ${instrument === inst ? 'strat-btn-sel' : ''}`}>
              {inst === 'forward' ? '📅' : inst === 'futures' ? '⚡' : inst === 'call' ? '📈' : '📉'} {inst}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="text-xs text-slate-400 block mb-1">Asset</label>
            <select value={asset} onChange={e => setAsset(e.target.value)} className="input-field">
              {ASSETS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-slate-400 block mb-1">Spot Price (₹)</label>
            <input type="number" value={spot} onChange={e => setSpot(e.target.value)} className="input-field" />
          </div>
          <div><label className="text-xs text-slate-400 block mb-1">Strike / Entry (₹)</label>
            <input type="number" value={strike} onChange={e => setStrike(e.target.value)} className="input-field" />
          </div>
          <div><label className="text-xs text-slate-400 block mb-1">Quantity (Units)</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="input-field" />
          </div>
        </div>

        <button onClick={executeTrade} className="exec-btn w-full">🚀 Execute Trade</button>

        {tradeMsg && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-emerald/8 border border-emerald/20 rounded-lg px-4 py-2.5 text-sm text-emerald">
            {tradeMsg.text}
          </motion.div>
        )}
      </div>

      {/* Open Positions */}
      {positions.length > 0 && (
        <div className="card">
          <div className="card-title">📋 Open Positions</div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/[0.07]">
                {['Instrument', 'Asset', 'Entry', 'Qty', 'Live P&L'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-mono text-slate-500 uppercase text-[10px] tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {positions.map(p => {
                  let pnl = 0
                  if (p.instrument === 'forward' || p.instrument === 'futures') pnl = (settlePrice - p.entry) * p.qty
                  else if (p.instrument === 'call') pnl = (Math.max(settlePrice - p.entry, 0) - 5) * p.qty
                  else if (p.instrument === 'put') pnl = (Math.max(p.entry - settlePrice, 0) - 5) * p.qty
                  return (
                    <tr key={p.id} className="border-b border-white/[0.04]">
                      <td className="py-2 px-3 uppercase font-semibold">{p.instrument}</td>
                      <td className="py-2 px-3 text-slate-300">{p.asset}</td>
                      <td className="py-2 px-3 font-mono">₹{p.entry}</td>
                      <td className="py-2 px-3 font-mono">{p.qty}</td>
                      <td className={`py-2 px-3 font-mono font-semibold ${pnl >= 0 ? 'text-emerald' : 'text-danger'}`}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(0)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Settlement slider */}
          <div className="sl-row mb-3">
            <span className="sl-lbl text-[11px]">Settlement Price (₹) <b className="text-accent">₹{settlePrice}</b></span>
            <input type="range" min={2000} max={3000} value={settlePrice} step={10}
              onChange={e => setSettlePrice(Number(e.target.value))} className="flex-1" />
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400">Total P&L if settled now:</span>
            <span className={`font-mono text-sm font-bold ${livePnl >= 0 ? 'text-emerald' : 'text-danger'}`}>
              {livePnl >= 0 ? '+' : ''}₹{livePnl.toFixed(0)}
            </span>
          </div>
          <button onClick={settle} className="exec-btn w-full">🏁 Settle All Positions</button>
        </div>
      )}
    </div>
  )
}
