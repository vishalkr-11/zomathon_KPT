// src/hooks/useRush.js
import { useState } from 'react'

export function useRush(restaurantId) {
  const [rushActive, setRushActive] = useState(false)
  const [rushBuffer, setRushBuffer] = useState(0)
  const [loading, setLoading] = useState(false)

  const activateRush = async ({ rushLevel, reasons, durationMins }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/rush/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, rushLevel, reasons, durationMins }),
      })
      const data = await res.json()

      setRushActive(true)
      setRushBuffer(data.bufferAdded)

      // Auto-deactivate after duration
      setTimeout(() => {
        setRushActive(false)
        setRushBuffer(0)
      }, durationMins * 60 * 1000)

      return data
    } finally {
      setLoading(false)
    }
  }

  const deactivateRush = async () => {
    await fetch('/api/rush/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId }),
    })
    setRushActive(false)
    setRushBuffer(0)
  }

  return { rushActive, rushBuffer, loading, activateRush, deactivateRush }
}