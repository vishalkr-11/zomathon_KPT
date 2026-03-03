// src/components/dashboard/RushGauge.jsx
'use client'
import { getRushLevel } from '@/constants/signals'

export function RushGauge({ level=0, active=false, buffer=0 }) {
  const { color, label } = getRushLevel(level)
  const r = 52, circ = Math.PI * r
  const offset = circ - (level / 100) * circ

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      <svg width={140} height={88} viewBox="0 0 140 88" style={{ overflow:'visible' }}>
        {/* Track */}
        <path d="M 18,76 A 52,52 0 0,1 122,76"
          fill="none" stroke="#2A2A2A" strokeWidth={12} strokeLinecap="round"/>
        {/* Fill */}
        <path d="M 18,76 A 52,52 0 0,1 122,76"
          fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition:'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1),stroke 0.4s' }}/>
        {/* Value */}
        <text x="70" y="60" textAnchor="middle"
          fill={color} fontSize="28" fontWeight="800" fontFamily="Syne, sans-serif">{level}</text>
        <text x="70" y="76" textAnchor="middle"
          fill="#7A7570" fontSize="11" fontFamily="DM Sans, sans-serif">Rush Score</text>
      </svg>

      <div style={{
        display:'inline-flex', alignItems:'center', gap:7,
        padding:'5px 14px', borderRadius:20,
        background:`${color}12`, border:`1px solid ${color}30`,
        color, fontSize:11, fontWeight:800,
      }}>
        <span style={{ animation:active?'blink 1s infinite':'none', fontSize:8, lineHeight:1 }}>●</span>
        {active ? `RUSH ACTIVE · +${buffer}m buffer` : `${label} · No Rush`}
      </div>
    </div>
  )
}
export default RushGauge
