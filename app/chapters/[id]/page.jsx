'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/ui/Sidebar'
import Notification, { showNotif } from '@/components/ui/Notification'
import Modal from '@/components/ui/Modal'
import { useDerivXStore } from '@/lib/store'
import { CHAPTERS, CHAPTER_DATA } from '@/lib/bookData'

// Tab components
import LearnTab from '@/components/tabs/LearnTab'
import SimulateTab from '@/components/tabs/SimulateTab'
import FormulasTab from '@/components/tabs/FormulasTab'
import SummaryTab from '@/components/tabs/SummaryTab'
import ExamplesTab from '@/components/tabs/ExamplesTab'
import ProblemsTab from '@/components/tabs/ProblemsTab'
import QuizTab from '@/components/tabs/QuizTab'
import FlashcardsTab from '@/components/tabs/FlashcardsTab'
import SpeedLearnTab from '@/components/tabs/SpeedLearnTab'
import TradeTab from '@/components/tabs/TradeTab'

const TABS = [
  { id: 'learn',      label: '📚 Learn' },
  { id: 'simulate',   label: '📊 Simulate' },
  { id: 'trade',      label: '🎮 Trade' },
  { id: 'formulas',   label: '📐 Formulas' },
  { id: 'summary',    label: '📋 Summary' },
  { id: 'examples',   label: '🔢 Examples' },
  { id: 'problems',   label: '✏️ Problems' },
  { id: 'quiz',       label: '🧠 Quiz' },
  { id: 'flashcards', label: '🃏 Cards' },
  { id: 'speed',      label: '⚡ Speed' },
]

export default function ChapterPage() {
  const { id } = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('learn')
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const store = useDerivXStore()
  const { state, loaded } = store

  const chData = CHAPTER_DATA[id]
  const chMeta = CHAPTERS.find(c => c.id === id)

  useEffect(() => {
    if (loaded && !chData) router.push('/')
  }, [loaded, chData, router])

  if (!chData || !chMeta) return null

  const handleReset = () => {
    store.resetChapter(id)
    setResetModalOpen(false)
    setActiveTab('learn')
    showNotif('↺ Reset Complete', `Chapter ${chMeta.num} progress cleared`)
  }

  const tabProps = { chId: id, chData, store }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} state={state} />
      <Notification />

      <div className="flex-1 overflow-y-auto flex flex-col bg-bg">
        {/* Topbar */}
        <div className="h-14 bg-bg-2 border-b border-white/[0.08] flex items-center px-3 gap-2 sticky top-0 z-30 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-bg-4 transition-all flex-shrink-0">
            <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor">
              <rect y="0" width="15" height="2" rx="1"/><rect y="5" width="15" height="2" rx="1"/><rect y="10" width="15" height="2" rx="1"/>
            </svg>
          </button>

          {/* Tab scroll */}
          <div className="flex gap-0.5 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-2.5 py-1.5 text-[11px] rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${activeTab === t.id ? 'bg-surface text-accent' : 'text-slate-400 hover:text-white hover:bg-bg-4'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <button onClick={() => setResetModalOpen(true)}
            className="text-[10px] font-mono text-danger border border-danger/30 px-2 py-1 rounded-lg hover:bg-danger/10 transition-all flex-shrink-0">
            ↺
          </button>
          <div className="font-mono text-xs text-emerald border border-emerald/25 px-2.5 py-1 rounded-lg flex-shrink-0">
            ₹{(state.balance || 50000).toLocaleString()}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
              {activeTab === 'learn'      && <LearnTab      {...tabProps} />}
              {activeTab === 'simulate'   && <SimulateTab   {...tabProps} />}
              {activeTab === 'trade'      && <TradeTab      {...tabProps} />}
              {activeTab === 'formulas'   && <FormulasTab   {...tabProps} />}
              {activeTab === 'summary'    && <SummaryTab    {...tabProps} />}
              {activeTab === 'examples'   && <ExamplesTab   {...tabProps} />}
              {activeTab === 'problems'   && <ProblemsTab   {...tabProps} />}
              {activeTab === 'quiz'       && <QuizTab       {...tabProps} />}
              {activeTab === 'flashcards' && <FlashcardsTab {...tabProps} />}
              {activeTab === 'speed'      && <SpeedLearnTab {...tabProps} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Reset Modal */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title={`↺ Reset Chapter ${chMeta.num}`}>
        <p className="text-slate-300 text-sm mb-4">This will clear all progress for <strong className="text-white">Chapter {chMeta.num} — {chMeta.title}</strong>:</p>
        <ul className="space-y-1.5 mb-5 text-sm text-slate-400">
          {['Concept completions', 'Quiz scores', 'Flashcard mastery', 'Speed learn position', 'Problems solved', 'Formulas viewed'].map(i => (
            <li key={i} className="flex items-center gap-2"><span className="text-danger text-xs">✕</span>{i}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 mb-5">Your XP, balance, and achievements are kept.</p>
        <div className="flex gap-3">
          <button onClick={handleReset} className="flex-1 bg-danger/15 border border-danger/40 text-danger py-2.5 rounded-lg text-sm font-semibold hover:bg-danger/25 transition-all">
            Reset Chapter {chMeta.num}
          </button>
          <button onClick={() => setResetModalOpen(false)} className="flex-1 bg-surface border border-white/10 text-slate-300 py-2.5 rounded-lg text-sm hover:text-white transition-all">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
