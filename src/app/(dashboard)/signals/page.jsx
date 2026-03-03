
'use client'
import { useRush }    from '@/hooks/useRush'
import { useSignals } from '@/hooks/useSignals'
import { PageShell }  from '@/components/dashboard/PageShell'
import { getSignalHealthColor, getSignalHealthLabel } from '@/constants/signals'

// ── Signal architecture data ──────────────────────────────────────────────────
const SIGNAL_CARDS = [
  {
    id: 'merchant_for',
    emoji: '📍',
    title: 'FOR Signal (Merchant-Marked)',
    status: 'Noisy', statusColor: '#E23744',
    desc: 'Merchants tap "Food Ready" in the Zomato Mx app — but 43% of the time this happens when the rider arrives, not when food is actually ready. Creates a 4–8 minute systematic bias baked into every KPT label.',
    metrics: [{ k: 'Avg Bias', v: '+5.2 min' }, { k: 'Rider-Triggered Rate', v: '43%' }, { k: 'Confidence', v: '0.70' }],
    fix: 'We add confidence 0.70 to FOR signals and cross-validate with rider feedback. Biased restaurants get auto-downweighted within one week of feedback data.',
    fixColor: '#F59E0B',
    confidenceBar: 70,
  },
  {
    id: 'rush_override',
    emoji: '🔥',
    title: 'Kitchen Rush Signal (This App)',
    status: 'Live', statusColor: '#22C55E',
    desc: 'Merchants proactively mark kitchen rush state with reason codes before orders pile up. System immediately applies a dynamic KPT buffer — rider dispatch delayed before the kitchen becomes overwhelmed.',
    metrics: [{ k: 'Confidence', v: '0.90' }, { k: 'Buffer Range', v: '+3 to +12m' }, { k: 'Noise Reduction', v: '~70%' }],
    fix: 'Replaces reactive rider-waiting with proactive buffering. Merchant reports rush BEFORE food is delayed — rider dispatched at exactly the right time.',
    fixColor: '#22C55E',
    confidenceBar: 90,
  },
  {
    id: 'rider_feedback',
    emoji: '🏍️',
    title: 'Rider Feedback Signal',
    status: 'Collecting', statusColor: '#22C55E',
    desc: 'After each delivery, riders answer one question: "Was food ready when you arrived?" Binary ground-truth signal for KPT model retraining — directly de-noising the biased FOR signal over time.',
    metrics: [{ k: 'Confidence', v: '0.95' }, { k: 'Collection Rate', v: '91%' }, { k: 'Label Quality', v: 'HIGH' }],
    fix: 'Weekly model retraining uses rider feedback as ground truth. Restaurants with consistently biased FOR get automatically downweighted in the prediction pipeline.',
    fixColor: '#22C55E',
    confidenceBar: 95,
  },
  {
    id: 'complexity_score',
    emoji: '🧮',
    title: 'Order Complexity Score',
    status: 'Live', statusColor: '#3B82F6',
    desc: 'Deterministic rule-based scoring 1–10 based on item categories, quantities, and customizations. Biryani × 2 with extras = 9. Sandwich = 3. Runs in <10ms per order — zero overhead, 100% coverage.',
    metrics: [{ k: 'Confidence', v: '0.85' }, { k: 'Coverage', v: '100%' }, { k: 'Latency', v: '<10ms' }],
    fix: 'Feeds directly into KPT prediction as a multiplier. Eliminates "all orders look the same" problem — the model now knows biryani takes longer than a sandwich.',
    fixColor: '#3B82F6',
    confidenceBar: 85,
  },
  {
    id: 'external_rush',
    emoji: '📊',
    title: 'External Rush — AI Agent',
    status: 'Planned', statusColor: '#8B5CF6',
    desc: 'Claude AI agent polls Google Maps "busy times" every 15 min to infer non-Zomato kitchen load — dine-in + competitor platform surge. Solves the biggest blind spot: Zomato has zero visibility into offline demand.',
    metrics: [{ k: 'Confidence', v: '0.60' }, { k: 'Refresh Rate', v: '15 min' }, { k: 'Source', v: 'Google Maps API' }],
    fix: 'inferExternalRush() in anthropic.js calls Claude with time/day context → returns { rushProbability, reason, confidence }. Ready to wire into /api/rush/activate as auto-trigger.',
    fixColor: '#8B5CF6',
    confidenceBar: 60,
  },
  {
    id: 'iot_vision',
    emoji: '📸',
    title: 'IoT / Computer Vision (Bonus)',
    status: 'Bonus', statusColor: '#6B7280',
    desc: 'Computer vision on kitchen camera detects food packaging activity → auto-triggers accurate FOR signal with zero merchant interaction. Eliminates human bias entirely. Viable for top-500 high-volume chains.',
    metrics: [{ k: 'Accuracy', v: '~88%' }, { k: 'Human Bias', v: 'Zero' }, { k: 'Target', v: 'Top 500 chains' }],
    fix: 'Long-term: auto-FOR from vision replaces merchant tapping entirely for chains where hardware ROI is justified. Pilot-able as opt-in for 10-restaurant chain.',
    fixColor: '#6B7280',
    confidenceBar: 88,
  },
]

// ── Aggregation pipeline steps ────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { label: 'Base KPT',           sub: 'Category × Qty',    color: '#7A7570' },
  { op: '→' },
  { label: '+Rush Buffer',       sub: '0 – 12 min',         color: '#E23744' },
  { op: '+' },
  { label: 'Complexity ×',       sub: '0.84 – 1.20',        color: '#3B82F6' },
  { op: '+' },
  { label: 'FOR Trust Δ',        sub: '0 – 4 min',          color: '#F59E0B' },
  { op: '+' },
  { label: 'External Rush',      sub: '0 – 5 min',          color: '#8B5CF6' },
  { op: '=' },
  { label: 'Predicted KPT',      sub: 'Final output',       color: '#22C55E' },
]

// ── Signal card component ─────────────────────────────────────────────────────
function SignalCard({ card, index }) {
  return (
    <div style={{
      background: '#161616',
      border: '1px solid #2A2A2A',
      borderRadius: 16,
      padding: 22,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      animation: `fadeUp 0.4s ease ${index * 0.07}s both`,
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#3A3A3A'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#2A2A2A'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>{card.emoji}</span>
          <h3 style={{
            fontSize: 14, fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            color: '#F0EDE8', lineHeight: 1.3,
          }}>{card.title}</h3>
        </div>
        <span style={{
          flexShrink: 0, marginLeft: 12,
          padding: '3px 10px', borderRadius: 20,
          fontSize: 10, fontWeight: 800,
          background: `${card.statusColor}18`,
          color: card.statusColor,
          border: `1px solid ${card.statusColor}35`,
          whiteSpace: 'nowrap',
        }}>{card.status}</span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#9A9490', lineHeight: 1.7 }}>{card.desc}</p>

      {/* Confidence bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 10, color: '#7A7570' }}>
          <span>SIGNAL CONFIDENCE</span>
          <span style={{ fontWeight: 700, color: getSignalHealthColor(card.confidenceBar) }}>
            {card.confidenceBar}% — {getSignalHealthLabel(card.confidenceBar)}
          </span>
        </div>
        <div style={{ height: 4, background: '#2A2A2A', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${card.confidenceBar}%`,
            background: getSignalHealthColor(card.confidenceBar),
            borderRadius: 2,
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* Metrics pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {card.metrics.map(m => (
          <div key={m.k} style={{
            background: '#1E1E1E',
            border: '1px solid #2A2A2A',
            borderRadius: 8,
            padding: '5px 10px',
          }}>
            <div style={{ fontSize: 9, color: '#7A7570', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.k}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F0EDE8', marginTop: 1 }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Fix / impact */}
      <div style={{
        borderTop: '1px solid #2A2A2A',
        paddingTop: 12,
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>💡</span>
        <p style={{ fontSize: 12, color: card.fixColor, lineHeight: 1.65 }}>{card.fix}</p>
      </div>
    </div>
  )
}

// ── Live signal health bars ───────────────────────────────────────────────────
function LiveHealthBars({ signalHealth }) {
  if (!signalHealth) return null
  return (
    <div style={{
      background: '#161616', border: '1px solid #2A2A2A',
      borderRadius: 16, padding: 22, marginBottom: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', color: '#F0EDE8' }}>
          📊 Live Signal Health — Right Now
        </h3>
        <span style={{ fontSize: 10, color: '#7A7570' }}>Polling every 30s</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {Object.entries(signalHealth).map(([key, s]) => {
          const color = getSignalHealthColor(s.quality)
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#F0EDE8', fontWeight: 500 }}>{s.label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800, color,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  padding: '1px 7px', borderRadius: 20,
                }}>{s.quality}%</span>
              </div>
              <div style={{ height: 5, background: '#2A2A2A', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${s.quality}%`,
                  background: color, borderRadius: 3,
                  transition: 'width 0.8s ease',
                }} />
              </div>
              {s.description && (
                <p style={{ fontSize: 10, color: '#7A7570', marginTop: 4, lineHeight: 1.5 }}>{s.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SignalsPage() {
  const { rushActive, rushBuffer } = useRush()
  const { signalHealth, metrics }  = useSignals(rushActive)

  return (
    <PageShell
      activePage="/signals"
      rushActive={rushActive}
      rushBuffer={rushBuffer}
      metrics={metrics}
    >
      {/* Page intro */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 26, fontWeight: 800,
          fontFamily: 'Syne, sans-serif',
          letterSpacing: '-0.035em',
          marginBottom: 10, lineHeight: 1,
          background: 'linear-gradient(135deg, #F0EDE8, #9A9490)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Signal Enrichment Architecture
        </h2>
        <p style={{ fontSize: 14, color: '#7A7570', lineHeight: 1.75, maxWidth: 680 }}>
          Each signal addresses a specific blind spot in Zomato&apos;s current KPT prediction.
          Signals are weighted by confidence score and aggregated before reaching the model.
          Higher-confidence signals dominate lower ones.
        </p>
      </div>

      {/* Confidence weight legend */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 24,
        flexWrap: 'wrap', alignItems: 'center',
        padding: '12px 16px',
        background: '#161616', border: '1px solid #2A2A2A',
        borderRadius: 12,
      }}>
        <span style={{ fontSize: 11, color: '#7A7570', fontWeight: 600 }}>Confidence weights:</span>
        {[
          { label: '0.95 · Rider Feedback', color: '#22C55E' },
          { label: '0.90 · Rush Override',  color: '#F59E0B' },
          { label: '0.85 · Complexity',     color: '#3B82F6' },
          { label: '0.70 · Merchant FOR',   color: '#E23744' },
          { label: '0.60 · External Rush',  color: '#8B5CF6' },
        ].map(c => (
          <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9A9490' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }} />
            {c.label}
          </span>
        ))}
      </div>

      {/* Live health bars from real DB */}
      <LiveHealthBars signalHealth={signalHealth} />

      {/* Signal cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {SIGNAL_CARDS.map((card, i) => (
          <SignalCard key={card.id} card={card} index={i} />
        ))}
      </div>

      {/* Aggregation pipeline diagram */}
      <div style={{
        background: '#161616', border: '1px solid #2A2A2A',
        borderRadius: 16, padding: 24,
      }}>
        <h3 style={{
          fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif',
          marginBottom: 6, color: '#F0EDE8',
        }}>
          How Signals Aggregate → Final KPT Prediction
        </h3>
        <p style={{ fontSize: 12, color: '#7A7570', marginBottom: 20 }}>
          Every order runs through this pipeline in &lt;50ms when created via /api/orders POST
        </p>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 8, flexWrap: 'wrap',
        }}>
          {PIPELINE_STEPS.map((step, i) => (
            step.op ? (
              <span key={i} style={{ fontSize: 20, color: '#3A3A3A', lineHeight: 1 }}>{step.op}</span>
            ) : (
              <div key={i} style={{
                background: `${step.color}12`,
                border: `1px solid ${step.color}28`,
                borderRadius: 10, padding: '9px 14px',
                textAlign: 'center', minWidth: 80,
              }}>
                <div style={{ fontWeight: 600, color: step.color, fontSize: 13 }}>{step.label}</div>
                <div style={{ fontSize: 10, color: '#7A7570', marginTop: 3 }}>{step.sub}</div>
              </div>
            )
          ))}
        </div>

        {/* Code reference */}
        <div style={{
          marginTop: 20, padding: '12px 14px',
          background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: 10,
          fontSize: 12, fontFamily: 'monospace', color: '#7A7570',
          lineHeight: 1.8,
        }}>
          <span style={{ color: '#8B5CF6' }}>aggregateKptPrediction</span>
          <span style={{ color: '#F0EDE8' }}>(baseEstimate, {'{'}</span>
          <span style={{ color: '#3B82F6' }}> rushBuffer, complexityScore, forTrustScore, externalRushProbability </span>
          <span style={{ color: '#F0EDE8' }}>{'}'}) </span>
          <span style={{ color: '#7A7570' }}>// → {'{'} predictedKpt, confidence, signalsApplied[] {'}'}</span>
          <br />
          <span style={{ color: '#7A7570' }}> // defined in src/lib/kpt-calculator.js · called by /api/orders POST</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PageShell>
  )
}
