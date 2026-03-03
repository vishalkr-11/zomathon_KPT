// src/hooks/useSignals.js
//
// Fetches signal health data for the dashboard sidebar.
// Falls back to realistic mock data if MongoDB isn't seeded yet.
// Polls every 30 seconds for live updates.
// Reactively updates rushCoverage quality when rushActive changes.

'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_koramangala_001'

// ── Mock data — shown when API isn't ready or DB is empty ─────────────────────
// These values are realistic for a mid-sized Zomato restaurant BEFORE your signals
const MOCK_SIGNALS = {
  signalHealth: {
    forSignal: {
      quality: 68,
      label: 'FOR Signal Quality',
      description: 'Merchant food-ready markings — 32% are rider-triggered (biased)',
    },
    riderFeedback: {
      quality: 91,
      label: 'Rider Feedback Coverage',
      description: '91% of delivered orders have rider ground-truth feedback',
    },
    rushCoverage: {
      quality: 32,
      label: 'Rush Signal Coverage',
      description: 'Kitchen load from dine-in/competitor orders is mostly invisible',
    },
    complexityScore: {
      quality: 85,
      label: 'Complexity Score Accuracy',
      description: 'Order complexity scores are deterministic — always available',
    },
  },
  metrics: {
    kptAccuracy:          68,   // % — baseline before your signals
    avgRiderWaitMins:    4.8,   // minutes — target is < 3
    totalOrdersToday:     23,
    signalsCollectedToday: 41,
  },
  activeRush:       null,
  recentRushEvents: [],
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSignals(rushActive = false) {
  const [data,    setData]    = useState(MOCK_SIGNALS)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const pollRef = useRef(null)

  // ── Fetch from API ──────────────────────────────────────────────────────
  const fetchSignals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/signals?restaurantId=${RESTAURANT_ID}`, {
        // 10 second timeout — don't hang if DB is slow
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()

      // Only update if we got real data back
      if (json.signalHealth && json.metrics) {
        setData(json)
        setError(null)
      }
    } catch (err) {
      // Network error or DB not ready — keep mock data, log silently
      if (err.name !== 'AbortError') {
        setError('Using demo data — connect MongoDB to see live signals')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Poll every 30s ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchSignals()
    pollRef.current = setInterval(fetchSignals, 30_000)
    return () => clearInterval(pollRef.current)
  }, [fetchSignals])

  // ── Reactively update rushCoverage when rush is activated/deactivated ───
  // This happens instantly without waiting for a poll cycle
  useEffect(() => {
    setData(prev => ({
      ...prev,
      signalHealth: {
        ...prev.signalHealth,
        rushCoverage: {
          ...prev.signalHealth.rushCoverage,
          quality: rushActive ? 95 : 32,
          description: rushActive
            ? 'Rush mode active — kitchen load fully reported to KPT model'
            : 'Kitchen load from dine-in/competitor orders is mostly invisible',
        },
      },
      // Also boost overall KPT accuracy estimate when rush is active
      metrics: {
        ...prev.metrics,
        kptAccuracy:       rushActive ? 84 : (prev.metrics.kptAccuracy || 68),
        avgRiderWaitMins:  rushActive ? 2.8 : (prev.metrics.avgRiderWaitMins || 4.8),
      },
    }))
  }, [rushActive])

  // ── Return everything the components need ────────────────────────────────
  return {
    // Signal health bars (used by SignalHealthCard)
    signalHealth: data.signalHealth,

    // Summary metrics (used by header ticker + stat cards)
    metrics: data.metrics,

    // Current active rush event from DB (or null)
    activeRush: data.activeRush,

    // Last 10 rush events (for analytics)
    recentRushEvents: data.recentRushEvents || [],

    // Recent signal records (for signals page detail)
    recentSignals: data.recentSignals || [],

    // Hook state
    loading,
    error,
    refetch: fetchSignals,
  }
}

export default useSignals
