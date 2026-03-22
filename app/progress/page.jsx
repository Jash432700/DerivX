'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Sidebar from '@/components/ui/Sidebar'
import Notification from '@/components/ui/Notification'
import { useDerivXStore, levelName } from '@/lib/store'
import { ACHIEVEMENTS, CHAPTERS } from '@/lib/bookData'

export default function ProgressPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { state } = useDerivXStore()
  const lvl = state.level || 1
  const xpPct = (state.xp || 0) % 100

  const totalConcepts = 21 // ch1: 10, ch2: 11
  const doneConcepts = Object.values(state.conceptsDone || {}).reduce((a, b) => a + b.length, 0)
  const totalProblems = Object.values(state.problemsSolved || {}).reduce((a, b) => a + b.length, 0)
  const earnedAch = (state.achievements || []).length

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} state={state} />
      <Notification />
      <div className="flex-1 overflow-y-auto bg-bg">
        {/* Topbar */}
        <div className="h-14 bg-bg-2 border-b border-white/[0.08] flex items-center px-4 gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-bg-4 transition-all">
            <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor"><rect y="0" width="15" height="2" rx="1"/><rect y="5" width="15" height="2" rx="1"/><rect y="10" width="15" height="2" rx="1"/></svg>
          </button>
          <div className="font-head font-bold text-sm text-white flex-1">My Progress</div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← Home</Link>
        </div>

        <main className="p-6 max-w-4xl mx-auto">
          {/* Level Card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-bg-3 to-bg-4 border border-white/10 rounded-2xl p-6 mb-6 flex items-center gap-6 flex-wrap">
            <div className="text-5xl">⭐</div>
            <div className="flex-1">
              <div className="font-head text-2xl font-black text-white mb-0.5">Level {lvl} — {levelName(lvl)}</div>
              <div className="text-slate-400 text-sm mb-3">{state.xp || 0} XP total</div>
              <div className="h-2 bg-surface rounded-full overflow-hidden max-w-xs">
                <motion.div className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1, delay: 0.3 }} />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{100 - xpPct} XP to Level {lvl + 1}</div>
            </div>
            <div className="flex gap-4">
              {[
                { val: doneConcepts, lbl: 'Concepts', color: 'text-accent' },
                { val: totalProblems, lbl: 'Problems', color: 'text-gold' },
                { val: earnedAch, lbl: 'Badges', color: 'text-purple-400' },
              ].map(s => (
                <div key={s.lbl} className="text-center">
                  <div className={`font-mono text-xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-[11px] text-slate-500">{s.lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chapter Progress */}
          <div className="card">
            <div className="card-title">📚 Chapter Progress</div>
            {['ch1', 'ch2'].map((chId, i) => {
              const ch = CHAPTERS.find(c => c.id === chId)
              const done = (state.conceptsDone?.[chId] || []).length
              const total = chId === 'ch1' ? 10 : 11
              const pct = Math.round(done / total * 100)
              const quizScore = state.quizScores?.[chId] || 0
              const problems = (state.problemsSolved?.[chId] || []).length
              return (
                <motion.div key={chId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <Link href={`/chapters/${chId}`} className="font-head font-semibold text-sm text-white hover:text-accent transition-colors">
                      Ch.{ch?.num} — {ch?.title}
                    </Link>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span className="font-mono">{done}/{total} concepts</span>
                      <span className="font-mono text-gold">Quiz: {quizScore}/10</span>
                      <span className="font-mono text-emerald">{problems} problems</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${chId === 'ch1' ? 'bg-gradient-to-r from-accent to-purple-500' : 'bg-gradient-to-r from-cyan to-emerald'}`}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{pct}% complete</div>
                </motion.div>
              )
            })}
          </div>

          {/* Achievements */}
          <div className="card">
            <div className="card-title">🏆 Achievement Badges ({earnedAch}/{ACHIEVEMENTS.length})</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {ACHIEVEMENTS.map((a, i) => {
                const earned = (state.achievements || []).includes(a.id)
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                    className={`rounded-xl p-3 text-center border transition-all ${earned ? 'bg-gold/6 border-gold/30' : 'bg-bg-4 border-white/[0.04] opacity-40'}`}
                    title={a.desc}>
                    <div className={`text-2xl mb-1.5 ${earned ? '' : 'grayscale'}`}>{a.ico}</div>
                    <div className={`text-[10px] font-semibold ${earned ? 'text-gold' : 'text-slate-500'}`}>{a.name}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Study streak */}
          <div className="card">
            <div className="card-title">📅 Study Activity (Simulated)</div>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 35 }, (_, i) => {
                const active = Math.random() > 0.35
                return <div key={i} className="w-4 h-4 rounded-sm" style={{ background: active ? '#5b8dff' : '#1c2540' }} />
              })}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Last 35 days</div>
          </div>
        </main>
      </div>
    </div>
  )
}
