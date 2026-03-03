// src/components/dashboard/Header.jsx
// Standalone header component (alternative to PageShell for custom layouts)
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href:'/dashboard', label:'📋 Live Orders' },
  { href:'/analytics', label:'📊 Analytics' },
  { href:'/signals',   label:'📡 Signals' },
]

export function Header({ rushActive=false, buffer=0, stats={}, onRushClick, onRushEnd }) {
  const path = usePathname()
  const ticker = [
    '🔴 LIVE SIGNAL MONITORING',
    `KPT ACCURACY: ${stats.kptAccuracy||68}%`,
    `ORDERS: ${stats.preparingCount||0}`,
    `OVERDUE: ${stats.overdueCount||0}`,
    `RUSH BUFFER: +${buffer}m`,
  ].join('  ·  ')

  return (
    <header style={{ flexShrink:0 }}>
      <div style={{ background:'#E23744', height:28, overflow:'hidden', display:'flex', alignItems:'center' }}>
        <div style={{ display:'flex', animation:'ticker 35s linear infinite', whiteSpace:'nowrap' }}>
          {[1,2].map(i=>(
            <span key={i} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.06em',padding:'0 40px',color:'white' }}>
              {ticker}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
      <div style={{
        borderBottom:'1px solid #2A2A2A',height:62,padding:'0 28px',background:'#0D0D0D',
        display:'flex',alignItems:'center',justifyContent:'space-between',
      }}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#E23744,#FF6B35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>🍽️</div>
          <div>
            <p style={{ fontSize:15,fontWeight:800,fontFamily:'Syne, sans-serif',color:'#F0EDE8',lineHeight:1 }}>KPT Signal Hub</p>
            <p style={{ fontSize:11,color:'#7A7570',marginTop:2 }}>Spice Garden · Koramangala</p>
          </div>
        </div>
        <nav style={{ display:'flex',gap:4 }}>
          {NAV.map(n=>{
            const active=path===n.href
            return <Link key={n.href} href={n.href} style={{ padding:'7px 14px',borderRadius:8,fontSize:13,fontWeight:active?600:400,background:active?'#E2374415':'transparent',color:active?'#E23744':'#7A7570',border:`1px solid ${active?'#E2374430':'transparent'}` }}>{n.label}</Link>
          })}
        </nav>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:6,background:rushActive?'#E2374415':'#22C55E15',border:`1px solid ${rushActive?'#E2374430':'#22C55E30'}`,color:rushActive?'#E23744':'#22C55E' }}>
            <span style={{ animation:rushActive?'blink 1s infinite':'none' }}>●</span>
            {rushActive?`RUSH ON · +${buffer}m`:'NORMAL OPS'}
          </div>
          {rushActive
            ? <button onClick={onRushEnd} style={{ padding:'7px 16px',borderRadius:9,border:'1px solid #2A2A2A',background:'transparent',color:'#7A7570',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>End Rush</button>
            : <button onClick={onRushClick} style={{ padding:'8px 20px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#E23744,#FF6B35)',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 18px #E2374432' }}>🔥 Mark Rush</button>
          }
        </div>
      </div>
    </header>
  )
}
export default Header
