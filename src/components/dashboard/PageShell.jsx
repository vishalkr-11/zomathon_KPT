// src/components/dashboard/PageShell.jsx
// Shared layout shell for all 3 pages: dashboard, analytics, signals
// Renders: ticker tape + header with nav + rush button + page content

'use client'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard', label: '📋 Live Orders' },
  { href: '/analytics', label: '📊 Analytics' },
  { href: '/signals',   label: '📡 Signals' },
]

export function PageShell({
  children,
  activePage,
  rushActive = false,
  rushBuffer = 0,
  metrics = {},
  preparingCount = 0,
  overdueCount = 0,
  onRushClick,
  onRushEnd,
}) {
  const ticker = [
    '🔴 LIVE · KPT SIGNAL HUB',
    `KPT ACCURACY: ${metrics?.kptAccuracy || 68}%`,
    `ACTIVE ORDERS: ${preparingCount}`,
    `OVERDUE: ${overdueCount}`,
    `RUSH BUFFER: +${rushBuffer}m`,
    `AVG RIDER WAIT: ${metrics?.avgRiderWaitMins || 4.8}min`,
    'ZOMATHON 2025 · PS1: KPT IMPROVEMENT',
  ].join('   ·   ')

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', flexDirection: 'column' }}>

      {/* ── Ticker tape ── */}
      <div style={{
        background: '#E23744', height: 28, overflow: 'hidden',
        display: 'flex', alignItems: 'center', flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', whiteSpace: 'nowrap',
          animation: 'ticker 40s linear infinite',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'white', padding: '0 48px' }}>
            {ticker}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'white', padding: '0 48px' }}>
            {ticker}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid #2A2A2A',
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        background: '#0D0D0D',
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #E23744, #FF6B35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 16px #E2374435',
          }}>🍽️</div>
          <div>
            <p style={{
              fontSize: 15, fontWeight: 800, lineHeight: 1, color: '#F0EDE8',
              fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em',
            }}>KPT Signal Hub</p>
            <p style={{ fontSize: 11, color: '#7A7570', marginTop: 2 }}>Spice Garden · Koramangala</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => {
            const active = activePage === n.href
            return (
              <Link key={n.href} href={n.href} style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 13,
                fontWeight: active ? 600 : 400,
                background: active ? '#E2374415' : 'transparent',
                color: active ? '#E23744' : '#7A7570',
                border: `1px solid ${active ? '#E2374430' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                {n.label}
              </Link>
            )
          })}
        </nav>

        {/* Rush controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: rushActive ? '#E2374415' : '#22C55E15',
            border: `1px solid ${rushActive ? '#E2374435' : '#22C55E35'}`,
            color: rushActive ? '#E23744' : '#22C55E',
          }}>
            <span style={{ animation: rushActive ? 'blink 1s infinite' : 'none', lineHeight: 1 }}>●</span>
            {rushActive ? `RUSH ON · +${rushBuffer}m` : 'NORMAL OPS'}
          </div>

          {/* Action button */}
          {rushActive ? (
            <button onClick={onRushEnd} style={{
              padding: '7px 16px', borderRadius: 9,
              border: '1px solid #2A2A2A', background: 'transparent',
              color: '#7A7570', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
              onMouseOver={e => { e.currentTarget.style.color = '#E23744'; e.currentTarget.style.borderColor = '#E23744' }}
              onMouseOut={e => { e.currentTarget.style.color = '#7A7570'; e.currentTarget.style.borderColor = '#2A2A2A' }}
            >End Rush</button>
          ) : (
            <button onClick={onRushClick} style={{
              padding: '8px 20px', borderRadius: 9,
              border: 'none', background: 'linear-gradient(135deg, #E23744, #FF6B35)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 18px #E2374432',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 22px #E2374450' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px #E2374432' }}
            >🔥 Mark Rush</button>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1, padding: '24px 28px', minHeight: 0 }}>
        {children}
      </main>
    </div>
  )
}

export default PageShell
