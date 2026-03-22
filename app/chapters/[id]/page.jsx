'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/ui/Sidebar'
import Notification, { showNotif } from '@/components/ui/Notification'
import Modal from '@/components/ui/Modal'
import { useDerivXStore } from '@/lib/store'
import { CHAPTERS, CHAPTER_DATA } from '@/lib/bookData'

// Dynamic imports — prevents SSR crash for chart-heavy components
const LearnTab      = dynamic(() => import('@/components/tabs/LearnTab'),      { ssr: false, loading: () => <TabLoader /> })
const SimulateTab   = dynamic(() => import('@/components/tabs/SimulateTab'),   { ssr: false, loading: () => <TabLoader /> })
const TradeTab      = dynamic(() => import('@/components/tabs/TradeTab'),       { ssr: false, loading: () => <TabLoader /> })
const FormulasTab   = dynamic(() => import('@/components/tabs/FormulasTab'),   { ssr: false, loading: () => <TabLoader /> })
const SummaryTab    = dynamic(() => import('@/components/tabs/SummaryTab'),    { ssr: false, loading: () => <TabLoader /> })
const ExamplesTab   = dynamic(() => import('@/components/tabs/ExamplesTab'),   { ssr: false, loading: () => <TabLoader /> })
const ProblemsTab   = dynamic(() => import('@/components/tabs/ProblemsTab'),   { ssr: false, loading: () => <TabLoader /> })
const QuizTab       = dynamic(() => import('@/components/tabs/QuizTab'),       { ssr: false, loading: () => <TabLoader /> })
const FlashcardsTab = dynamic(() => import('@/components/tabs/FlashcardsTab'), { ssr: false, loading: () => <TabLoader /> })
const SpeedLearnTab = dynamic(() => import('@/components/tabs/SpeedLearnTab'), { ssr: false, loading: () => <TabLoader /> })

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
    </div>
  )
}

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
  const [mounted, setMounted] = useState(false)
  const store = useDerivXStore()
  const { state, loaded } = store

  useEffect(() => { setMounted(true) }, [])

  const chData = CHAPTER_DATA[id]
  const chMeta = CHAPTERS.find(c => c.id === id)

  useEffect(() => {
    if (loaded && !chData) router.push('/')
  }, [loaded, chData, router])

  if (!mounted || !chData || !chMeta) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="w-10 h-10 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

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

      <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: '#080c18' }}>
        {/* Topbar */}
        <div className="h-14 flex items-center px-3 gap-2 sticky top-0 z-30 flex-shrink-0" style={{ background: '#0d1120', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all flex-shrink-0"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
            <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor">
              <rect y="0" width="15" height="2" rx="1"/><rect y="5" width="15" height="2" rx="1"/><rect y="10" width="15" height="2" rx="1"/>
            </svg>
          </button>

          {/* Scrollable tabs */}
          <div className="flex gap-0.5 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex-shrink-0 text-xs"
                style={{
                  background: activeTab === t.id ? '#1c2540' : 'transparent',
                  color: activeTab === t.id ? '#5b8dff' : '#94a3b8',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <button onClick={() => setResetModalOpen(true)}
            className="text-xs px-2 py-1 rounded-lg flex-shrink-0 transition-all"
            style={{ fontFamily: 'monospace', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            ↺
          </button>
          <div className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0"
            style={{ fontFamily: 'monospace', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
            ₹{(state.balance || 50000).toLocaleString()}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
        <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
          This will clear all progress for <strong style={{ color: 'white' }}>Chapter {chMeta.num} — {chMeta.title}</strong>:
        </p>
        <ul className="space-y-1.5 mb-5">
          {['Concept completions', 'Quiz scores', 'Flashcard mastery', 'Speed learn position', 'Problems solved', 'Formulas viewed'].map(item => (
            <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#94a3b8' }}>
              <span style={{ color: '#ef4444', fontSize: '11px' }}>✕</span>{item}
            </li>
          ))}
        </ul>
        <p className="text-xs mb-5" style={{ color: '#4b5a72' }}>Your XP, balance, and achievements are kept.</p>
        <div className="flex gap-3">
          <button onClick={handleReset}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
            Reset Chapter {chMeta.num}
          </button>
          <button onClick={() => setResetModalOpen(false)}
            className="flex-1 py-2.5 rounded-lg text-sm transition-all"
            style={{ background: '#1c2540', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}

