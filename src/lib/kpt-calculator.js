// src/lib/kpt-calculator.js
// Pure functions — no DB, no API calls, just math
// These run on both server (API routes) and client (simulation)

// ─── Base preparation times per food category (in minutes) ───────────────────
export const CATEGORY_BASE_TIMES = {
  biryani: 25,
  curry: 20,
  dosa: 12,
  sandwich: 8,
  pizza: 18,
  burger: 10,
  chinese: 15,
  thali: 30,
  beverage: 3,
  dessert: 8,
  salad: 6,
  noodles: 12,
  rice: 15,
  bread: 8,
  default: 15,
}

// ─── Complexity Score (1–10) ──────────────────────────────────────────────────
// Takes an array of order items, returns a score and estimated KPT
export function computeComplexityScore(items) {
  if (!items || items.length === 0) {
    return { score: 1, estimatedMins: 10, breakdown: [] }
  }

  let totalMins = 0

  for (const item of items) {
    const base = CATEGORY_BASE_TIMES[item.category] || CATEGORY_BASE_TIMES.default
    const qty = item.quantity || 1
    const customs = item.customizations?.length || 0

    // Logic:
    // - First unit takes full base time
    // - Each extra unit only adds 40% (kitchen can partially parallelize)
    // - Each customization (extra spicy, no onion, etc.) adds 1.5 min overhead
    totalMins += base + (qty - 1) * (base * 0.4) + customs * 1.5
  }

  // Multi-item orders have packaging/plating overhead
  if (items.length > 2) {
    totalMins += items.length * 1.5
  }

  // Normalize to 1–10 scale
  // ≤4 min total = score 1, 40+ min total = score 10
  const score = Math.max(1, Math.min(10, Math.round(totalMins / 4)))

  return {
    score,
    estimatedMins: Math.round(totalMins),
    breakdown: items.map(item => ({
      name: item.name,
      category: item.category,
      baseTime: CATEGORY_BASE_TIMES[item.category] || CATEGORY_BASE_TIMES.default,
      quantity: item.quantity || 1,
    })),
  }
}

// ─── KPT Buffer from Rush Level ──────────────────────────────────────────────
export function calculateKptBuffer(rushLevel) {
  if (rushLevel >= 75) return 12  // High rush = +12 min
  if (rushLevel >= 45) return 7   // Medium rush = +7 min
  if (rushLevel >= 20) return 3   // Low rush = +3 min
  return 0                         // No rush = no buffer
}

// ─── Signal Aggregator ───────────────────────────────────────────────────────
// Takes base KPT estimate + all signal context → returns adjusted prediction
// This is the function that "feeds better signals to the model"
export function aggregateKptPrediction(baseEstimate, context = {}) {
  let adjusted = baseEstimate

  const {
    rushBuffer = 0,          // from merchant rush marking
    complexityScore = 5,     // order complexity 1–10
    forTrustScore = 0.7,     // how reliable this restaurant's FOR signal is
    externalRushProbability = 0, // from AI agent / Google Maps
    historicalBias = 0,      // this restaurant's historical over/under prediction
  } = context

  // 1. Rush buffer (direct addition)
  adjusted += rushBuffer

  // 2. Complexity scaling
  // Score of 5 = neutral (×1.0), score of 10 = +20% time, score of 1 = -16% time
  const complexityMultiplier = 1 + (complexityScore - 5) * 0.04
  adjusted *= complexityMultiplier

  // 3. FOR trust adjustment
  // Unreliable FOR (low trust) = add conservative buffer
  if (forTrustScore < 0.5) {
    adjusted += 4
  } else if (forTrustScore < 0.7) {
    adjusted += 2
  }

  // 4. External rush (inferred from AI agent)
  if (externalRushProbability > 70) {
    adjusted += 5
  } else if (externalRushProbability > 45) {
    adjusted += 2
  }

  // 5. Correct for known historical bias
  // If this restaurant consistently runs 3 min over prediction, add it back
  adjusted += historicalBias

  // Calculate which signals actually changed the prediction
  const signalsApplied = []
  if (rushBuffer > 0) signalsApplied.push(`rush_buffer(+${rushBuffer}m)`)
  if (complexityScore !== 5) signalsApplied.push(`complexity(×${complexityMultiplier.toFixed(2)})`)
  if (forTrustScore < 0.7) signalsApplied.push('for_trust_penalty')
  if (externalRushProbability > 45) signalsApplied.push('external_rush')
  if (historicalBias !== 0) signalsApplied.push(`historical_bias(${historicalBias > 0 ? '+' : ''}${historicalBias}m)`)

  return {
    predictedKpt: Math.max(5, Math.round(adjusted)), // minimum 5 min
    baseEstimate,
    adjustedBy: Math.round(adjusted - baseEstimate),
    signalsApplied,
    confidence: forTrustScore,
  }
}

// ─── FOR Trust Score Calculator ───────────────────────────────────────────────
// Given array of {forMarkedAt, riderArrivedAt} records for a restaurant,
// calculate how trustworthy their FOR signal is
export function calculateForTrustScore(records) {
  if (!records || records.length === 0) return 0.7 // default neutral trust

  const biases = records.map(r => {
    const forTime = new Date(r.forMarkedAt)
    const riderTime = new Date(r.riderArrivedAt)
    // Positive = merchant marked ready BEFORE rider arrived (good)
    // Negative = merchant marked ready AFTER rider arrived (bad — rider triggered)
    return (forTime - riderTime) / 1000 / 60 // in minutes
  })

  // Count how many times merchant marked AFTER rider arrived
  const riderTriggeredCount = biases.filter(b => b > -1).length // within 1 min = suspicious
  const riderTriggeredRate = riderTriggeredCount / biases.length

  // Trust score: 1.0 = always marks before rider, 0.0 = always marks when rider arrives
  const trustScore = Math.max(0.1, 1 - riderTriggeredRate)

  return Math.round(trustScore * 100) / 100
}

// ─── Simulation: Before vs After your signals ────────────────────────────────
// Used for the demo/presentation to show judges impact
export function simulateImpact(orders, signalContext) {
  const results = orders.map(order => {
    const baseline = order.kptEstimate
    const withSignals = aggregateKptPrediction(baseline, signalContext)

    const actualKpt = order.actualPrepTime || baseline + 5 // mock actual

    const baselineError = Math.abs(actualKpt - baseline)
    const improvedError = Math.abs(actualKpt - withSignals.predictedKpt)

    return {
      orderId: order.orderId,
      baseline,
      improved: withSignals.predictedKpt,
      actual: actualKpt,
      baselineError,
      improvedError,
      improvement: baselineError - improvedError,
    }
  })

  const avgBaselineError = results.reduce((sum, r) => sum + r.baselineError, 0) / results.length
  const avgImprovedError = results.reduce((sum, r) => sum + r.improvedError, 0) / results.length
  const errorReduction = ((avgBaselineError - avgImprovedError) / avgBaselineError * 100).toFixed(1)

  return {
    orders: results,
    summary: {
      avgBaselineError: avgBaselineError.toFixed(1),
      avgImprovedError: avgImprovedError.toFixed(1),
      errorReductionPercent: errorReduction,
      riderWaitReduction: (avgBaselineError * 0.7).toFixed(1), // ~70% of error = rider wait
    },
  }
}
