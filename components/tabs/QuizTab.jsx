'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { showNotif } from '@/components/ui/Notification'

const CH1_QUIZ = [
  { q: 'A forward contract differs from a futures contract in that forwards are:', opts: ['Traded on exchanges', 'OTC and customized', 'Always physically settled', 'Marked to market daily'], ans: 1, fb: 'Forwards are OTC (privately negotiated) and customized. Futures are standardized and exchange-traded with daily marking.' },
  { q: 'An airline buys oil futures to lock in fuel costs for 6 months. The airline is acting as a:', opts: ['Speculator', 'Arbitrageur', 'Hedger', 'Market Maker'], ans: 2, fb: 'The airline hedges — it uses derivatives to reduce an existing business risk (fuel price uncertainty).' },
  { q: 'Long forward payoff at maturity is:', opts: ['K − S_T', 'S_T − K', 'max(S_T − K, 0)', 'min(S_T − K, 0)'], ans: 1, fb: 'Long forward payoff = S_T − K. The long party profits when spot at maturity exceeds the agreed forward price.' },
  { q: 'Which is TRUE about exchange-traded derivatives?', opts: ['Higher counterparty risk', 'Fully customizable', 'Clearing house guarantees settlement', 'More flexible than OTC'], ans: 2, fb: 'The clearing house is the key feature — it becomes counterparty to all trades, virtually eliminating default risk.' },
  { q: 'A trader simultaneously buys gold in Mumbai at ₹5,500/g and sells in Delhi at ₹5,570/g (transport = ₹30/g). She is:', opts: ['Hedging', 'Speculating', 'Arbitraging', 'Market making'], ans: 2, fb: 'She exploits a price discrepancy (net ₹40/g risk-free profit) — the definition of arbitrage.' },
  { q: 'The maximum loss for a BUYER of a call option is:', opts: ['Unlimited', 'The premium paid', 'S_T minus K', 'Strike price'], ans: 1, fb: "The option buyer's max loss is always capped at the premium paid. This asymmetric risk is the key advantage of options." },
  { q: 'Which market is typically LARGER by notional value?', opts: ['Exchange-traded', 'OTC derivatives', 'They are equal', 'Spot markets'], ans: 1, fb: 'OTC markets are much larger by notional value (hundreds of trillions $), though regulation has pushed some to central clearing.' },
  { q: 'Barings Bank (1995) is an example of:', opts: ['Successful hedging', 'Profitable arbitrage', 'Dangers of uncontrolled speculation', 'Efficient OTC trading'], ans: 2, fb: "Nick Leeson made unauthorized speculative futures bets, losing £830M and bankrupting the bank. Hull's 'Dangers' section." },
  { q: 'Short forward payoff when K=₹5,000 and S_T=₹4,800:', opts: ['−₹200', '+₹200', '+₹5,000', 'Zero'], ans: 1, fb: 'Short payoff = K − S_T = 5,000 − 4,800 = +₹200. Short party profits when spot falls below the forward price.' },
  { q: 'Options differ from forwards because options give:', opts: ['Obligation to buy', 'Right but not obligation', 'Higher leverage only', 'Exchange-only access'], ans: 1, fb: 'Fundamental distinction: options give the RIGHT but not the OBLIGATION. Forwards/futures obligate both parties.' },
]

const CH2_QUIZ = [
  { q: 'The initial margin in a futures account is best described as:', opts: ['The total contract value', 'A deposit to cover potential daily losses', 'The forward price', 'The option premium'], ans: 1, fb: "Initial margin is a performance bond — a deposit (typically 5-15% of contract value) ensuring you can cover potential losses." },
  { q: "If futures price > spot price, the market is in:", opts: ['Backwardation', 'Contango', 'Normal backwardation', 'Equilibrium'], ans: 1, fb: 'Contango: futures price exceeds spot. Common when storage costs or carry costs exist (e.g., oil has storage costs).' },
  { q: '"Mark to market" in futures means:', opts: ['Setting the fair value once a year', 'Daily settlement of gains and losses via margin', 'Adjusting strike price to current market', 'Publishing settlement prices monthly'], ans: 1, fb: "Mark to market = daily P&L settlement. Each day's change in futures price is added to or deducted from your margin account." },
  { q: 'A CCP (Central Counterparty) eliminates:', opts: ['Market risk', 'Counterparty risk', 'Basis risk', 'Delivery risk'], ans: 1, fb: 'CCPs virtually eliminate counterparty risk by becoming buyer to every seller and seller to every buyer, backed by guarantee funds.' },
  { q: 'Why MUST futures prices converge to spot price at maturity?', opts: ['Exchange regulation', 'Arbitrage eliminates any difference', 'Both parties agree to it', 'The CFTC requires it'], ans: 1, fb: 'Arbitrage: if futures ≠ spot at expiry, risk-free profits exist. Traders instantly exploit this, forcing convergence.' },
  { q: 'Open interest INCREASES when:', opts: ['A new buyer and new seller transact', 'An existing position is closed', 'A contract is physically delivered', 'Settlement occurs'], ans: 0, fb: 'Open interest = number of outstanding contracts. Increases only when BOTH sides are new to the market.' },
  { q: 'What is a margin call?', opts: ['A profit distribution', 'Request to top up when balance < maintenance', 'A call option on margins', 'Daily mark-to-market payment'], ans: 1, fb: 'When your margin account falls below the maintenance margin, the broker issues a margin call — top up to initial margin.' },
  { q: 'Post-2008 regulation (Dodd-Frank) primarily required:', opts: ['All OTC derivatives to be exchange-listed', 'Standardized OTC derivatives to clear through CCPs', 'Higher option premiums', 'Elimination of credit derivatives'], ans: 1, fb: 'Dodd-Frank required standardized OTC derivatives (interest rate swaps, CDSs) to clear through CCPs to reduce systemic risk.' },
  { q: 'The maintenance margin is:', opts: ['Equal to initial margin', 'Usually higher than initial margin', 'Usually lower (~75% of initial margin)', 'Always zero'], ans: 2, fb: 'Maintenance margin is typically ~75% of initial. If balance falls below it, margin call to restore to initial margin.' },
  { q: 'Physical delivery in futures contracts occurs:', opts: ['For all futures at expiry', 'For most index futures', 'Rarely — most positions are closed before', 'Only for commodity futures legally'], ans: 2, fb: 'The vast majority of futures (typically 98%+) are closed out before expiry. Physical delivery is technically possible but rare.' },
]

const QUIZ_MAP = { ch1: CH1_QUIZ, ch2: CH2_QUIZ }

export default function QuizTab({ chId, chData, store }) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [chosen, setChosen] = useState(null)
  const [done, setDone] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState([])

  const questions = QUIZ_MAP[chId] || CH1_QUIZ

  const answer = (optIdx) => {
    if (answered) return
    setAnswered(true)
    setChosen(optIdx)
    const isCorrect = optIdx === questions[idx].ans
    if (isCorrect) setScore(s => s + 1)
    else setWrongAnswers(w => [...w, { q: questions[idx], chosen: optIdx }])
  }

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true)
      const finalScore = score + (chosen === questions[idx].ans ? 0 : 0) // already counted
      store.setQuizScore(chId, score)
      if (score >= 8) store.unlockAchievement(chId === 'ch1' ? 'quiz_ace_1' : 'quiz_ace_2')
      showNotif(`Quiz Complete! 🎯`, `Score: ${score}/${questions.length}`)
    } else {
      setIdx(i => i + 1)
      setAnswered(false)
      setChosen(null)
    }
  }

  const restart = () => {
    setIdx(0); setScore(0); setAnswered(false); setChosen(null); setDone(false); setWrongAnswers([])
    store.setQuizScore(chId, 0)
  }

  if (done) {
    const pct = Math.round(score / questions.length * 100)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto">
        <div className="card text-center py-10">
          <div className="text-6xl mb-4">{pct >= 80 ? '🎯' : pct >= 60 ? '👍' : '📚'}</div>
          <div className="font-head text-5xl font-black text-accent mb-2">{score}/{questions.length}</div>
          <div className="text-slate-300 mb-1">{pct}% — {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good work!' : 'Keep studying!'}</div>
          <div className="text-sm text-slate-500 mb-6">Earned <strong className="text-gold">{score * 20} XP</strong></div>

          {wrongAnswers.length > 0 && (
            <div className="text-left mb-6">
              <div className="text-xs font-mono text-danger uppercase tracking-wider mb-3">Review Mistakes</div>
              <div className="space-y-3">
                {wrongAnswers.map((w, i) => (
                  <div key={i} className="bg-bg-4 border border-danger/15 rounded-lg p-3 text-xs">
                    <div className="text-slate-200 mb-1.5">{w.q.q}</div>
                    <div className="text-danger">✕ You chose: {w.q.opts[w.chosen]}</div>
                    <div className="text-emerald">✓ Correct: {w.q.opts[w.q.ans]}</div>
                    <div className="text-slate-400 mt-1.5 italic">{w.q.fb}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={restart} className="exec-btn">🔄 Try Again</button>
        </div>
      </motion.div>
    )
  }

  const q = questions[idx]
  const dotColors = Array.from({ length: questions.length }, (_, i) => i < idx ? 'bg-emerald' : i === idx ? 'bg-gold w-4 rounded-sm' : 'bg-surface')

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="font-head text-lg font-bold mb-1">Chapter {chData.num} Quiz</div>
        <div className="text-slate-500 text-xs mb-3">{questions.length} Questions · Instant Feedback</div>
        <div className="flex gap-1 justify-center flex-wrap">
          {dotColors.map((cls, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${cls} ${i === idx ? 'w-4' : 'w-2'}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card">
          <div className="font-mono text-xs text-slate-500 mb-3">QUESTION {idx + 1} OF {questions.length}</div>
          <div className="font-head font-semibold text-base text-white leading-snug mb-5">{q.q}</div>

          <div className="space-y-2.5">
            {q.opts.map((opt, i) => {
              let cls = 'bg-bg-4 border-white/[0.07] text-slate-300 hover:border-white/20 hover:text-white'
              if (answered) {
                if (i === q.ans) cls = 'bg-emerald/10 border-emerald/40 text-emerald'
                else if (i === chosen) cls = 'bg-danger/8 border-danger/35 text-danger'
                else cls = 'bg-bg-4 border-white/[0.04] text-slate-500'
              }
              return (
                <button key={i} onClick={() => answer(i)} disabled={answered}
                  className={`w-full text-left border rounded-xl px-4 py-3 text-sm transition-all ${cls} ${!answered ? 'cursor-pointer' : 'cursor-default'}`}>
                  <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3.5 rounded-xl border text-sm leading-relaxed ${chosen === q.ans ? 'bg-emerald/7 border-emerald/20 text-emerald/90' : 'bg-danger/7 border-danger/20 text-danger/90'}`}>
                {chosen === q.ans ? '✅' : '❌'} {q.fb}
              </motion.div>
            )}
          </AnimatePresence>

          {answered && (
            <button onClick={next} className="exec-btn mt-4 w-full">
              {idx + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
