// src/components/dashboard/SignalHealthCard.jsx
'use client'

function qc(q) { return q>=80?'#22C55E':q>=50?'#F59E0B':'#E23744' }
function ql(q) { return q>=80?'GOOD':q>=50?'OK':'WEAK' }

export function SignalHealthCard({ signals }) {
  const entries = Object.entries(signals)
  return (
    <div style={{ background:'#161616', border:'1px solid #2A2A2A', borderRadius:16, padding:18 }}>
      <p style={{ fontSize:13, fontWeight:700, fontFamily:'Syne, sans-serif', color:'#F0EDE8', marginBottom:16 }}>
        📡 Signal Health
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {entries.map(([key,s]) => {
          const c = qc(s.quality)
          return (
            <div key={key}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <span style={{ fontSize:12, color:'#F0EDE8', fontWeight:500 }}>{s.label}</span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{
                    fontSize:9, fontWeight:800, color:c,
                    background:`${c}18`, border:`1px solid ${c}28`,
                    padding:'1px 6px', borderRadius:20,
                  }}>{ql(s.quality)}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:c }}>{s.quality}%</span>
                </div>
              </div>
              <div style={{ height:5, background:'#2A2A2A', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${s.quality}%`, background:c, borderRadius:3, transition:'width 0.8s ease' }}/>
              </div>
              {s.description && <p style={{ fontSize:10, color:'#7A7570', marginTop:4 }}>{s.description}</p>}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid #2A2A2A' }}>
        <a href="/signals" style={{ fontSize:11, color:'#3B82F6' }}>View full signal architecture →</a>
      </div>
    </div>
  )
}
export default SignalHealthCard
