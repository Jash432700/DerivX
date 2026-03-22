'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { showNotif } from '@/components/ui/Notification'

const CH1_SLIDES = [
  { title: 'What Is a Derivative?', body: 'A <mark>contract whose value depends on an underlying asset</mark>. Underlying = stocks, bonds, commodities, currencies. Used for hedging (reduce risk), speculation (profit from moves), and arbitrage (risk-free profit from price gaps).' },
  { title: 'Two Market Types', body: '<mark>Exchanges</mark>: standardized, clearing house guarantees, transparent, requires margin. <mark>OTC</mark>: customized, bilateral, counterparty risk, more flexible. OTC is bigger by notional value but riskier.' },
  { title: 'Forward vs Futures', body: 'Both lock in a future price. <mark>Forwards</mark> = OTC, customized, settled at maturity, zero upfront cost. <mark>Futures</mark> = exchange-traded, standardized, marked to market daily. Most futures traders never take delivery.' },
  { title: 'Options: Asymmetric Risk', body: 'Calls = right to BUY. Puts = right to SELL. Buyer pays a <mark>premium</mark> for the right. Max loss for buyer = premium. Max gain = unlimited (calls). This asymmetry = financial insurance.' },
  { title: 'The Three Trader Types', body: '<mark>Hedgers</mark>: reduce existing risk (airlines, farmers). <mark>Speculators</mark>: take risk for profit using leverage. <mark>Arbitrageurs</mark>: exploit price gaps for risk-free profit. All three are essential to market efficiency.' },
  { title: 'Leverage & Danger', body: 'Derivatives offer massive <mark>leverage</mark>. Control £1M of futures with $20K margin. Profits AND losses amplified. Famous disasters: Barings Bank (£830M), LTCM, Orange County — all from speculation without controls.' },
  { title: 'Chapter 1 Summary', body: 'Derivatives = contracts based on underlying assets. Two markets (exchange vs OTC). Three instruments (forwards, futures, options). Three trader types (hedger, speculator, arbitrageur). Power comes with danger — know both.' },
]

const CH2_SLIDES = [
  { title: 'Why Futures Markets Exist', body: 'Futures developed so farmers/merchants could <mark>fix prices in advance</mark>. Chicago Board of Trade (1848) was first. Today: agricultural, metals, energy, financial, and interest rate futures all exist.' },
  { title: 'Contract Specification', body: 'Every futures detail is <mark>standardized by the exchange</mark>: asset quality, contract size, delivery month, location, minimum price move. Standardization creates liquidity and lets millions trade the same thing.' },
  { title: 'Margin Mechanics', body: '<mark>Initial margin</mark> = deposit to open. <mark>Mark to market</mark> = daily P&L settlement. <mark>Maintenance margin</mark> = minimum level (~75% of initial). <mark>Margin call</mark> = top up when balance falls below maintenance.' },
  { title: 'CCPs: The Safety Net', body: 'Central Counterparties step in as <mark>buyer to every seller, seller to every buyer</mark>. Virtually eliminate counterparty risk. Post-2008, regulators made CCPs mandatory for standardized OTC derivatives.' },
  { title: 'Convergence Principle', body: 'As expiry approaches, <mark>futures price must equal spot price</mark>. If they differ, arbitrage profits exist and traders immediately exploit them until prices converge. Self-correcting mechanism.' },
  { title: 'Contango & Backwardation', body: '<mark>Contango</mark>: futures > spot (normal for commodities with storage costs). <mark>Backwardation</mark>: futures < spot (when asset is scarce now or has convenience yield). Both reflect carrying costs.' },
  { title: 'Post-2008 Reform', body: 'Dodd-Frank (US) + EMIR (EU) transformed OTC markets: <mark>mandatory CCP clearing</mark>, trade reporting, margin requirements for bilateral OTC. Made markets safer but more expensive to operate.' },
  { title: 'Chapter 2 Summary', body: 'Futures = standardized forwards on exchanges. Margin accounts prevent loss accumulation (daily MTM). CCPs eliminate counterparty risk. Prices converge at maturity (arbitrage enforces this). Post-2008 reforms brought safety to OTC too.' },
]

const SLIDE_MAP = { ch1: CH1_SLIDES, ch2: CH2_SLIDES }

export default function SpeedLearnTab({ chId, chData, store }) {
  const [idx, setIdx] = useState(0)
  const slides = SLIDE_MAP[chId] || CH1_SLIDES

  const next = () => {
    if (idx < slides.length - 1) {
      setIdx(i => i + 1)
      store.addXP(5)
    } else {
      store.unlockAchievement('speed_done')
      store.addXP(20)
      showNotif('⚡ Speed Learn Complete!', 'All slides reviewed')
    }
  }

  const prev = () => idx > 0 && setIdx(i => i - 1)

  const slide = slides[idx]

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-5">
        <div className="font-head font-bold text-lg mb-1">⚡ Speed Learn</div>
        <div className="text-slate-500 text-xs">Master Chapter {chData.num} essentials fast — {slides.length} slides</div>
      </div>

      {/* Progress pips */}
      <div className="flex gap-1.5 mb-5">
        {slides.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)}
            className={`h-1 flex-1 rounded-full cursor-pointer transition-all ${i < idx ? 'bg-accent' : i === idx ? 'bg-gold' : 'bg-surface'}`} />
        ))}
      </div>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <div className="bg-gradient-to-br from-bg-3 to-bg-4 border border-white/10 rounded-2xl p-6 mb-4 min-h-[180px]">
            <div className="font-mono text-[10px] text-accent uppercase tracking-widest mb-3">
              Slide {idx + 1} / {slides.length}
            </div>
            <div className="font-head text-lg font-bold text-white mb-4">{slide.title}</div>
            <div className="text-sm text-slate-300 leading-8"
              dangerouslySetInnerHTML={{
                __html: slide.body.replace(/<mark>(.*?)<\/mark>/g,
                  '<span style="color:#f59e0b;font-weight:600">$1</span>')
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex gap-3">
        <button onClick={prev} disabled={idx === 0}
          className="flex-1 bg-surface border border-white/10 text-slate-300 py-2.5 rounded-xl text-sm disabled:opacity-30 hover:text-white transition-all">
          ← Back
        </button>
        <button onClick={next}
          className="flex-1 bg-gradient-to-r from-accent to-purple-500 border-0 text-white py-2.5 rounded-xl text-sm font-semibold hover:-translate-y-0.5 transition-all">
          {idx === slides.length - 1 ? '✅ Complete!' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
