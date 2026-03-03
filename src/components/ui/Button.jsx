// src/components/ui/Button.jsx
// <Button variant="primary" size="md" onClick={fn}>Label</Button>

'use client'
const V = {
  primary:   { bg: 'linear-gradient(135deg,#E23744,#FF6B35)', color:'#fff',    border:'none',               shadow:'0 4px 16px #E2374430' },
  secondary: { bg: 'transparent',                             color:'#F0EDE8', border:'1px solid #2A2A2A',  shadow:'none' },
  danger:    { bg: '#E2374412',                               color:'#E23744', border:'1px solid #E2374428',shadow:'none' },
  success:   { bg: '#22C55E12',                               color:'#22C55E', border:'1px solid #22C55E28',shadow:'none' },
  ghost:     { bg: 'transparent',                             color:'#7A7570', border:'none',               shadow:'none' },
}
const S = {
  sm: { padding:'5px 11px',  fontSize:11, borderRadius:7  },
  md: { padding:'8px 18px',  fontSize:13, borderRadius:9  },
  lg: { padding:'12px 24px', fontSize:15, borderRadius:11 },
}
export function Button({ children, onClick, variant='primary', size='md', disabled=false, fullWidth=false, type='button' }) {
  const v = V[variant] || V.primary
  const s = S[size]    || S.md
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...s,
      background: v.bg, color: v.color, border: v.border, boxShadow: v.shadow,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'inherit', fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.18s',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      whiteSpace: 'nowrap',
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = '0.82')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = '1')}
    >{children}</button>
  )
}
export default Button
