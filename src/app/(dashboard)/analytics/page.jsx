'use client'
import { useState } from 'react'
import { PageShell } from '@/components/dashboard/PageShell'
import { KPTChart }  from '@/components/dashboard/KPTChart'
import { useRush }   from '@/hooks/useRush'
import { simulateImpact, calculateKptBuffer } from '@/lib/kpt-calculator'

const CHART_DATA = [
  { time: '12:00', predicted: 18, actual: 24 },
  { time: '12:30', predicted: 20, actual: 26 },
  { time: '13:00', predicted: 25, actual: 38 },
  { time: '13:30', predicted: 30, actual: 35 },
  { time: '14:00', predicted: 22, actual: 28 },
  { time: '14:30', predicted: 18, actual: 20 },
  { time: '15:00', predicted: 16, actual: 17 },
]

const IMPACT_ROWS = [
  { metric:'Rider Wait Time',   baseline:'6.1 min',  partial:'3.8 min', full:'2.4 min', change:'-60%' },
  { metric:'ETA Error (P50)',   baseline:'4.2 min',  partial:'2.9 min', full:'1.8 min', change:'-57%' },
  { metric:'ETA Error (P90)',   baseline:'11.4 min', partial:'7.6 min', full:'5.1 min', change:'-55%' },
  { metric:'Order Delay Rate',  baseline:'18.2%',    partial:'11.4%',   full:'7.1%',    change:'-61%' },
  { metric:'KPT Label Noise',   baseline:'HIGH',     partial:'MEDIUM',  full:'LOW',     change:'↓↓↓'  },
  { metric:'FOR Bias Detected', baseline:'0%',       partial:'43%',     full:'91%',     change:'+91%' },
]

const SIM_ORDERS = [
  { orderId:'ZMT-4821', kptEstimate:22, actualPrepTime:28, items:[] },
  { orderId:'ZMT-4820', kptEstimate:28, actualPrepTime:35, items:[] },
  { orderId:'ZMT-4819', kptEstimate:15, actualPrepTime:17, items:[] },
  { orderId:'ZMT-4818', kptEstimate:20, actualPrepTime:26, items:[] },
  { orderId:'ZMT-4817', kptEstimate:35, actualPrepTime:43, items:[] },
]

function Spark({ data, color }) {
  const w=80, h=28, min=Math.min(...data), max=Math.max(...data), range=(max-min)||1
  const pts = data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*(h-6)-3}`).join(' ')
  return (
    <svg width={w} height={h} style={{overflow:'visible'}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-((data[data.length-1]-min)/range)*(h-6)-3} r="3.5" fill={color}/>
    </svg>
  )
}

function TopStat({ label, value, sub, color, spark }) {
  return (
    <div style={{ background:'#161616',border:'1px solid #2A2A2A',borderRadius:16,padding:22 }}>
      <p style={{ fontSize:11,color:'#7A7570',marginBottom:12 }}>{label}</p>
      <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:36,fontWeight:800,fontFamily:'Syne, sans-serif',color,lineHeight:1 }}>{value}</div>
          <div style={{ fontSize:12,color:'#22C55E',marginTop:7 }}>↑ {sub}</div>
        </div>
        {spark && <Spark data={spark} color={color}/>}
      </div>
    </div>
  )
}

function SimPanel() {
  const [rush, setRush]       = useState(70)
  const [score, setScore]     = useState(7)
  const buf    = calculateKptBuffer(rush)
  const result = simulateImpact(SIM_ORDERS,{
    rushBuffer: buf, complexityScore: score,
    forTrustScore: 0.68, externalRushProbability: rush>60?65:30,
  })
  return (
    <div style={{ background:'#161616',border:'1px solid #2A2A2A',borderRadius:16,padding:26,marginTop:20 }}>
      <h2 style={{ fontSize:16,fontWeight:700,fontFamily:'Syne, sans-serif',marginBottom:4 }}>🧪 Live Signal Simulation</h2>
      <p style={{ fontSize:12,color:'#7A7570',marginBottom:22 }}>Drag sliders to see real-time impact on KPT predictions</p>

      {/* Sliders */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:22,marginBottom:22 }}>
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
            <span style={{ fontSize:12,color:'#7A7570' }}>Rush Level</span>
            <span style={{ fontSize:12,fontWeight:700,color:'#E23744' }}>{rush}/100 → +{buf}m buffer</span>
          </div>
          <input type="range" min={0} max={100} value={rush} onChange={e=>setRush(+e.target.value)} style={{accentColor:'#E23744'}}/>
        </div>
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
            <span style={{ fontSize:12,color:'#7A7570' }}>Order Complexity</span>
            <span style={{ fontSize:12,fontWeight:700,color:'#3B82F6' }}>{score}/10</span>
          </div>
          <input type="range" min={1} max={10} value={score} onChange={e=>setScore(+e.target.value)} style={{accentColor:'#3B82F6'}}/>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20 }}>
        {[
          {l:'Avg Error — Baseline',     v:`${result.summary.avgBaselineError}m`, c:'#E23744'},
          {l:'Avg Error — With Signals', v:`${result.summary.avgImprovedError}m`, c:'#22C55E'},
          {l:'Error Reduction',          v:`${result.summary.errorReductionPercent}%`, c:'#F59E0B'},
        ].map(s=>(
          <div key={s.l} style={{ background:'#1E1E1E',border:'1px solid #2A2A2A',borderRadius:12,padding:'14px 16px' }}>
            <div style={{ fontSize:10,color:'#7A7570',marginBottom:5 }}>{s.l}</div>
            <div style={{ fontSize:24,fontWeight:800,fontFamily:'Syne, sans-serif',color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #2A2A2A' }}>
              {['Order','Base KPT','With Signals','Actual','Base Err','Signal Err','Saved'].map(h=>(
                <th key={h} style={{ textAlign:'left',padding:'8px 10px',color:'#7A7570',fontWeight:600,fontSize:11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.orders.map(r=>(
              <tr key={r.orderId} style={{ borderBottom:'1px solid #161616' }}>
                <td style={{ padding:'10px',color:'#F0EDE8',fontFamily:'monospace',fontSize:11 }}>{r.orderId}</td>
                <td style={{ padding:'10px',color:'#7A7570' }}>{r.baseline}m</td>
                <td style={{ padding:'10px',color:'#3B82F6',fontWeight:600 }}>{r.improved}m</td>
                <td style={{ padding:'10px',color:'#F0EDE8' }}>{r.actual}m</td>
                <td style={{ padding:'10px',color:'#E23744' }}>{r.baselineError}m</td>
                <td style={{ padding:'10px',color:'#22C55E' }}>{r.improvedError}m</td>
                <td style={{ padding:'10px',fontWeight:700,color:r.improvement>0?'#22C55E':'#7A7570' }}>
                  {r.improvement>0?`-${r.improvement}m`:'—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { rushActive, rushBuffer } = useRush()
  return (
    <PageShell activePage="/analytics" rushActive={rushActive} rushBuffer={rushBuffer}>

      {/* Top stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:22 }}>
        <TopStat label="KPT Accuracy (all signals)" value="89%"  sub="+21% vs baseline 68%"      color="#22C55E" spark={[68,71,75,79,83,86,89]}/>
        <TopStat label="Rider Wait Reduction"       value="60%"  sub="6.1min → 2.4min avg"       color="#3B82F6" spark={[6.1,5.4,4.2,3.7,3.1,2.7,2.4]}/>
        <TopStat label="Signals Collected Today"    value="41"   sub="FOR + Rush + Rider + Score" color="#F59E0B" spark={[5,8,13,19,26,34,41]}/>
      </div>

      {/* Chart */}
      <div style={{ background:'#161616',border:'1px solid #2A2A2A',borderRadius:16,padding:26,marginBottom:20 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:16,fontWeight:700,fontFamily:'Syne, sans-serif' }}>Predicted vs Actual KPT — Lunch Rush</h2>
            <p style={{ fontSize:12,color:'#7A7570',marginTop:5 }}>Blue = model prediction · Red/Green = actual outcome</p>
          </div>
          <div style={{ textAlign:'right',fontSize:11,color:'#7A7570' }}>
            <p>Peak: 13:00–14:00</p>
            <p style={{ color:'#E23744',marginTop:2 }}>Worst gap: +13m at 13:00</p>
          </div>
        </div>
        <KPTChart data={CHART_DATA} height={240}/>
        <div style={{ marginTop:16,padding:'12px 14px',background:'#E2374408',border:'1px solid #E2374420',borderRadius:10 }}>
          <p style={{ fontSize:12,color:'#E23744',lineHeight:1.65 }}>
            ⚠️ <strong>Without rush signals:</strong> At 13:00 model predicted 25m but actual was 38m (+13m).
            8+ riders waited idle. With Rush Override, KPT = 37m — riders dispatched 10m later, arriving right on time.
          </p>
        </div>
      </div>

      {/* Impact table */}
      <div style={{ background:'#161616',border:'1px solid #2A2A2A',borderRadius:16,padding:26 }}>
        <h2 style={{ fontSize:16,fontWeight:700,fontFamily:'Syne, sans-serif',marginBottom:5 }}>Success Metric Impact — Signal Comparison</h2>
        <p style={{ fontSize:12,color:'#7A7570',marginBottom:20 }}>Simulated improvement as signals are progressively added</p>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #2A2A2A' }}>
                {['Metric','Baseline (No Signals)','Rush + Complexity','All 5 Signals','Δ Improvement'].map(h=>(
                  <th key={h} style={{ textAlign:'left',padding:'10px 14px',color:'#7A7570',fontWeight:600,fontSize:11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {IMPACT_ROWS.map((r,i)=>(
                <tr key={r.metric} style={{ borderBottom:'1px solid #1A1A1A',background:i%2===0?'transparent':'#0A0A0A' }}>
                  <td style={{ padding:'13px 14px',color:'#F0EDE8',fontWeight:500 }}>{r.metric}</td>
                  <td style={{ padding:'13px 14px',color:'#E23744' }}>{r.baseline}</td>
                  <td style={{ padding:'13px 14px',color:'#F59E0B' }}>{r.partial}</td>
                  <td style={{ padding:'13px 14px',color:'#22C55E',fontWeight:600 }}>{r.full}</td>
                  <td style={{ padding:'13px 14px',color:'#22C55E',fontWeight:800,fontFamily:'Syne, sans-serif' }}>{r.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SimPanel/>
    </PageShell>
  )
}
