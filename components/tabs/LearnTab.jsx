'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { showNotif } from '@/components/ui/Notification'

// CH1 concepts
const CH1_CONCEPTS = [
  { id: 'derivative', icon: '🔗', name: 'What Is a Derivative?', short: 'Contract whose value depends on an underlying asset',
    body: `A <strong>derivative</strong> is a financial instrument whose value is <em>derived</em> from something else — the <em>underlying asset</em>. The underlying can be a stock, bond, commodity, currency, or interest rate.<br/><br/>
    Derivatives serve three economic purposes:<br/>
    <span style="color:#10b981">① Hedging</span> — reduce existing risk<br/>
    <span style="color:#5b8dff">② Speculation</span> — take on risk for profit<br/>
    <span style="color:#f59e0b">③ Arbitrage</span> — exploit mispricing for risk-free profit<br/><br/>
    The global OTC derivatives market exceeds <strong>$600 trillion</strong> notional — roughly 8× world GDP.`,
    eli5: 'Your mango farm is worried prices might drop. You make a deal: "I\'ll sell my mangoes at ₹50/kg in 3 months, no matter what." That deal\'s value changes as mango prices change — it\'s derived from mangoes. That\'s a derivative!' },

  { id: 'exchange', icon: '🏛️', name: 'Exchange-Traded Markets', short: 'Standardized contracts on regulated exchanges',
    body: `Exchange-traded derivatives trade on <strong>organized exchanges</strong> (NSE, BSE, CME, CBOE).<br/><br/>
    Key features:<br/>
    • <strong>Standardization:</strong> Fixed contract size, expiry, delivery<br/>
    • <strong>Central clearing:</strong> CCP is counterparty to all trades<br/>
    • <strong>Margin:</strong> Both parties post daily collateral<br/>
    • <strong>Transparency:</strong> Prices publicly visible<br/>
    • <strong>Liquidity:</strong> Easy entry/exit<br/><br/>
    The clearing house mechanism <em>virtually eliminates</em> counterparty default risk.`,
    eli5: "A stock exchange is like a mall where everyone buys the same-sized product. The mall manager (clearing house) guarantees every seller delivers and every buyer pays." },

  { id: 'otc', icon: '🤝', name: 'Over-the-Counter (OTC)', short: 'Custom bilateral contracts between two parties',
    body: `OTC derivatives are <strong>privately negotiated</strong> between two parties — usually large financial institutions.<br/><br/>
    • <strong>Customizable:</strong> Any terms can be agreed<br/>
    • <strong>Counterparty risk:</strong> One party may default<br/>
    • <strong>Less transparent:</strong> Prices not always public<br/>
    • <strong>Larger market:</strong> OTC dwarfs exchanges by notional value<br/><br/>
    Post-2008, <strong>Dodd-Frank</strong> (US) and <strong>EMIR</strong> (EU) pushed many OTC products to central clearing.`,
    eli5: "OTC is buying from your neighbor — you two agree on price and terms privately. But if your neighbor can't pay later, there's no mall manager to protect you. That's counterparty risk." },

  { id: 'forward', icon: '📅', name: 'Forward Contracts', short: 'Agreement to buy/sell at a future date for a set price today',
    body: `A <strong>forward contract</strong> is an OTC agreement to buy/sell an asset at a future date for a price agreed today (the <em>forward price</em> K).<br/><br/>
    <strong>Key properties:</strong><br/>
    • Zero upfront cost to enter<br/>
    • Both parties are <em>obligated</em> to transact<br/>
    • Long payoff = S<sub>T</sub> − K<br/>
    • Short payoff = K − S<sub>T</sub><br/><br/>
    <strong>Hull Example:</strong> US company needs £1M in 6 months. Enters forward at $1.49/£ → locks in exactly $1,490,000 cost regardless of future spot rate.`,
    eli5: "You love cricket bats. A maker says: 'I'll deliver your bat in 6 months and you'll pay ₹5,000 — agreed today.' Even if the bat costs ₹3,000 later, you pay ₹5,000. Locked in both ways." },

  { id: 'futures', icon: '⚡', name: 'Futures Contracts', short: 'Standardized forwards traded on exchanges with daily settlement',
    body: `<strong>Futures</strong> are standardized forward contracts traded on exchanges. Key differences from forwards:<br/><br/>
    • <strong>Standardized:</strong> Fixed sizes, dates, delivery specs<br/>
    • <strong>Exchange-traded:</strong> On organized markets<br/>
    • <strong>Daily mark-to-market:</strong> P&L settled every day<br/>
    • <strong>Highly liquid:</strong> Most positions closed before expiry<br/>
    • <strong>No delivery in practice:</strong> 98%+ never physically delivered<br/><br/>
    The daily settlement means gains/losses accumulate <em>continuously</em>, unlike forwards.`,
    eli5: "Futures are 'mall-approved forwards.' Same idea but standardized and exchange-traded. The mall resets your P&L every day — you can't let losses pile up silently." },

  { id: 'options', icon: '🎯', name: 'Options', short: 'Right but not obligation to buy (call) or sell (put)',
    body: `An <strong>option</strong> gives the holder the <em>right but not the obligation</em> to transact:<br/><br/>
    📈 <strong>Call:</strong> right to BUY at K → payoff = max(S<sub>T</sub>−K, 0)<br/>
    📉 <strong>Put:</strong> right to SELL at K → payoff = max(K−S<sub>T</sub>, 0)<br/><br/>
    The buyer pays a <strong>premium</strong> upfront. Key asymmetry:<br/>
    • Buyer's max loss = premium paid ✓<br/>
    • Buyer's gain = unlimited (calls) or up to K (puts)<br/><br/>
    Options provide insurance-like protection while preserving upside.`,
    eli5: "You pay ₹10,000 to 'hold' a house at ₹50L for 6 months. If prices rise to ₹60L → buy at ₹50L (profit!). If prices fall → just lose the ₹10,000 deposit. You had the RIGHT but not OBLIGATION. That's an option!" },

  { id: 'hedgers', icon: '🛡️', name: 'Hedgers', short: 'Use derivatives to reduce existing risk',
    body: `<strong>Hedgers</strong> use derivatives to reduce risk from exposures they already have. They're protecting, not speculating.<br/><br/>
    <strong>Hull's examples:</strong><br/>
    • US company expecting £1M payment → buys GBP forward → FX risk eliminated<br/>
    • Farmer → sells wheat futures → price risk eliminated<br/>
    • Airline → buys oil futures → fuel cost uncertainty eliminated<br/><br/>
    Hedgers willingly sacrifice potential gains to eliminate potential losses. Like buying insurance.`,
    eli5: "Hedgers pack umbrellas even on sunny days. Airlines buy oil futures because they KNOW they'll need fuel and can't afford surprises. They trade profit potential for certainty." },

  { id: 'speculators', icon: '📊', name: 'Speculators', short: 'Take positions to profit from price movements using leverage',
    body: `<strong>Speculators</strong> take positions to profit from price movements. They have no underlying exposure — deliberately taking on risk.<br/><br/>
    <strong>Key advantage:</strong> <em>Leverage.</em><br/>
    <strong>Hull's example:</strong> Investor expects GBP to rise:<br/>
    • Buy £250K spot: costs $367,500<br/>
    • Buy 4 futures contracts: requires only ~$20,000 margin<br/><br/>
    If GBP rises 2%: same $ gain, but 18× the return on capital with futures!<br/>
    If GBP falls 2%: same $ loss, but 18× the loss as % of capital.`,
    eli5: "A speculator doesn't own mangoes but bets on whether mango prices will rise. Derivatives let them control ₹10L worth of mangoes with just ₹50K (leverage). Exciting and dangerous!" },

  { id: 'arbitrageurs', icon: '🔄', name: 'Arbitrageurs', short: 'Exploit price inconsistencies for risk-free profit',
    body: `<strong>Arbitrageurs</strong> lock in risk-free profits by exploiting price inconsistencies — simultaneously buying cheap and selling expensive.<br/><br/>
    <strong>Hull's example:</strong><br/>
    Microsoft: $172 on NYSE, £124 on LSE. Rate: $1.43/£ → LSE = $177.32<br/>
    Buy on NYSE at $172, sell on LSE at $177.32 → <strong>$5.32 risk-free profit per share</strong><br/><br/>
    Arbitrage is self-eliminating — exploiting it causes prices to converge. In modern markets, algorithms close gaps in milliseconds.`,
    eli5: "If apples cost ₹5 in your town but ₹8 next door, buy here and sell there: ₹3 free profit! In finance, computers do this in microseconds. Everyone exploiting the gap makes prices equal quickly." },

  { id: 'dangers', icon: '⚠️', name: 'Dangers of Derivatives', short: 'How misuse leads to spectacular losses',
    body: `Hull dedicates space to derivative disasters — powerful reminders of what happens when these instruments are misused.<br/><br/>
    <strong>Famous disasters:</strong><br/>
    • <strong>Barings Bank (1995):</strong> Nick Leeson lost £830M on unauthorized Nikkei futures<br/>
    • <strong>LTCM (1998):</strong> Nobel winners' fund collapsed — excessive leverage<br/>
    • <strong>Orange County (1994):</strong> $1.7B loss from leveraged interest rate bets<br/>
    • <strong>Société Générale (2008):</strong> Jerome Kerviel, €4.9B unauthorized positions<br/><br/>
    Common thread: derivatives used for <em>hidden speculation without oversight.</em>`,
    eli5: "Derivatives are like fire. Used correctly → cook food. Used recklessly → burn everything down. Every disaster shares one pattern: someone using these tools to secretly speculate, hiding losses until they exploded." },
]

const CH2_CONCEPTS = [
  { id: 'ch2_bg', icon: '📜', name: 'Background & History', short: 'How futures markets evolved from grain trading',
    body: `Futures markets developed so farmers and merchants could <strong>fix prices in advance</strong> to manage risk.<br/><br/>
    <strong>Chicago Board of Trade (CBOT)</strong> founded 1848 — world's first futures exchange for grain.<br/><br/>
    Today, futures cover four major categories:<br/>
    🌾 Agricultural (wheat, corn, soybeans)<br/>
    🥇 Metals & Energy (gold, oil, gas)<br/>
    💱 Financial (stock indices, currencies, bonds)<br/>
    📈 Interest rates (T-bonds, SOFR)`,
    eli5: "Imagine you're a wheat farmer. In March, you don't know October wheat prices. So you call a Chicago trader and agree: 'I'll sell you wheat in October at $200/ton.' Now you know what you'll earn. That's why futures markets exist!" },

  { id: 'ch2_spec', icon: '📋', name: 'Contract Specification', short: 'Every detail standardized by the exchange',
    body: `Unlike forwards, every detail of a futures contract is <strong>specified by the exchange</strong>:<br/><br/>
    • <strong>Underlying asset:</strong> Exact quality (e.g., #2 Soft Red Winter Wheat)<br/>
    • <strong>Contract size:</strong> Fixed amount per contract (e.g., 5,000 bushels)<br/>
    • <strong>Delivery months:</strong> Specific calendar months available<br/>
    • <strong>Price quotes:</strong> Units and minimum tick size<br/>
    • <strong>Delivery procedure:</strong> How, where, and when<br/><br/>
    This standardization creates <strong>liquidity</strong> — millions can trade exactly the same thing.`,
    eli5: "A futures contract is like a standardized box everyone knows exactly. You know the size, quality, delivery date. Everyone knows what 'March Wheat' means, making it easy for millions to trade the same thing." },

  { id: 'ch2_conv', icon: '🎯', name: 'Convergence at Maturity', short: 'Futures price must equal spot price at expiry',
    body: `As a futures contract approaches <strong>maturity</strong>, its price must converge to the spot price. At expiry, futures price = spot price.<br/><br/>
    <strong>Why?</strong> Arbitrage enforces this:<br/>
    • F > S at expiry: buy spot, deliver via futures → free profit → prices equalize<br/>
    • F < S at expiry: buy futures, sell spot → free profit → prices equalize<br/><br/>
    <strong>Before maturity:</strong> Futures can trade at premium (Contango) or discount (Backwardation) to spot based on carry costs and convenience yields.`,
    eli5: "When a futures contract expires, its price MUST equal the current price. If they differed, everyone would rush to profit from the gap — that buying/selling pressure instantly equalizes prices." },

  { id: 'ch2_margin', icon: '💰', name: 'Margin Accounts', short: 'Daily mark-to-market settlement prevents loss accumulation',
    body: `Margins are the critical <strong>risk management mechanism</strong> in futures markets.<br/><br/>
    <strong>Initial margin:</strong> Deposit to open position (~5-15% of contract value)<br/>
    <strong>Mark-to-market:</strong> Daily P&L settled to/from margin account<br/>
    <strong>Maintenance margin:</strong> Minimum balance (~75% of initial)<br/>
    <strong>Margin call:</strong> If balance < maintenance → must top up to <em>initial</em> margin<br/><br/>
    <strong>Hull's Example:</strong> Buy 1 gold contract (100 oz) at $1,250. Initial margin = $6,000. Maintenance = $4,500.`,
    eli5: "Margin is like a security deposit when renting. You put down ₹5,000 (initial). Every day, the landlord checks if prices went up or down and adjusts your deposit. If it falls too low → 'Top it up!' That's a margin call." },

  { id: 'ch2_ccp', icon: '🏦', name: 'Central Counterparties (CCPs)', short: 'Clearing houses that eliminate counterparty risk',
    body: `A <strong>CCP</strong> inserts itself as buyer to every seller and seller to every buyer. This virtually eliminates counterparty risk.<br/><br/>
    <strong>CCP benefits:</strong><br/>
    • No counterparty risk — always dealing with CCP<br/>
    • Multilateral netting — reduces total collateral<br/>
    • Guarantee funds — pre-funded default protection<br/>
    • Transparency — all positions known centrally<br/><br/>
    <strong>Post-2008:</strong> Dodd-Frank and EMIR mandated CCP clearing for standardized OTC derivatives (IRS, CDS).`,
    eli5: "CCPs are like a super-trusted middleman. Instead of A trading directly with B, the CCP steps in: A trades with CCP, B trades with CCP. If B fails, the CCP pays A anyway using a safety fund collected from everyone." },

  { id: 'ch2_otc2008', icon: '🔄', name: 'OTC Markets Post-2008', short: 'How regulations transformed OTC derivatives after the crisis',
    body: `The 2008 crisis exposed dangerous OTC counterparty risk concentrations. Regulatory response:<br/><br/>
    • <strong>Mandatory central clearing:</strong> Standardized OTC must use CCPs<br/>
    • <strong>Trade repositories:</strong> All OTC trades must be reported<br/>
    • <strong>Margin requirements:</strong> Bilateral OTC requires IM + VM<br/>
    • <strong>Capital requirements:</strong> Higher capital for uncleared OTC<br/><br/>
    <strong>SEFs:</strong> Swap Execution Facilities — electronic platforms making OTC more exchange-like.`,
    eli5: "Before 2008, banks traded huge derivative contracts privately with no referee. After the crisis, regulators said: 'Now all big derivative bets must go through a clearing house referee.' Safer but more expensive." },

  { id: 'ch2_quotes', icon: '📊', name: 'Market Quotes & Open Interest', short: 'How to read futures price tables',
    body: `A futures price table contains:<br/><br/>
    • <strong>Open/High/Low:</strong> Intraday price range<br/>
    • <strong>Settle:</strong> Official closing price (used for mark-to-market)<br/>
    • <strong>Change:</strong> vs previous settlement<br/>
    • <strong>Open Interest:</strong> Total outstanding contracts<br/>
    • <strong>Volume:</strong> Contracts traded today<br/><br/>
    <strong>Open interest</strong> increases when BOTH parties are new to market. Decreases when positions are closed.`,
    eli5: "Reading a futures table is like reading a cricket scorecard. 'Open interest' = how many people are still in the game. 'Volume' = how many trades happened today. 'Settlement price' = official score at close." },

  { id: 'ch2_delivery', icon: '🚚', name: 'Delivery', short: 'Physical vs cash settlement — most futures are never delivered',
    body: `Most futures contracts are <strong>never physically delivered</strong> — traders close before expiry. But delivery mechanisms matter.<br/><br/>
    <strong>Settlement types:</strong><br/>
    • <strong>Physical delivery:</strong> Actual asset delivered (agricultural, some metals)<br/>
    • <strong>Cash settlement:</strong> Cash paid based on final price (stock indices, interest rates)<br/><br/>
    <strong>Delivery process:</strong><br/>
    1. Short submits notice of intention<br/>
    2. Exchange assigns to a long holder<br/>
    3. Short delivers asset, long pays invoice price`,
    eli5: "If you have a wheat futures contract, theoretically you'd receive actual wheat trucks. But 98% of traders close their position before that — they just collect the cash difference. Like booking a hotel room to resell it, not to stay." },

  { id: 'ch2_orders', icon: '👥', name: 'Order Types', short: 'Market, limit, stop, and stop-limit orders explained',
    body: `Key order types in futures markets:<br/><br/>
    • <strong>Market order:</strong> Execute immediately at best available price<br/>
    • <strong>Limit order:</strong> Execute only at specified price or better<br/>
    • <strong>Stop order:</strong> Becomes market order when price hits trigger<br/>
    • <strong>Stop-limit:</strong> Becomes limit order when triggered<br/>
    • <strong>Fill-or-kill (FOK):</strong> Execute immediately or cancel entirely<br/><br/>
    Market orders guarantee execution. Limit orders guarantee price but not execution.`,
    eli5: "When you want to buy: 'Buy NOW at any price' = market order. 'Only buy if it falls to ₹100' = limit order. 'If it falls to ₹100, then sell everything' = stop order." },

  { id: 'ch2_fwdfut', icon: '⚖️', name: 'Forward vs Futures Comparison', short: 'Detailed differences in mechanics and pricing',
    body: `<table style="width:100%;font-size:0.8rem;border-collapse:collapse">
    <tr style="color:#5b8dff"><th style="text-align:left;padding:4px 8px">Feature</th><th style="padding:4px 8px">Futures</th><th style="padding:4px 8px;color:#a78bfa">Forward</th></tr>
    <tr style="border-top:1px solid rgba(255,255,255,0.06)"><td style="padding:4px 8px;color:#64748b">Market</td><td style="padding:4px 8px">Exchange</td><td style="padding:4px 8px;color:#a78bfa">OTC</td></tr>
    <tr><td style="padding:4px 8px;color:#64748b">Standardized</td><td style="padding:4px 8px">Yes</td><td style="padding:4px 8px;color:#a78bfa">No — custom</td></tr>
    <tr style="border-top:1px solid rgba(255,255,255,0.06)"><td style="padding:4px 8px;color:#64748b">Settlement</td><td style="padding:4px 8px">Daily MTM</td><td style="padding:4px 8px;color:#a78bfa">At maturity</td></tr>
    <tr><td style="padding:4px 8px;color:#64748b">Counterparty risk</td><td style="padding:4px 8px">Minimal (CCP)</td><td style="padding:4px 8px;color:#a78bfa">Significant</td></tr>
    <tr style="border-top:1px solid rgba(255,255,255,0.06)"><td style="padding:4px 8px;color:#64748b">Upfront cost</td><td style="padding:4px 8px">Margin required</td><td style="padding:4px 8px;color:#a78bfa">Zero</td></tr>
    </table>`,
    eli5: "Forwards and futures are like taxis vs Ola. Taxi (forward): agree on price privately, pay at destination, hope driver shows up. Ola (futures): standardized pricing, tracked by platform, small fee upfront, platform guarantees the ride." },

  { id: 'ch2_reg', icon: '⚖️', name: 'Regulation & Accounting', short: 'CFTC, hedge accounting, and the 60/40 tax rule',
    body: `<strong>US Regulation:</strong><br/>
    • <strong>CFTC</strong> (Commodity Futures Trading Commission): Main regulator<br/>
    • <strong>NFA</strong>: Self-regulatory body<br/>
    • Exchange rules (CME rulebook)<br/><br/>
    <strong>Accounting:</strong><br/>
    • Hedging futures: gains/losses match timing of hedged item<br/>
    • Speculative futures: mark-to-market immediately through P&L<br/><br/>
    <strong>US Tax (60/40 Rule):</strong><br/>
    Futures profits: 60% long-term + 40% short-term capital gains regardless of holding period.`,
    eli5: "Futures markets have referees (CFTC). For accounting, hedgers don't have to show daily ups/downs. Speculators do. The 60/40 tax rule is a US perk — futures profits taxed more favorably than stocks." },
]

const CONCEPT_MAP = { ch1: CH1_CONCEPTS, ch2: CH2_CONCEPTS }

export default function LearnTab({ chId, chData, store }) {
  const [activeConcept, setActiveConcept] = useState(null)
  const [showELI5, setShowELI5] = useState(false)
  const concepts = CONCEPT_MAP[chId] || []
  const doneConcepts = new Set(store.state.conceptsDone?.[chId] || [])

  const openConcept = (c) => {
    setActiveConcept(c)
    setShowELI5(false)
    if (!doneConcepts.has(c.id)) {
      store.addXP(3)
    }
  }

  const markDone = () => {
    if (!activeConcept) return
    store.markConceptDone(chId, activeConcept.id)
    showNotif('✓ Concept learned!', activeConcept.name)
    if (!store.state.achievements?.includes('first_concept')) {
      store.unlockAchievement('first_concept')
    }
    const totalDone = (store.state.conceptsDone?.[chId] || []).length + 1
    if (totalDone >= concepts.length) {
      store.unlockAchievement(chId === 'ch1' ? 'ch1_complete' : 'ch2_complete')
      showNotif('🏆 Chapter Complete!', `All ${concepts.length} concepts mastered`)
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className="chapter-hero">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="font-mono text-xs text-accent mb-1 tracking-wider uppercase">Chapter {chData.num}</div>
        <h1 className="font-head text-2xl font-black text-white mb-2">{chData.title}</h1>
        <p className="text-slate-400 text-sm max-w-lg leading-relaxed">{chData.summary?.tagline}</p>
        <div className="flex gap-6 mt-4 flex-wrap">
          <div><div className="font-mono text-lg text-accent font-semibold">{doneConcepts.size}/{concepts.length}</div><div className="text-[11px] text-slate-500">Concepts</div></div>
          <div><div className="font-mono text-lg text-gold font-semibold">{store.state.quizScores?.[chId] || 0}/10</div><div className="text-[11px] text-slate-500">Quiz Score</div></div>
          <div><div className="font-mono text-lg text-emerald font-semibold">{(store.state.problemsSolved?.[chId] || []).length}</div><div className="text-[11px] text-slate-500">Problems</div></div>
        </div>
      </div>

      {/* Concept Grid */}
      <div className="card">
        <div className="card-title">🗺️ Concept Map — Click to Explore</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {concepts.map((c, i) => {
            const isDone = doneConcepts.has(c.id)
            const isActive = activeConcept?.id === c.id
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => openConcept(c)}
                className={`relative bg-bg-4 border rounded-xl p-3.5 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-white/20 ${isDone ? 'border-emerald/30' : 'border-white/[0.06]'} ${isActive ? 'border-accent/50 bg-accent/5' : ''}`}>
                {isDone && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald" />}
                <div className="text-2xl mb-2">{c.icon}</div>
                <div className="font-head font-semibold text-xs text-white mb-1 leading-tight">{c.name}</div>
                <div className="text-[10px] text-slate-500 leading-snug">{c.short}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Concept Detail */}
      <AnimatePresence>
        {activeConcept && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card border-accent/20">
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div className="font-head font-bold text-base text-white">{activeConcept.icon} {activeConcept.name}</div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setShowELI5(!showELI5)} className={`pill-btn ${showELI5 ? 'pill-btn-accent' : ''}`}>🧒 ELI5</button>
                <button onClick={markDone} className={`pill-btn ${doneConcepts.has(activeConcept.id) ? 'bg-emerald/10 border-emerald/30 text-emerald' : ''}`}>
                  {doneConcepts.has(activeConcept.id) ? '✓ Learned' : '✓ Mark Done'}
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: activeConcept.body }} />

            <AnimatePresence>
              {showELI5 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-accent/7 border-l-2 border-accent rounded-r-xl px-4 py-3 overflow-hidden">
                  <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-2">Simple Version</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{activeConcept.eli5}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
