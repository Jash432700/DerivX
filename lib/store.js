'use client'
import { useState, useEffect, useCallback } from 'react'

// ── Default State ──
const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  balance: 50000,
  totalPnl: 0,
  conceptsDone: {},      // { ch1: ['id1', 'id2'], ch2: [] }
  quizScores: {},        // { ch1: 0, ch2: 0 }
  cardsMastered: {},     // { ch1: [], ch2: [] }
  achievements: [],
  positions: [],
  problemsSolved: {},    // { ch1: ['p1_12'], ch2: [] }
  formulasViewed: {},    // { ch1: [], ch2: [] }
  lastVisited: null,
  currentChapter: 'ch1',
}

// ── XP to Level ──
export function xpToLevel(xp) {
  return Math.min(Math.floor(xp / 100) + 1, 8)
}

export function levelName(level) {
  const names = ['Intern', 'Analyst', 'Associate', 'VP', 'Director', 'MD', 'Partner', 'Legend']
  return names[Math.min(level - 1, 7)]
}

// ── Custom Hook ──
export function useDerivXStore() {
  const [state, setStateRaw] = useState(DEFAULT_STATE)
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('derivx_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        setStateRaw({ ...DEFAULT_STATE, ...parsed })
      }
    } catch (e) {
      console.warn('Could not load state', e)
    }
    setLoaded(true)
  }, [])

  // Persist to localStorage on every change
  const setState = useCallback((updater) => {
    setStateRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      try {
        localStorage.setItem('derivx_state', JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }, [])

  // ── Actions ──
  const addXP = useCallback((amount) => {
    setState((s) => {
      const newXP = s.xp + amount
      const newLevel = xpToLevel(newXP)
      return { ...s, xp: newXP, level: newLevel }
    })
  }, [setState])

  const markConceptDone = useCallback((chId, conceptId) => {
    setState((s) => {
      const done = new Set(s.conceptsDone[chId] || [])
      done.add(conceptId)
      return { ...s, conceptsDone: { ...s.conceptsDone, [chId]: [...done] } }
    })
    addXP(15)
  }, [setState, addXP])

  const markCardMastered = useCallback((chId, cardIdx) => {
    setState((s) => {
      const mastered = new Set(s.cardsMastered[chId] || [])
      mastered.add(cardIdx)
      return { ...s, cardsMastered: { ...s.cardsMastered, [chId]: [...mastered] } }
    })
  }, [setState])

  const setQuizScore = useCallback((chId, score) => {
    setState((s) => ({
      ...s,
      quizScores: { ...s.quizScores, [chId]: score },
    }))
    addXP(score * 20)
  }, [setState, addXP])

  const unlockAchievement = useCallback((id) => {
    setState((s) => {
      if (s.achievements.includes(id)) return s
      return { ...s, achievements: [...s.achievements, id] }
    })
    addXP(25)
  }, [setState, addXP])

  const markProblemSolved = useCallback((chId, problemId) => {
    setState((s) => {
      const solved = new Set(s.problemsSolved[chId] || [])
      solved.add(problemId)
      return { ...s, problemsSolved: { ...s.problemsSolved, [chId]: [...solved] } }
    })
    addXP(30)
  }, [setState, addXP])

  const markFormulaViewed = useCallback((chId, formulaId) => {
    setState((s) => {
      const viewed = new Set(s.formulasViewed[chId] || [])
      viewed.add(formulaId)
      return { ...s, formulasViewed: { ...s.formulasViewed, [chId]: [...viewed] } }
    })
    addXP(5)
  }, [setState, addXP])

  const executeTrade = useCallback((trade) => {
    setState((s) => ({
      ...s,
      positions: [...s.positions, { ...trade, id: Date.now() }],
    }))
    addXP(10)
  }, [setState, addXP])

  const settlePositions = useCallback((settlePrice) => {
    setState((s) => {
      let pnl = 0
      s.positions.forEach((p) => {
        if (p.instrument === 'forward' || p.instrument === 'futures') {
          pnl += (settlePrice - p.entry) * p.qty
        } else if (p.instrument === 'call') {
          pnl += (Math.max(settlePrice - p.entry, 0) - 5) * p.qty
        } else if (p.instrument === 'put') {
          pnl += (Math.max(p.entry - settlePrice, 0) - 5) * p.qty
        }
      })
      return {
        ...s,
        balance: Math.max(0, s.balance + pnl),
        totalPnl: s.totalPnl + pnl,
        positions: [],
      }
    })
  }, [setState])

  const resetChapter = useCallback((chId) => {
    setState((s) => ({
      ...s,
      conceptsDone: { ...s.conceptsDone, [chId]: [] },
      quizScores: { ...s.quizScores, [chId]: 0 },
      cardsMastered: { ...s.cardsMastered, [chId]: [] },
      problemsSolved: { ...s.problemsSolved, [chId]: [] },
      formulasViewed: { ...s.formulasViewed, [chId]: [] },
    }))
  }, [setState])

  return {
    state,
    loaded,
    addXP,
    markConceptDone,
    markCardMastered,
    setQuizScore,
    unlockAchievement,
    markProblemSolved,
    markFormulaViewed,
    executeTrade,
    settlePositions,
    resetChapter,
  }
}
