'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let notifHandler = null

export function useNotification() {
  const [notif, setNotif] = useState(null)

  useEffect(() => {
    notifHandler = (msg) => {
      setNotif(msg)
      setTimeout(() => setNotif(null), 3500)
    }
    return () => { notifHandler = null }
  }, [])

  return notif
}

export function showNotif(title, body) {
  if (notifHandler) notifHandler({ title, body })
}

export default function Notification() {
  const notif = useNotification()

  return (
    <AnimatePresence>
      {notif && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 250 }}
          className="fixed bottom-5 right-5 z-[200] bg-bg-2 border border-white/15 rounded-xl px-4 py-3 shadow-2xl max-w-xs"
        >
          <div className="font-head font-semibold text-gold text-sm mb-0.5">{notif.title}</div>
          <div className="text-slate-300 text-xs">{notif.body}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
