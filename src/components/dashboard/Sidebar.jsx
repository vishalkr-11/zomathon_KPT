// src/components/dashboard/Sidebar.jsx
// Left sidebar — restaurant info + navigation + rush status
// Optional component if you want a sidebar layout (not used in current pages which use top-nav)

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📋', label: 'Live Orders',    desc: 'Active kitchen orders' },
  { href: '/analytics', icon: '📊', label: 'KPT Analytics',  desc: 'Charts & impact data' },
  { href: '/signals',   icon: '📡', label: 'Signal Quality', desc: 'Signal health overview' },
]

export function Sidebar({ restaurantName = 'Spice Garden', zone = 'Koramangala', rushActive = false, buffer = 0 }) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 220, height: '100vh', flexShrink: 0,
      background: '#0A0A0A', borderRight: '1px solid #2A2A2A',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'DM Sans, sans-serif',
      position: 'sticky', top: 0,
    }}>

      {/* Brand + restaurant */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #E23744, #FF6B35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
          }}>🍽️</div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#F0EDE8', lineHeight: 1 }}>
              KPT Signal Hub
            </p>
            <p style={{ fontSize: 10, color: '#7A7570', marginTop: 2 }}>Zomato Merchant</p>
          </div>
        </div>

        {/* Restaurant badge */}
        <div style={{
          background: '#161616', border: '1px solid #2A2A2A',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#F0EDE8' }}>{restaurantName}</p>
          <p style={{ fontSize: 10, color: '#7A7570', marginTop: 2 }}>{zone}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
              background: active ? '#E2374415' : 'transparent',
              border: `1px solid ${active ? '#E2374430' : 'transparent'}`,
              color: active ? '#E23744' : '#7A7570',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = '#1E1E1E')}
              onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#E23744' : '#F0EDE8', lineHeight: 1 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 10, color: '#7A7570', marginTop: 2 }}>{item.desc}</p>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Rush status at bottom */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #2A2A2A' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderRadius: 10,
          background: rushActive ? '#E2374415' : '#22C55E15',
          border: `1px solid ${rushActive ? '#E2374430' : '#22C55E30'}`,
          color: rushActive ? '#E23744' : '#22C55E',
          fontSize: 11, fontWeight: 700,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
          {rushActive ? `RUSH ACTIVE · +${buffer}m` : 'NORMAL OPERATIONS'}
        </div>
        <p style={{ fontSize: 10, color: '#3A3A3A', textAlign: 'center', marginTop: 10 }}>
          Zomathon 2025 · PS1: KPT
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
