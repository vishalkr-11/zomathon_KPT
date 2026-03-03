// src/components/ui/Card.jsx
// <Card title="..." subtitle="..." action={<button />}>children</Card>

'use client'
export function Card({ children, title, subtitle, action, noPadding=false }) {
  return (
    <div style={{
      background:'#161616', border:'1px solid #2A2A2A',
      borderRadius:16, padding: noPadding ? 0 : 20, overflow:'hidden',
    }}>
      {(title || action) && (
        <div style={{
          display:'flex', alignItems:'flex-start',
          justifyContent:'space-between', marginBottom:16,
          padding: noPadding ? '16px 20px 0' : 0,
        }}>
          <div>
            {title && <h3 style={{ fontSize:14, fontWeight:700, fontFamily:'Syne, sans-serif', color:'#F0EDE8', lineHeight:1 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize:11, color:'#7A7570', marginTop:4 }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
export default Card
