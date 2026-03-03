// src/app/(dashboard)/dashboard/page.jsx
'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageShell }        from '@/components/dashboard/PageShell'
import { OrderRow }         from '@/components/dashboard/OrderRow'
import { RushGauge }        from '@/components/dashboard/RushGauge'
import { RushModal }        from '@/components/dashboard/RushModal'
import { AIAdvisor }        from '@/components/dashboard/AIAdvisor'
import { SignalHealthCard } from '@/components/dashboard/SignalHealthCard'
import { useOrders }  from '@/hooks/useOrders'
import { useRush }    from '@/hooks/useRush'
import { useSignals } from '@/hooks/useSignals'

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_koramangala_001'

function MiniStat({ icon, value, label, color }) {
  return (
    <div style={{ background:'#161616', border:'1px solid #2A2A2A', borderRadius:14, padding:'16px 18px' }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:800, color, fontFamily:'Syne, sans-serif', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:'#7A7570', marginTop:5 }}>{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { orders, loading, markReady }  = useOrders()
  const { rushActive, rushLevel, setRushLevel, rushBuffer, activateRush, deactivateRush } = useRush()
  const { signalHealth, metrics }       = useSignals(rushActive)
  const [showModal, setShowModal]       = useState(false)

  const preparing = orders.filter(o => o.status === 'preparing')
  const done      = orders.filter(o => ['ready','dispatched','delivered'].includes(o.status))
  const overdue   = preparing.filter(o => (o.elapsedMins||0) > (o.kptAdjusted||o.kptEstimate||20))

  async function handleMarkReady(orderId) {
    await markReady(orderId)
    toast.success(`${orderId} marked as ready`)
  }

  async function handleActivate(params) {
    await activateRush(params)
    const buf = params.rushLevel >= 75 ? 12 : params.rushLevel >= 45 ? 7 : 3
    toast.warning(`Rush ON — +${buf}m buffer applied to incoming orders`)
    setShowModal(false)
  }

  async function handleDeactivate() {
    await deactivateRush()
    toast.info('Rush ended — buffer removed')
  }

  return (
    <PageShell
      activePage="/dashboard"
      rushActive={rushActive}
      rushBuffer={rushBuffer}
      metrics={metrics}
      preparingCount={preparing.length}
      overdueCount={overdue.length}
      onRushClick={() => setShowModal(true)}
      onRushEnd={handleDeactivate}
    >
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
       <MiniStat icon="⏳" value={preparing.length}  label="Preparing"    color="#F59E0B" />
<MiniStat icon="⚠️" value={overdue.length}    label="Overdue"      color="#E23744" />
<MiniStat icon="✅" value={done.length}        label="Completed"    color="#22C55E" />
<MiniStat icon="🎯" value={`${metrics?.kptAccuracy||68}%`} label="KPT Accuracy" color="#3B82F6" />
 </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 308px', gap:20 }}>
        <div>
          <div style={{ display:'flex', gap:16, fontSize:11, color:'#7A7570', marginBottom:12 }}>
            {[['#22C55E','On Track'],['#F59E0B','Near Limit'],['#E23744','Overdue'],['#3B82F6','Complexity']].map(([c,l]) => (
              <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:8,height:8,borderRadius:2,background:c,display:'inline-block' }} />{l}
              </span>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign:'center', padding:60, color:'#7A7570' }}>
              <div style={{ width:24,height:24,borderRadius:'50%',border:'2px solid #2A2A2A',borderTopColor:'#E23744',animation:'spin 0.8s linear infinite',margin:'0 auto 12px' }} />
              Loading orders...
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div style={{ textAlign:'center',padding:'60px 24px',background:'#161616',border:'1px solid #2A2A2A',borderRadius:16 }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📭</div>
              <p style={{ color:'#7A7570',marginBottom:10 }}>No orders yet.</p>
              <code style={{ background:'#2A2A2A',padding:'5px 12px',borderRadius:6,fontSize:12,color:'#F0EDE8' }}>
                curl -X POST http://localhost:3000/api/seed
              </code>
              <p style={{ fontSize:11,color:'#7A7570',marginTop:10 }}>Run once to load demo data</p>
            </div>
          )}

          {!loading && orders.map((o,i) => (
            <div key={o._id||o.orderId} style={{ marginBottom:10, animation:`fadeUp 0.35s ease ${i*0.04}s both` }}>
              <OrderRow order={o} onMarkReady={handleMarkReady} />
            </div>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'#161616', border:'1px solid #2A2A2A', borderRadius:16, padding:20 }}>
            <p style={{ fontSize:13, fontWeight:700, fontFamily:'Syne, sans-serif', color:'#F0EDE8', marginBottom:16 }}>
              Kitchen Rush Score
            </p>
            <RushGauge level={rushLevel} active={rushActive} buffer={rushBuffer} />
            {!rushActive && (
              <div style={{ marginTop:14 }}>
                <input type="range" min={0} max={100} value={rushLevel}
                  onChange={e => setRushLevel(Number(e.target.value))}
                  style={{ width:'100%', accentColor:'#E23744' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#7A7570', marginTop:4 }}>
                  <span>Quiet</span><span>Moderate</span><span>Packed</span>
                </div>
                <p style={{ fontSize:11, color:'#7A7570', marginTop:10, lineHeight:1.55 }}>
                  Set intensity then click <strong style={{color:'#F0EDE8'}}>Mark Rush</strong> to activate.
                </p>
              </div>
            )}
            {rushActive && (
              <div style={{ marginTop:14, padding:'10px 12px', borderRadius:10, background:'#E2374410', border:'1px solid #E2374420' }}>
                <p style={{ fontSize:11, color:'#E23744', lineHeight:1.55 }}>
                  Rush active — +{rushBuffer}m delay on new rider dispatches.
                </p>
                <button onClick={handleDeactivate} style={{
                  marginTop:9, width:'100%', padding:'7px 0', borderRadius:8,
                  border:'1px solid #E2374430', background:'transparent',
                  color:'#E23744', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                }}>End Rush Mode</button>
              </div>
            )}
          </div>

          <AIAdvisor
            restaurantId={RESTAURANT_ID}
            rushActive={rushActive}
            rushLevel={rushLevel}
            activeOrderCount={preparing.length}
            overdueOrderCount={overdue.length}
            kptBuffer={rushBuffer}
          />

          {signalHealth && <SignalHealthCard signals={signalHealth} />}

          <div style={{ padding:14, borderRadius:12, background:'#3B82F608', border:'1px solid #3B82F618' }}>
            <p style={{ fontSize:11, color:'#3B82F6', lineHeight:1.65 }}>
              Mark rush before your kitchen gets overwhelmed — not after.
              Proactive signals give Zomato time to hold rider dispatch.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <RushModal
          initialLevel={rushLevel}
          onActivate={handleActivate}
          onClose={() => setShowModal(false)}
        />
      )}
    </PageShell>
  )
}
