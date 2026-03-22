'use client'
import { motion } from 'framer-motion'

export default function SummaryTab({ chId, chData }) {
  const summary = chData.summary
  if (!summary) return <div className="text-slate-400 text-sm">Summary not available.</div>

  return (
    <div>
      {/* Hero */}
      <div className="chapter-hero">
        <div className="font-mono text-xs text-accent mb-1 uppercase tracking-wider">Chapter {chData.num} · Key Summary</div>
        <h2 className="font-head text-xl font-black text-white mb-2">{chData.title}</h2>
        <p className="text-slate-300 text-sm font-medium italic">"{summary.tagline}"</p>
      </div>

      {/* Key Points */}
      <div className="card">
        <div className="card-title">💡 Core Concepts</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.keyPoints.map((pt, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-bg-4 border border-white/[0.06] rounded-xl p-4">
              <div className="text-xl mb-2">{pt.icon}</div>
              <div className="font-head font-bold text-sm text-white mb-2">{pt.title}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{pt.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Must Remember */}
      <div className="card">
        <div className="card-title">🧠 Must Remember</div>
        <div className="space-y-2">
          {summary.mustRemember.map((point, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex gap-3 items-start bg-bg-4 border border-white/[0.05] rounded-lg p-3">
              <span className="text-accent font-mono text-xs mt-0.5 flex-shrink-0">→</span>
              <span className="font-mono text-xs text-slate-200 leading-relaxed">{point}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Connections to Other Chapters */}
      {summary.connections && (
        <div className="card">
          <div className="card-title">🔗 Connections to Other Chapters</div>
          <div className="space-y-2">
            {summary.connections.map((conn, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-bg-4 rounded-lg border border-white/[0.05]">
                <span className="text-purple-400 text-xs mt-0.5 flex-shrink-0">↗</span>
                <span className="text-xs text-slate-300 leading-relaxed">{conn}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Minute Summary */}
      <div className="bg-gradient-to-br from-accent/8 to-purple-500/5 border border-accent/20 rounded-xl p-6">
        <div className="font-mono text-xs text-accent uppercase tracking-wider mb-3">⚡ 2-Minute Summary</div>
        <div className="space-y-2">
          {summary.keyPoints.slice(0, 4).map((pt, i) => (
            <div key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-gold flex-shrink-0">{i + 1}.</span>
              <span><strong className="text-white">{pt.title}:</strong> {pt.body.substring(0, 120)}...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
