'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CHAPTERS } from '@/lib/bookData'
import { levelName } from '@/lib/store'

export default function Sidebar({ isOpen, onClose, state }) {
  const pathname = usePathname()
  const sidebarRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  const xpPct = state ? (state.xp % 100) : 0
  const lvl = state?.level || 1

  const navItems = [
    { href: '/', label: 'Book Home', icon: '🏠', id: 'home' },
    { href: '/progress', label: 'My Progress', icon: '🏆', id: 'progress' },
  ]

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed left-0 top-0 h-full w-64 bg-bg-2 border-r border-white/[0.08] z-50 flex flex-col overflow-hidden"
      >
        {/* Logo + Close */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.08]">
          <div>
            <div className="font-head font-black text-xl bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              DerivX
            </div>
            <div className="font-mono text-[10px] text-slate-500 mt-0.5">Hull · 11th Ed · Interactive</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-bg-4 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* XP Widget */}
        <div className="px-4 py-3 bg-bg-3 border-b border-white/[0.08]">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="font-mono text-[11px] text-gold font-medium">
              Lv.{lvl} — {levelName(lvl)}
            </span>
            <span className="font-mono text-[11px] text-slate-500">{state?.xp || 0} XP</span>
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full"
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 py-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
            Navigation
          </div>
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 mx-1.5 rounded-lg text-sm transition-all mb-0.5 ${
                pathname === item.href
                  ? 'bg-accent/10 border border-accent/25 text-white'
                  : 'text-slate-400 hover:bg-bg-4 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="text-[13px]">{item.label}</span>
            </Link>
          ))}

          <div className="px-3 py-2 mt-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
            Chapters
          </div>
          {CHAPTERS.map((ch) => {
            const isActive = pathname.startsWith(`/chapters/${ch.id}`)
            const isDone = (state?.conceptsDone?.[ch.id] || []).length > 0
            const isLocked = ch.status === 'coming'
            return (
              <div key={ch.id}>
                {isLocked ? (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 mx-1.5 rounded-lg opacity-35 cursor-not-allowed mb-0.5">
                    <span className="font-mono text-[11px] text-slate-500 w-5 text-center">
                      {ch.num.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[12px] text-slate-400 flex-1 leading-tight">{ch.title}</span>
                    <span className="text-[10px] text-slate-500">🔒</span>
                  </div>
                ) : (
                  <Link
                    href={`/chapters/${ch.id}`}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 mx-1.5 rounded-lg transition-all mb-0.5 ${
                      isActive
                        ? 'bg-accent/10 border border-accent/25'
                        : 'hover:bg-bg-4'
                    }`}
                  >
                    <span className={`font-mono text-[11px] w-5 text-center ${isActive ? 'text-accent' : 'text-slate-500'}`}>
                      {ch.num.toString().padStart(2, '0')}
                    </span>
                    <span className={`text-[12px] flex-1 leading-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {ch.title}
                    </span>
                    {isDone && <span className="w-1.5 h-1.5 rounded-full bg-emerald flex-shrink-0" />}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer: overall progress */}
        <div className="px-4 py-3 border-t border-white/[0.08]">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
            <span>Book Progress</span>
            <span id="sidebar-pct">0%</span>
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald to-cyan rounded-full w-0 transition-all duration-700" />
          </div>
        </div>
      </motion.aside>
    </>
  )
}
