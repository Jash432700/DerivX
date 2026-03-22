'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { showNotif } from '@/components/ui/Notification'

export default function FormulasTab({ chId, chData, store }) {
  const [activeFormula, setActiveFormula] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const formulas = chData.formulas || []
  const viewed = new Set(store.state.formulasViewed?.[chId] || [])

  const categories = ['all', ...new Set(formulas.map(f => f.category))]

  const filtered = activeCategory === 'all' ? formulas : formulas.filter(f => f.category === activeCategory)

  const openFormula = (f) => {
    setActiveFormula(activeFormula?.id === f.id ? null : f)
    if (!viewed.has(f.id)) {
      store.markFormulaViewed(chId, f.id)
      showNotif('📐 Formula noted', f.name)
    }
    if (viewed.size + 1 >= formulas.length) {
      store.unlockAchievement('formula_master')
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className="chapter-hero">
        <div className="font-mono text-xs text-accent mb-1 uppercase tracking-wider">Chapter {chData.num}</div>
        <h2 className="font-head text-xl font-black text-white mb-1">Formula Sheet</h2>
        <p className="text-slate-400 text-sm">All key formulas, variables, and worked examples for Chapter {chData.num}.</p>
        <div className="flex gap-4 mt-3">
          <div><div className="font-mono text-lg text-accent">{viewed.size}/{formulas.length}</div><div className="text-[11px] text-slate-500">Reviewed</div></div>
          <div><div className="font-mono text-lg text-gold">{categories.length - 1}</div><div className="text-[11px] text-slate-500">Categories</div></div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all capitalize ${activeCategory === cat ? 'bg-accent/15 border border-accent/40 text-accent' : 'bg-surface border border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Formula Cards */}
      <div className="space-y-3">
        {filtered.map((f, i) => {
          const isViewed = viewed.has(f.id)
          const isOpen = activeFormula?.id === f.id
          return (
            <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div
                onClick={() => openFormula(f)}
                className={`bg-bg-3 border rounded-xl cursor-pointer transition-all hover:border-accent/30 ${isOpen ? 'border-accent/40' : isViewed ? 'border-white/[0.1]' : 'border-white/[0.06]'}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isViewed ? 'bg-emerald' : 'bg-slate-600'}`} />
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-slate-500 mb-0.5">{f.category}</div>
                      <div className="font-head font-semibold text-sm text-white">{f.name}</div>
                    </div>
                  </div>
                  {/* Formula preview */}
                  <div className="font-mono text-sm text-accent bg-accent/8 px-3 py-1.5 rounded-lg ml-3 flex-shrink-0">
                    {f.formula.split('=')[0].trim()}
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/[0.06]">
                      <div className="p-4 space-y-4">
                        {/* Main formula box */}
                        <div className="formula-box">
                          <div className="formula-title">{f.category} — {f.name}</div>
                          <div className="formula-main text-accent">{f.formula}</div>
                          {f.variables && f.variables.length > 0 && (
                            <div className="formula-vars mt-3 space-y-1">
                              {f.variables.map(v => (
                                <div key={v.symbol} className="flex gap-3">
                                  <span className="text-accent w-16 flex-shrink-0">{v.symbol}</span>
                                  <span className="text-slate-400">{v.meaning}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Note */}
                        {f.note && (
                          <div className="bg-bg-4 border-l-2 border-accent/40 rounded-r-lg px-4 py-3">
                            <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1.5">Key Insight</div>
                            <p className="text-sm text-slate-300 leading-relaxed">{f.note}</p>
                          </div>
                        )}

                        {/* Example */}
                        {f.example && (
                          <div className="bg-emerald/5 border border-emerald/20 rounded-xl px-4 py-3">
                            <div className="text-[10px] font-mono text-emerald uppercase tracking-wider mb-1.5">Numerical Example</div>
                            <p className="font-mono text-sm text-slate-200">{f.example}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Reference Card */}
      <div className="card mt-6">
        <div className="card-title">⚡ Quick Reference</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left py-2 px-3 text-slate-500 font-mono uppercase tracking-wider">Formula</th>
                <th className="text-left py-2 px-3 text-slate-500 font-mono uppercase tracking-wider">Expression</th>
                <th className="text-left py-2 px-3 text-slate-500 font-mono uppercase tracking-wider hidden sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {formulas.map(f => (
                <tr key={f.id} className="border-b border-white/[0.04] hover:bg-bg-4 transition-colors">
                  <td className="py-2 px-3 text-slate-300 font-semibold">{f.name}</td>
                  <td className="py-2 px-3 font-mono text-accent">{f.formula}</td>
                  <td className="py-2 px-3 text-slate-500 hidden sm:table-cell">{f.example || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
