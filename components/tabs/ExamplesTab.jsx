'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DIFF_COLORS = { easy: 'text-emerald border-emerald/25 bg-emerald/8', medium: 'text-gold border-gold/25 bg-gold/8', hard: 'text-danger border-danger/25 bg-danger/8' }

export default function ExamplesTab({ chId, chData }) {
  const [openId, setOpenId] = useState(null)
  const examples = chData.examples || []

  return (
    <div>
      <div className="chapter-hero">
        <div className="font-mono text-xs text-accent mb-1 uppercase tracking-wider">Chapter {chData.num}</div>
        <h2 className="font-head text-xl font-black text-white mb-1">Worked Examples</h2>
        <p className="text-slate-400 text-sm">Step-by-step solutions to key textbook examples from Hull.</p>
        <div className="flex gap-4 mt-3">
          <div><div className="font-mono text-lg text-accent">{examples.length}</div><div className="text-[11px] text-slate-500">Examples</div></div>
        </div>
      </div>

      <div className="space-y-4">
        {examples.map((ex, i) => (
          <motion.div key={ex.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div className={`bg-bg-3 border rounded-xl overflow-hidden transition-all ${openId === ex.id ? 'border-accent/30' : 'border-white/[0.07] hover:border-white/15'}`}>
              {/* Header */}
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setOpenId(openId === ex.id ? null : ex.id)}>
                <div className="font-mono text-xs text-accent bg-accent/10 px-2.5 py-1 rounded-lg flex-shrink-0">
                  Ex {ex.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-head font-semibold text-sm text-white">{ex.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{ex.scenario}</div>
                </div>
                <div className="flex items-center gap-2">
                  {ex.tags?.map(tag => (
                    <span key={tag} className="hidden sm:inline text-[10px] bg-surface text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                  <span className="text-slate-500 text-sm transition-transform" style={{ transform: openId === ex.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {openId === ex.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="border-t border-white/[0.07] p-4 space-y-4">
                      {/* Problem */}
                      <div>
                        <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">Problem</div>
                        <p className="text-sm text-slate-200 leading-relaxed bg-bg-4 rounded-lg p-3.5 border border-white/[0.06]">
                          {ex.problem}
                        </p>
                      </div>

                      {/* Solution */}
                      <div>
                        <div className="text-[10px] font-mono text-emerald uppercase tracking-wider mb-2">Step-by-Step Solution</div>
                        <div className="bg-bg-2 border-l-2 border-emerald rounded-r-xl p-4 space-y-1">
                          {ex.solution.map((line, j) => (
                            <div key={j} className={`font-mono text-xs leading-relaxed ${line === '' ? 'h-2' : line.startsWith('Case') || line.startsWith('Step') || line.startsWith('Part') ? 'text-gold font-semibold mt-2' : line.includes('→') ? 'text-emerald' : 'text-slate-300'}`}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Insight */}
                      {ex.insight && (
                        <div className="bg-accent/7 border border-accent/20 rounded-xl p-4">
                          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">💡 Hull's Insight</div>
                          <p className="text-sm text-slate-300 leading-relaxed">{ex.insight}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
