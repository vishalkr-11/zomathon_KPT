// src/components/dashboard/RushModal.jsx
'use client'
import { useState } from 'react'
import { RUSH_REASONS, getRushLevel } from '@/constants/signals'
import { calculateKptBuffer } from '@/lib/kpt-calculator'

export function RushModal({ initialLevel=65, onActivate, onClose }) {
  const [level,    setLevel]    = useState(initialLevel)
  const [reasons,  setReasons]  = useState([])
  const [duration, setDuration] = useState(30)
  const [loading,  setLoading]  = useState(false)
  const { color, label } = getRushLevel(level)
  const buffer = calculateKptBuffer(level)

  function toggle(v) {
    setReasons(p => p.includes(v) ? p.filter(r=>r!==v) : [...p,v])
  }

  async function handleActivate() {
    setLoading(true)
    try { await onActivate({ rushLevel:level, reasons, durationMins:duration }) }
    finally { setLoading(false) }
  }

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.88)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#161616', border:'1px solid #2A2A2A', borderRadius:20,
        padding:28, width:'100%', maxWidth:520,
        maxHeight:'90vh', overflowY:'auto',
        fontFamily:'DM Sans, sans-serif',
        animation:'fadeUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h2 style={{ fontSize:20, fontWeight:800, fontFamily:'Syne, sans-serif', color:'#F0EDE8' }}>
            🔥 Mark Kitchen Rush
          </h2>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:8, border:'1px solid #2A2A2A',
            background:'transparent', color:'#7A7570', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
          }}>✕</button>
        </div>

        {/* Info box */}
        <div style={{
          background:'#1E1E1E', border:'1px solid #2A2A2A',
          borderRadius:10, padding:12, marginBottom:20,
          fontSize:13, color:'#9A9490', lineHeight:1.65,
        }}>
          Signals Zomato that your kitchen has extra load beyond Zomato orders.
          Rider dispatches will be delayed by{' '}
          <strong style={{ color:'#F59E0B' }}>+{buffer} minutes</strong> — preventing idle waiting.
        </div>

        {/* Reasons */}
        <p style={{ fontSize:11, fontWeight:700, color:'#7A7570', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
          Why is your kitchen busy? (select all that apply)
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:22 }}>
          {RUSH_REASONS.map(r => {
            const sel = reasons.includes(r.value)
            return (
              <button key={r.value} onClick={() => toggle(r.value)} style={{
                padding:'11px 14px', borderRadius:10, textAlign:'left',
                border:`1px solid ${sel?'#E23744':'#2A2A2A'}`,
                background:sel?'#E2374410':'#1E1E1E',
                cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
              }}>
                <div style={{ fontSize:18, marginBottom:3 }}>{r.emoji}</div>
                <div style={{ fontSize:12, fontWeight:600, color:sel?'#E23744':'#F0EDE8' }}>{r.label}</div>
                <div style={{ fontSize:10, color:sel?'#E2374465':'#7A7570', marginTop:1 }}>{r.desc}</div>
              </button>
            )
          })}
        </div>

        {/* Intensity */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#7A7570', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Rush Intensity
            </p>
            <span style={{ fontSize:12, fontWeight:700, color }}>{label} · {level}/100 · +{buffer}m</span>
          </div>
          <input type="range" min={10} max={100} value={level}
            onChange={e => setLevel(Number(e.target.value))}
            style={{ accentColor:color }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#7A7570', marginTop:5 }}>
            <span>Slightly busy (+3m)</span><span>Moderate (+7m)</span><span>Packed (+12m)</span>
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom:22 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'#7A7570', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
            How long?
          </p>
          <div style={{ display:'flex', gap:8 }}>
            {[15,30,45,60].map(d => {
              const sel = duration===d
              return (
                <button key={d} onClick={() => setDuration(d)} style={{
                  flex:1, padding:'10px 0', borderRadius:8,
                  border:`1px solid ${sel?'#E23744':'#2A2A2A'}`,
                  background:sel?'#E2374410':'transparent',
                  color:sel?'#E23744':'#7A7570',
                  fontSize:13, fontWeight:sel?700:400, cursor:'pointer', fontFamily:'inherit',
                }}>{d}m</button>
              )
            })}
          </div>
        </div>

        {/* Impact preview */}
        <div style={{
          background:'#F59E0B0A', border:'1px solid #F59E0B22',
          borderRadius:10, padding:12, marginBottom:22,
        }}>
          <p style={{ fontSize:12, color:'#F59E0B', lineHeight:1.65 }}>
            ⚡ For the next <strong>{duration} minutes</strong>, new orders get{' '}
            <strong>+{buffer}m</strong> added to KPT — riders dispatched later,
            arriving when food is actually ready.
          </p>
        </div>

        {/* Activate */}
        <button onClick={handleActivate} disabled={loading} style={{
          width:'100%', padding:'14px 0', borderRadius:12, border:'none',
          background:loading?'#2A2A2A':'linear-gradient(135deg,#E23744,#FF6B35)',
          color:loading?'#7A7570':'white',
          fontSize:15, fontWeight:800, fontFamily:'Syne, sans-serif',
          cursor:loading?'not-allowed':'pointer',
          boxShadow:loading?'none':'0 6px 24px #E2374438',
          transition:'all 0.2s',
        }}>
          {loading?'Activating...':`🔥 Activate Rush · +${buffer}m KPT Buffer`}
        </button>
      </div>
    </div>
  )
}
export default RushModal
