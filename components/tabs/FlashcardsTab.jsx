'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { showNotif } from '@/components/ui/Notification'

const CH1_CARDS = [
  { q: 'What is a derivative?', a: 'A financial contract whose value derives from an underlying asset — a stock, commodity, currency, or interest rate.' },
  { q: 'Two main derivative markets?', a: 'Exchange-traded (standardized, CCP-cleared, transparent) and OTC (customized, bilateral, counterparty risk).' },
  { q: 'Define a forward contract', a: 'OTC agreement to buy/sell an asset at a future date for a price agreed today. Zero upfront cost. Both parties obligated.' },
  { q: 'Futures vs Forwards — key difference', a: 'Futures: standardized, exchange-traded, daily MTM. Forwards: OTC, customized, settled at maturity.' },
  { q: 'Call option payoff formula', a: 'max(S_T − K, 0) — profitable when spot price exceeds strike price at maturity.' },
  { q: 'Put option payoff formula', a: 'max(K − S_T, 0) — profitable when strike price exceeds spot price at maturity.' },
  { q: 'What does a hedger do?', a: 'Uses derivatives to reduce existing price risk. Willingly sacrifices upside potential for certainty. Example: farmer sells wheat futures.' },
  { q: 'What does a speculator do?', a: 'Takes positions to profit from anticipated price movements. Uses leverage via derivatives. Adds liquidity to markets.' },
  { q: 'Define arbitrage', a: 'Simultaneously buying and selling in different markets to lock in risk-free profit from price discrepancies.' },
  { q: 'What is counterparty risk?', a: 'Risk that the other party defaults on their obligations. Higher in OTC; cleared by exchange in exchange-traded products.' },
  { q: 'Long forward payoff', a: 'S_T − K (positive if spot price at maturity exceeds the forward price).' },
  { q: 'Short forward payoff', a: 'K − S_T (positive if forward price exceeds spot price at maturity).' },
  { q: 'What is option premium?', a: "Price paid by buyer to seller for the right granted. Represents the buyer's maximum possible loss." },
  { q: 'What do clearing houses do?', a: 'Act as counterparty to all exchange-traded contracts, guaranteeing settlement and eliminating counterparty risk.' },
  { q: 'Barings Bank 1995 lesson', a: "Nick Leeson lost £830M on unauthorized Nikkei futures. Derivatives misused for hidden speculation without oversight." },
]

const CH2_CARDS = [
  { q: 'What is the initial margin?', a: 'The deposit required when opening a futures position — typically 5-15% of contract value. Acts as performance bond.' },
  { q: 'What is a margin call?', a: 'When margin balance falls below maintenance margin, broker requires top-up to initial margin level immediately.' },
  { q: 'What is open interest?', a: 'Total number of outstanding futures contracts. Increases when new positions opened, decreases when closed.' },
  { q: 'What does "mark to market" mean?', a: 'Daily settlement of futures P&L — gains added to margin account, losses deducted. Prevents accumulation of large losses.' },
  { q: 'What is a CCP?', a: 'Central Counterparty — a clearing house that becomes buyer to every seller and seller to every buyer, eliminating counterparty risk.' },
  { q: 'Contango vs Backwardation', a: 'Contango: futures > spot (storage costs). Backwardation: futures < spot (asset scarce now, or high convenience yield).' },
  { q: 'Why do futures prices converge to spot at maturity?', a: 'Arbitrage ensures it — if they differed, risk-free profits would exist. Traders exploit this, forcing convergence.' },
  { q: 'Physical vs cash settlement', a: 'Physical: actual asset delivered. Cash: cash paid based on final price. Most futures are closed before expiry.' },
  { q: 'What is a limit order?', a: 'An order to buy or sell at a specified price or better. Guarantees price but not execution.' },
  { q: 'What is the 60/40 tax rule for US futures?', a: 'Futures profits taxed as 60% long-term + 40% short-term capital gains, regardless of holding period.' },
  { q: 'What is variation margin?', a: 'The daily cash payment to/from the margin account based on mark-to-market. Also called daily settlement.' },
  { q: 'What is a stop order?', a: 'An order that becomes a market order when price reaches a specified level — used to limit losses or protect profits.' },
  { q: 'What happened to OTC markets post-2008?', a: 'Dodd-Frank and EMIR required standardized OTC derivatives to clear through CCPs and report to trade repositories.' },
  { q: 'What is open-outcry trading?', a: 'Traditional pit trading where traders shout and signal orders. Largely replaced by electronic trading systems.' },
  { q: 'How does maintenance margin differ from initial?', a: 'Maintenance margin (~75% of initial) is the minimum balance. Falling below it triggers a margin call to restore to initial margin.' },
]

const CARD_MAP = { ch1: CH1_CARDS, ch2: CH2_CARDS }

export default function FlashcardsTab({ chId, chData, store }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [order, setOrder] = useState(() => Array.from({ length: (CARD_MAP[chId] || CH1_CARDS).length }, (_, i) => i))

  const cards = CARD_MAP[chId] || CH1_CARDS
  const mastered = new Set(store.state.cardsMastered?.[chId] || [])

  const cardIdx = order[currentIdx]
  const card = cards[cardIdx]
  const pct = Math.round(currentIdx / cards.length * 100)

  const flip = () => setFlipped(f => !f)

  const next = () => {
    setFlipped(false)
    setTimeout(() => setCurrentIdx(i => (i + 1) % cards.length), 50)
  }

  const prev = () => {
    setFlipped(false)
    setTimeout(() => setCurrentIdx(i => (i - 1 + cards.length) % cards.length), 50)
  }

  const markKnown = () => {
    store.markCardMastered(chId, cardIdx)
    if (mastered.size + 1 >= 10) {
      store.unlockAchievement('fc_master')
      showNotif('🃏 Card Shark!', 'Mastered 10 flashcards!')
    }
    next()
  }

  const shuffle = () => {
    const shuffled = [...order]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setOrder(shuffled)
    setCurrentIdx(0)
    setFlipped(false)
    showNotif('🔀 Shuffled!', 'Cards in new order')
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <div>
          <div className="font-head font-bold text-sm">Flashcard Deck</div>
          <div className="text-xs text-slate-500 mt-0.5">Chapter {chData.num} · {cards.length} terms</div>
        </div>
        <div className="text-xs text-slate-500">Mastered: <span className="text-emerald font-mono">{mastered.size}/{cards.length}</span></div>
      </div>

      {/* Progress pips */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {order.map((cardI, i) => (
          <div key={i} className={`h-1 flex-1 min-w-[8px] rounded-full transition-all ${mastered.has(cardI) ? 'bg-emerald' : i < currentIdx ? 'bg-accent' : i === currentIdx ? 'bg-gold' : 'bg-surface'}`} />
        ))}
      </div>

      {/* Flip Card */}
      <div className="flip-card h-48 cursor-pointer select-none mb-4" onClick={flip}>
        <div className={`flip-card-inner relative w-full h-full`} style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.55s', transformStyle: 'preserve-3d' }}>
          {/* Front */}
          <div className="flip-card-front absolute inset-0 bg-bg-3 border border-white/15 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{ backfaceVisibility: 'hidden' }}>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">TERM</div>
            <div className="font-head font-semibold text-base text-white leading-snug">{card?.q}</div>
            <div className="text-[10px] text-slate-600 absolute bottom-4">tap to reveal</div>
          </div>
          {/* Back */}
          <div className="flip-card-back absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg,#111827,#0d2040)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(16,185,129,0.6)' }}>DEFINITION</div>
            <div className="text-sm text-emerald/90 leading-relaxed">{card?.a}</div>
            <div className="text-[10px] absolute bottom-4" style={{ color: 'rgba(16,185,129,0.4)' }}>tap to flip back</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prev} className="pill-btn">← Prev</button>
        <span className="font-mono text-xs text-slate-500">{currentIdx + 1} / {cards.length}</span>
        <button onClick={next} className="pill-btn">Next →</button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button onClick={markKnown} className="pill-btn bg-emerald/8 border-emerald/25 text-emerald hover:bg-emerald/15">✅ Got it!</button>
        <button onClick={next} className="pill-btn">🔄 Review Later</button>
        <button onClick={shuffle} className="pill-btn">🔀 Shuffle</button>
      </div>
    </div>
  )
}
