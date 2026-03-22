'use client'
import { motion } from 'framer-motion'

export default function Topbar({ onMenuClick, title, tabs, activeTab, onTabChange, balance, showReset, onReset }) {
  return (
    <div className="h-14 bg-bg-2 border-b border-white/[0.08] flex items-center px-4 gap-3 sticky top-0 z-30 flex-shrink-0">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-bg-4 transition-all flex-shrink-0"
        aria-label="Toggle menu"
      >
        <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor">
          <rect y="0" width="16" height="2" rx="1" />
          <rect y="6" width="16" height="2" rx="1" />
          <rect y="12" width="16" height="2" rx="1" />
        </svg>
      </button>

      {/* Title */}
      <div className="font-head font-bold text-sm text-white flex-1 min-w-0 truncate hidden sm:block">
        {title}
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex gap-0.5 overflow-x-auto scrollbar-hide flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 text-[11px] rounded-lg whitespace-nowrap transition-all font-sans flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-surface text-accent'
                  : 'text-slate-400 hover:text-white hover:bg-bg-4'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Reset */}
      {showReset && (
        <button
          onClick={onReset}
          className="text-[11px] font-mono text-danger border border-danger/30 px-2.5 py-1 rounded-lg hover:bg-danger/10 transition-all flex-shrink-0 hidden sm:block"
        >
          ↺ Reset
        </button>
      )}

      {/* Balance */}
      <div className="font-mono text-xs text-emerald border border-emerald/25 px-2.5 py-1 rounded-lg flex-shrink-0">
        ₹{(balance || 50000).toLocaleString()}
      </div>
    </div>
  )
}
