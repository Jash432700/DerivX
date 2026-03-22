'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Global event-based notification system
const NOTIF_EVENT = 'derivx-notif'

export function showNotif(title, body) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIF_EVENT, { detail: { title, body } }))
  }
}

export default function Notification() {
  const [notif, setNotif] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      setNotif(e.detail)
      setTimeout(() => setNotif(null), 3500)
    }
    window.addEventListener(NOTIF_EVENT, handler)
    return () => window.removeEventListener(NOTIF_EVENT, handler)
  }, [])

  return (
    <AnimatePresence>
      {notif && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 250 }}
          className="fixed bottom-5 right-5 z-[200] bg-bg-2 border border-white/15 rounded-xl px-4 py-3 shadow-2xl max-w-xs"
          style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="font-semibold text-sm mb-0.5" style={{ color: '#f59e0b' }}>{notif.title}</div>
          <div className="text-xs" style={{ color: '#94a3b8' }}>{notif.body}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

