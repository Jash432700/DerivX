'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { showNotif } from '@/components/ui/Notification'

const DIFF = {
  easy:   { label: 'Easy',   cls: 'text-emerald bg-emerald/8 border-emerald/25' },
  medium: { label: 'Medium', cls: 'text-gold bg-gold/8 border-gold/25' },
  hard:   { label: 'Hard',   cls: 'text-danger bg-danger/8 border-danger/25' },
}

export default function ProblemsTab({ chId, chData, store }) {
  const [tab, setTab] = useState('solved')
  const [openId, setOpenId] = useState(null)
  const [showSolution, setShowSolution] = useState({})
  const [userAnswers, setUserAnswers] = useState({})

  const solved = store.state.problemsSolved?.[chId] || []
  const problems = chData.problems || []
  const unsolved = chData.unsolvedProblems || []

  const markSolved = (problemId) => {
    if (!solved.includes(problemId)) {
      store.markProblemSolved(chId, problemId)
      showNotif('✅ Problem Solved!', '+30 XP earned')
      if ((solved.length + 1) >= 5) store.unlockAchievement('problem_solver')
    }
  }

  const toggleSolution = (id) => {
    setShowSolution(prev => ({ ...prev, [id]: !prev[id] }))
    markSolved(id)
  }

  return (
    <div>
      {/* Hero */}
      <div className="chapter-hero">
        <div className="font-mono text-xs text-accent mb-1 uppercase tracking-wider">Chapter {chData.num}</div>
        <h2 className="font-head text-xl font-black text-white mb-1">Practice Problems</h2>
        <p className="text-slate-400 text-sm">Textbook problems from Hull with worked solutions + unsolved exercises.</p>
        <div className="flex gap-4 mt-3">
          <div><div className="font-mono text-lg text-accent">{problems.length}</div><div className="text-[11px] text-slate-500">Solved Problems</div></div>
          <div><div className="font-mono text-lg text-gold">{unsolved.length}</div><div className="text-[11px] text-slate-500">Practice Exercises</div></div>
          <div><div className="font-mono text-lg text-emerald">{solved.length}</div><div className="text-[11px] text-slate-500">Completed</div></div>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('solved')} className={`px-4 py-2 rounded-lg text-sm transition-all ${tab === 'solved' ? 'bg-accent/15 border border-accent/30 text-accent' : 'bg-surface border border-white/10 text-slate-400 hover:text-white'}`}>
          📖 Textbook Problems ({problems.length})
        </button>
        <button onClick={() => setTab('practice')} className={`px-4 py-2 rounded-lg text-sm transition-all ${tab === 'practice' ? 'bg-accent/15 border border-accent/30 text-accent' : 'bg-surface border border-white/10 text-slate-400 hover:text-white'}`}>
          ✏️ Practice Exercises ({unsolved.length})
        </button>
      </div>

      {/* TEXTBOOK PROBLEMS with Solutions */}
      {tab === 'solved' && (
        <div className="space-y-4">
          {problems.map((p, i) => {
            const isSolved = solved.includes(p.id)
            const isOpen = openId === p.id
            const showSol = showSolution[p.id]
            const diff = DIFF[p.difficulty] || DIFF.medium
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className={`bg-bg-3 border rounded-xl overflow-hidden transition-all ${isSolved ? 'border-emerald/20' : 'border-white/[0.07]'}`}>
                  <div className="p-4 cursor-pointer" onClick={() => setOpenId(isOpen ? null : p.id)}>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">Hull {p.num}</span>
                      <span className={`text-[10px] border px-2 py-0.5 rounded-full ${diff.cls}`}>{diff.label}</span>
                      <span className="text-[10px] text-slate-500 bg-bg-4 px-2 py-0.5 rounded">{p.topic}</span>
                      {isSolved && <span className="text-[10px] text-emerald">✓ Solved</span>}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{p.problem}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{isOpen ? '▲ Collapse' : '▼ Expand'}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="border-t border-white/[0.07] p-4 space-y-3">
                          {/* Hints */}
                          {p.hints && (
                            <div className="bg-gold/5 border border-gold/15 rounded-lg p-3">
                              <div className="text-[10px] font-mono text-gold uppercase tracking-wider mb-2">💡 Hints</div>
                              <ul className="space-y-1">
                                {p.hints.map((h, j) => (
                                  <li key={j} className="text-xs text-slate-300 flex gap-2">
                                    <span className="text-gold flex-shrink-0">{j + 1}.</span>{h}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Try yourself area */}
                          {!showSol && (
                            <div>
                              <textarea
                                placeholder="Write your solution here before revealing the answer..."
                                value={userAnswers[p.id] || ''}
                                onChange={e => setUserAnswers(prev => ({ ...prev, [p.id]: e.target.value }))}
                                className="w-full bg-bg-2 border border-white/10 text-slate-200 p-3 rounded-lg text-xs font-mono leading-relaxed min-h-[80px] resize-y focus:outline-none focus:border-accent/40 placeholder-slate-600"
                              />
                              <button onClick={() => toggleSolution(p.id)}
                                className="mt-2 bg-accent/15 border border-accent/30 text-accent px-4 py-2 rounded-lg text-xs hover:bg-accent/25 transition-all">
                                🔍 Reveal Solution (+30 XP)
                              </button>
                            </div>
                          )}

                          {/* Solution */}
                          <AnimatePresence>
                            {showSol && (
                              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="text-[10px] font-mono text-emerald uppercase tracking-wider mb-2">✅ Full Solution</div>
                                <div className="bg-bg-2 border-l-2 border-emerald rounded-r-xl p-4">
                                  {p.solution.steps.map((line, j) => (
                                    <div key={j} className={`font-mono text-xs leading-relaxed ${line === '' ? 'h-2' : line.startsWith('Case') || line.startsWith('Step') ? 'text-gold font-semibold mt-1.5' : line.includes('✅') || line.includes('→') ? 'text-emerald' : line.includes('❌') ? 'text-danger' : 'text-slate-300'}`}>
                                      {line}
                                    </div>
                                  ))}
                                </div>
                                {p.solution.final && (
                                  <div className="mt-3 bg-emerald/8 border border-emerald/20 rounded-lg px-4 py-2.5">
                                    <span className="text-[10px] font-mono text-emerald uppercase tracking-wider">Final Answer: </span>
                                    <span className="font-mono text-sm text-white ml-2">{p.solution.final}</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* UNSOLVED PRACTICE PROBLEMS */}
      {tab === 'practice' && (
        <div className="space-y-4">
          <div className="bg-accent/7 border border-accent/20 rounded-xl p-4 text-sm text-slate-300">
            <strong className="text-accent">📝 Self-Test Mode:</strong> These problems have no shown solutions. Work them out yourself, then verify using the formulas and concepts you've learned.
          </div>
          {unsolved.map((p, i) => {
            const diff = DIFF[p.difficulty] || DIFF.medium
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="problem-card">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="problem-num">{p.num}</span>
                    <span className={`text-[10px] border px-2 py-0.5 rounded-full ${diff.cls}`}>{diff.label}</span>
                    <span className="text-[10px] text-slate-500 bg-bg-3 px-2 py-0.5 rounded">{p.topic}</span>
                  </div>
                  <p className="problem-text">{p.problem}</p>
                  <textarea
                    placeholder="Work out your solution here..."
                    value={userAnswers[p.id] || ''}
                    onChange={e => setUserAnswers(prev => ({ ...prev, [p.id]: e.target.value }))}
                    className="w-full bg-bg-2 border border-white/10 text-slate-200 p-3 rounded-lg text-xs font-mono leading-relaxed min-h-[100px] resize-y focus:outline-none focus:border-accent/40 placeholder-slate-600 mt-2"
                  />
                  <button onClick={() => { markSolved(p.id); showNotif('✅ Marked as Solved', '+30 XP') }}
                    className="mt-2.5 text-xs text-emerald border border-emerald/25 px-3 py-1.5 rounded-lg hover:bg-emerald/10 transition-all">
                    ✓ Mark as Solved (+30 XP)
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
