'use client'
import { useState } from 'react'

export function AIAdvisor({ restaurantId, rushActive, rushLevel = 50, activeOrderCount = 0, overdueOrderCount = 0, kptBuffer = 0 }) {
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ask = async () => {
    setLoading(true)
    setSuggestion(null)
    setError(null)
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, rushLevel, rushActive: !!rushActive, activeOrderCount, overdueOrderCount, kptBuffer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API error')
      setSuggestion(data.suggestion)
    } catch (e) {
      setError(e.message || 'Claude API unavailable — check ANTHROPIC_API_KEY in .env.local')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background:'#161616', border:'1px solid #2A2A2A', borderRadius:16, padding:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <h3 style={{ fontSize:13, fontWeight:700, fontFamily:'Syne, sans-serif', color:'#F0EDE8', lineHeight:1 }}>🤖 AI Advisor</h3>
          <p style={{ fontSize:9, color:'#7A7570', marginTop:3, letterSpacing:'0.04em' }}>POWERED BY CLAUDE</p>
        </div>
        <button onClick={ask} disabled={loading} style={{
          padding:'5px 12px', borderRadius:8, border:'1px solid #2A2A2A', background:'transparent',
          color: loading ? '#7A7570' : '#F0EDE8', fontSize:11, fontWeight:600,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
        }}>
          {loading ? 'Thinking...' : 'Ask AI ↗'}
        </button>
      </div>
      {!suggestion && !error && !loading && (
        <p style={{ fontSize:12, color:'#7A7570', lineHeight:1.65 }}>
          Get real-time advice based on your active orders and rush status.
        </p>
      )}
      {loading && <p style={{ fontSize:12, color:'#7A7570' }}>Analysing kitchen state...</p>}
      {error && !loading && (
        <div style={{ background:'#E2374408', border:'1px solid #E2374420', borderRadius:8, padding:'10px 12px', fontSize:11, color:'#E23744' }}>{error}</div>
      )}
      {suggestion && !loading && (
        <div style={{ background:'#3B82F60A', border:'1px solid #3B82F620', borderRadius:9, padding:'12px 14px', fontSize:13, lineHeight:1.7, color:'#E8E4DE' }}>
          {suggestion}
        </div>
      )}
    </div>
  )
}
export default AIAdvisor