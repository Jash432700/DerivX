'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Sidebar from '@/components/ui/Sidebar'
import Notification from '@/components/ui/Notification'
import { useDerivXStore } from '@/lib/store'
import { CHAPTERS, ACHIEVEMENTS } from '@/lib/bookData'

const TABS = [
  { id: 'library', label: '📚 Book Library' },
  { id: 'progress', label: '🏆 Progress' },
  { id: 'achievements', label: '🎖️ Achievements' },
]

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('library')
  const { state, loaded } = useDerivXStore()

  const totalConceptsDone = Object.values(state.conceptsDone || {}).reduce((a, b) => a + b.length, 0)
  const totalProblems = Object.values(state.problemsSolved || {}).reduce((a, b) => a + b.length, 0)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} state={state} />
      <Notification />

      <div className="flex-1 overflow-y-auto flex flex-col bg-bg">
        {/* Topbar */}
        <div className="h-14 bg-bg-2 border-b border-white/[0.08] flex items-center px-4 gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-bg-4 transition-all"
          >
            <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor">
              <rect y="0" width="15" height="2" rx="1"/><rect y="5" width="15" height="2" rx="1"/><rect y="10" width="15" height="2" rx="1"/>
            </svg>
          </button>
          <div className="font-head font-bold text-sm text-white flex-1">Options, Futures & Derivatives</div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 text-[11px] rounded-lg transition-all hidden sm:block ${activeTab === t.id ? 'bg-surface text-accent' : 'text-slate-400 hover:text-white hover:bg-bg-4'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="font-mono text-xs text-emerald border border-emerald/25 px-2.5 py-1 rounded-lg">
            ₹{(state.balance || 50000).toLocaleString()}
          </div>
        </div>

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
          {/* Hero */}
          {activeTab === 'library' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* Hero Banner */}
              <div className="chapter-hero mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                <div className="font-mono text-xs text-accent mb-2 tracking-wider uppercase">Interactive Textbook</div>
                <h1 className="font-head text-4xl font-black text-white leading-tight mb-2">
                  Options, Futures<br />&amp; Other Derivatives
                </h1>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed mb-6">
                  John C. Hull · 11th Edition · Fully interactive — learn by simulating, trading, and solving real textbook problems. Not just reading.
                </p>
                <div className="flex gap-6 flex-wrap">
                  {[
                    { val: '37', lbl: 'Chapters' },
                    { val: '2', lbl: 'Active Now' },
                    { val: totalConceptsDone.toString(), lbl: 'Concepts Done' },
                    { val: totalProblems.toString(), lbl: 'Problems Solved' },
                  ].map(s => (
                    <div key={s.lbl}>
                      <div className="font-mono text-xl font-semibold text-accent">{s.val}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHAPTERS.map((ch, i) => {
                  const done = (state.conceptsDone?.[ch.id] || []).length
                  const isAvail = ch.status === 'available'
                  return (
                    <motion.div
                      key={ch.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {isAvail ? (
                        <Link href={`/chapters/${ch.id}`}>
                          <div className={`bg-bg-3 border rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:border-accent/30 hover:bg-bg-4 group ${done > 0 ? 'border-emerald/25' : 'border-white/[0.07]'}`}>
                            <div className="font-mono text-[11px] text-slate-500 mb-1">CH.{ch.num.toString().padStart(2, '0')}</div>
                            <div className="font-head font-bold text-sm text-white mb-1.5 group-hover:text-accent transition-colors leading-snug">{ch.title}</div>
                            <div className="text-[11px] text-slate-500 mb-3 leading-relaxed">{ch.topics}</div>
                            <div className="text-[11px] font-mono text-accent">▶ Available →</div>
                          </div>
                        </Link>
                      ) : (
                        <div className="bg-bg-3 border border-white/[0.04] rounded-xl p-5 opacity-40 cursor-not-allowed">
                          <div className="font-mono text-[11px] text-slate-500 mb-1">CH.{ch.num.toString().padStart(2, '0')}</div>
                          <div className="font-head font-bold text-sm text-slate-400 mb-1.5 leading-snug">{ch.title}</div>
                          <div className="text-[11px] text-slate-500 mb-3">{ch.topics}</div>
                          <div className="text-[11px] font-mono text-slate-500">🔒 Coming Soon</div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total XP', val: state.xp || 0, color: 'text-accent' },
                  { label: 'Level', val: state.level || 1, color: 'text-gold' },
                  { label: 'Concepts', val: totalConceptsDone, color: 'text-emerald' },
                  { label: 'Problems', val: totalProblems, color: 'text-purple-400' },
                ].map(s => (
                  <div key={s.label} className="bg-bg-3 border border-white/[0.07] rounded-xl p-4 text-center">
                    <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.val}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {['ch1', 'ch2'].map(chId => {
                const ch = CHAPTERS.find(c => c.id === chId)
                const done = (state.conceptsDone?.[chId] || []).length
                const total = chId === 'ch1' ? 10 : 11
                const pct = Math.round(done / total * 100)
                return (
                  <div key={chId} className="bg-bg-3 border border-white/[0.07] rounded-xl p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-head font-bold text-sm text-white">{ch?.title}</div>
                      <div className="font-mono text-xs text-accent">{done}/{total} concepts</div>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2">Quiz: {state.quizScores?.[chId] || 0}/10 · Problems: {(state.problemsSolved?.[chId] || []).length}</div>
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map(a => {
                  const earned = (state.achievements || []).includes(a.id)
                  return (
                    <div key={a.id} className={`bg-bg-3 border rounded-xl p-4 text-center transition-all ${earned ? 'border-gold/30 bg-gold/5' : 'border-white/[0.05] opacity-50'}`}>
                      <div className={`text-3xl mb-2 ${earned ? '' : 'grayscale'}`}>{a.icon}</div>
                      <div className={`font-head font-bold text-xs mb-1 ${earned ? 'text-gold' : 'text-slate-400'}`}>{a.name}</div>
                      <div className="text-[10px] text-slate-500">{a.desc}</div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
