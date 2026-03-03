// src/components/dashboard/KPTChart.jsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DEFAULT = [
  { time:'12:00', predicted:18, actual:24 },
  { time:'12:30', predicted:20, actual:26 },
  { time:'13:00', predicted:25, actual:38 },
  { time:'13:30', predicted:30, actual:35 },
  { time:'14:00', predicted:22, actual:28 },
  { time:'14:30', predicted:18, actual:20 },
  { time:'15:00', predicted:16, actual:17 },
]

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const pred = payload.find(p=>p.dataKey==='predicted')?.value
  const act  = payload.find(p=>p.dataKey==='actual')?.value
  const delta = act && pred ? act - pred : null
  return (
    <div style={{ background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:10, padding:'10px 14px', fontSize:12, fontFamily:'DM Sans, sans-serif' }}>
      <p style={{ color:'#7A7570', marginBottom:8, fontWeight:600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color:p.color, marginBottom:3 }}>
          {p.dataKey==='predicted'?'🔵 Predicted':'🔴 Actual'}: <strong>{p.value}m</strong>
        </p>
      ))}
      {delta !== null && (
        <p style={{ color:delta>0?'#E23744':'#22C55E', borderTop:'1px solid #2A2A2A', marginTop:6, paddingTop:6, fontWeight:700 }}>
          {delta>0?`⚠️ +${delta}m over`:`✓ ${Math.abs(delta)}m under`}
        </p>
      )}
    </div>
  )
}

export function KPTChart({ data=DEFAULT, height=220 }) {
  return (
    <div>
      <div style={{ display:'flex', gap:16, fontSize:11, color:'#7A7570', justifyContent:'center', marginBottom:12 }}>
        {[['#3B82F6','Predicted KPT'],['#E23744','Actual (over)'],['#22C55E','Actual (under)']].map(([c,l])=>(
          <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:10, height:10, background:c, borderRadius:2, display:'inline-block' }}/>
            {l}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barGap={3} barCategoryGap="28%" margin={{ top:4, right:4, left:-16, bottom:0 }}>
          <XAxis dataKey="time"
            tick={{ fill:'#7A7570', fontSize:11, fontFamily:'DM Sans, sans-serif' }}
            axisLine={false} tickLine={false}/>
          <YAxis
            tick={{ fill:'#7A7570', fontSize:11, fontFamily:'DM Sans, sans-serif' }}
            axisLine={false} tickLine={false} unit="m"/>
          <Tooltip content={<Tip/>} cursor={{ fill:'#ffffff05' }}/>
          <Bar dataKey="predicted" radius={[4,4,0,0]} fill="#3B82F6"/>
          <Bar dataKey="actual" radius={[4,4,0,0]}>
            {data.map((e,i) => <Cell key={i} fill={e.actual>e.predicted?'#E23744':'#22C55E'}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
export default KPTChart
