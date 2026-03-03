// src/lib/anthropic.js
//
// Singleton Anthropic/Claude client.
// Import this in any API route that needs AI — don't create new clients.
//
// Usage:
//   import anthropic from '@/lib/anthropic'
//   const response = await anthropic.messages.create({ ... })

import Anthropic from '@anthropic-ai/sdk'

// ── Validate API key on startup ───────────────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '\n⚠️  ANTHROPIC_API_KEY is not set.\n' +
    '   AI features (advisor + external rush agent) will not work.\n' +
    '   Add it to your .env.local file:\n' +
    '   ANTHROPIC_API_KEY=sk-ant-...\n' +
    '   Get your key at: https://console.anthropic.com\n'
  )
}

// ── Create client once, reuse everywhere ─────────────────────────────────────
// In Next.js, this module is cached after first import — singleton pattern
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'missing-key',

  // Default request options
  defaultHeaders: {
    'anthropic-version': '2023-06-01',
  },
})

// ── Helper: make a simple text completion ────────────────────────────────────
// Use this for quick AI calls that don't need full message history
//
// Example:
//   const text = await quickComplete('What is 2+2?', 50)
//   // returns "4"
export async function quickComplete(prompt, maxTokens = 200) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  return response.content[0]?.text || ''
}

// ── Helper: get structured JSON from Claude ──────────────────────────────────
// Prompts Claude to return ONLY valid JSON — parses it for you
//
// Example:
//   const data = await getJSON('Return {"status": "ok"}')
//   // returns { status: 'ok' }
export async function getJSON(prompt, maxTokens = 300) {
  const systemPrompt =
    'You are a JSON API. Respond ONLY with valid JSON. ' +
    'No markdown, no explanation, no backticks. Pure JSON only.'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0]?.text || '{}'

  try {
    return JSON.parse(raw)
  } catch {
    // If Claude sneaks in markdown fences despite instructions, strip them
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  }
}

// ── External Rush Agent ───────────────────────────────────────────────────────
// Infers kitchen rush probability from available context (time, day, history)
// In production this would also call Google Maps Places API for busyness data
//
// Returns: { rushProbability: 0-100, reason: string, confidence: 0-1 }
export async function inferExternalRush(restaurant) {
  const now = new Date()
  const hour = now.getHours()
  const day  = now.toLocaleDateString('en-IN', { weekday: 'long' })
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const prompt = `
Restaurant: ${restaurant.name}
Location: ${restaurant.location?.zone}, ${restaurant.location?.city}
Cuisine: ${restaurant.cuisine?.join(', ')}
Seating capacity: ${restaurant.seatingCapacity || 0} (0 = takeaway only)
Current time: ${time} IST
Day of week: ${day}
Peak orders/hour: ${restaurant.peakOrdersPerHour || 15}

Based on typical Indian food delivery and dine-in patterns, estimate the kitchen rush probability RIGHT NOW.

Consider:
- Lunch peak: 12:00–14:30 IST (especially weekdays)
- Dinner peak: 19:00–21:30 IST (especially weekends)  
- Biryani/curry restaurants get dine-in + Zomato + Swiggy orders simultaneously
- ${day} weekend/weekday factor

Return JSON: { "rushProbability": <0-100>, "reason": "<one sentence>", "confidence": <0.0-1.0> }
`

  try {
    const result = await getJSON(prompt, 150)
    return {
      rushProbability: Math.min(100, Math.max(0, result.rushProbability || 0)),
      reason:     result.reason || 'AI-inferred from time and day patterns',
      confidence: result.confidence || 0.6,
    }
  } catch {
    // Fallback: simple rule-based estimate if AI fails
    const isLunch  = hour >= 12 && hour <= 14
    const isDinner = hour >= 19 && hour <= 21
    const isWeekend = ['Saturday', 'Sunday'].includes(day)

    let prob = 20
    if (isLunch)  prob += 45
    if (isDinner) prob += 40
    if (isWeekend) prob += 15

    return {
      rushProbability: Math.min(100, prob),
      reason: `Rule-based estimate: ${isLunch ? 'lunch' : isDinner ? 'dinner' : 'off-peak'} on ${day}`,
      confidence: 0.5,
    }
  }
}

export default anthropic
