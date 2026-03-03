// src/components/ui/Badge.jsx
// <Badge label="HIGH" color="#E23744" />

'use client'
export function Badge({ label, color = '#22C55E', size = 'sm' }) {
  const fs  = size === 'lg' ? 12 : 10
  const pad = size === 'lg' ? '4px 12px' : '2px 8px'
  return (
    <span style={{
      display: 'inline-block',
      padding: pad, borderRadius: 20,
      background: `${color}18`, color,
      border: `1px solid ${color}35`,
      fontSize: fs, fontWeight: 700,
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em',
      fontFamily: 'DM Sans, sans-serif',
    }}>{label}</span>
  )
}
export default Badge
