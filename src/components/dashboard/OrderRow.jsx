// src/components/dashboard/OrderRow.jsx
'use client'
import { getRushLevel } from '@/constants/signals'

function barColor(pct, overdue) {
  if (overdue)  return 'linear-gradient(90deg,#E23744,#FF6B35)'
  if (pct > 70) return 'linear-gradient(90deg,#F59E0B,#F97316)'
  return 'linear-gradient(90deg,#22C55E,#16A34A)'
}

function dotColor(status, overdue) {
  if (['ready','dispatched','delivered'].includes(status)) return '#22C55E'
  if (overdue) return '#E23744'
  return '#F59E0B'
}

export function OrderRow({ order, onMarkReady }) {
  const elapsed   = Math.round(order.elapsedMins || 0)
  const estimated = order.kptAdjusted || order.kptEstimate || 20
  const pct       = Math.min((elapsed / estimated) * 100, 100)
  const preparing = order.status === 'preparing'
  const done      = ['ready','dispatched','delivered'].includes(order.status)
  const overdue   = preparing && elapsed > estimated
  const dc        = dotColor(order.status, overdue)
  const cx        = getRushLevel((order.complexityScore || 5) * 10)
  const itemStr   = order.items?.length
    ? order.items.map(i => `${i.name}${i.quantity>1?` ×${i.quantity}`:''}`).join(', ')
    : '—'

  return (
    <div style={{
      background:'#1E1E1E',
      border:`1px solid ${overdue?'#E2374430':'#2A2A2A'}`,
      borderRadius:12, padding:'14px 16px',
      display:'flex', alignItems:'center', gap:14,
      transition:'border-color 0.3s',
    }}>
      {/* Status dot with pulse */}
      <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
        <div style={{ width:10, height:10, borderRadius:'50%', background:dc }}/>
        {preparing && (
          <div style={{
            position:'absolute', inset:0, borderRadius:'50%', background:dc,
            animation:'pulse-ring 1.5s ease-out infinite',
          }}/>
        )}
      </div>

      {/* Order info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
          <span style={{ fontSize:11, color:'#7A7570', fontWeight:500, fontFamily:'monospace' }}>
            {order.orderId}
          </span>
          <span style={{ fontSize:11, fontWeight:600, color:overdue?'#E23744':'#7A7570' }}>
            {elapsed}m / {estimated}m
            {order.kptAdjusted && order.kptAdjusted !== order.kptEstimate && (
              <span style={{ color:'#3B82F6', marginLeft:5, fontSize:10 }}>
                (base {order.kptEstimate}m +signal)
              </span>
            )}
          </span>
        </div>
        <p style={{
          fontSize:13, fontWeight:500, color:'#F0EDE8', marginBottom:8,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>{itemStr}</p>
        <div style={{ height:4, background:'#2A2A2A', borderRadius:2, overflow:'hidden' }}>
          <div style={{
            height:'100%', width:`${pct}%`,
            background:barColor(pct,overdue), borderRadius:2,
            transition:'width 0.6s ease',
          }}/>
        </div>
      </div>

      {/* Complexity badge */}
      <div title={`Complexity: ${order.complexityScore}/10`} style={{
        flexShrink:0, width:32, height:32, borderRadius:8,
        background:`${cx.color}18`, border:`1px solid ${cx.color}30`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:12, fontWeight:800, color:cx.color,
      }}>{order.complexityScore || '?'}</div>

      {/* Action */}
      {preparing ? (
        <button onClick={() => onMarkReady(order.orderId)} style={{
          flexShrink:0, padding:'7px 14px', borderRadius:8,
          border:'1px solid #2A2A2A', background:'transparent',
          color:'#F0EDE8', fontSize:12, fontWeight:600,
          cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', whiteSpace:'nowrap',
        }}
          onMouseOver={e => { e.currentTarget.style.background='#22C55E18'; e.currentTarget.style.borderColor='#22C55E'; e.currentTarget.style.color='#22C55E' }}
          onMouseOut={e  => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#2A2A2A'; e.currentTarget.style.color='#F0EDE8' }}
        >✓ Ready</button>
      ) : (
        <div style={{
          flexShrink:0, padding:'7px 14px', borderRadius:8,
          background:'#22C55E12', border:'1px solid #22C55E28',
          color:'#22C55E', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
        }}>
          {order.status==='dispatched'||order.status==='delivered'?'Dispatched ✓':'Ready ✓'}
        </div>
      )}
    </div>
  )
}
export default OrderRow
