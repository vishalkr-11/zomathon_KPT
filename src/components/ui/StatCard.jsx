// src/components/ui/StatCard.jsx
// <StatCard icon="⏳" value={5} label="Active" color="#F59E0B" />

'use client'
export function StatCard({ icon, value, label, color='#F59E0B', sub, trend }) {
  return (
    <div style={{
      background:'#161616', border:'1px solid #2A2A2A',
      borderRadius:14, padding:16,
    }}>
      {icon && <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>}
      <div style={{ fontSize:28, fontWeight:800, color, fontFamily:'Syne, sans-serif', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:'#7A7570', marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'#22C55E', marginTop:3 }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ fontSize:11, color: trend>=0 ? '#E23744' : '#22C55E', marginTop:3, fontWeight:600 }}>
          {trend >= 0 ? `↑ +${trend}` : `↓ ${trend}`}
        </div>
      )}
    </div>
  )
}
export default StatCard
