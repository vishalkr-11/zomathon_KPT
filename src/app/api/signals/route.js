// src/app/api/signals/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import KptSignal from '@/models/KptSignal'
import RushEvent from '@/models/RushEvent'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get('restaurantId') || 'rest_koramangala_001'

  try {
    await connectDB()

    const activeRush = await RushEvent.findOne({
      restaurantId,
      status: 'active',
    }).lean()

    const recentSignals = await KptSignal.find({ restaurantId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    return NextResponse.json({
      signalHealth: {
        forSignal:      { quality: 68, label: 'FOR Signal Quality',       description: '32% are rider-triggered (biased)' },
        riderFeedback:  { quality: 91, label: 'Rider Feedback Coverage',  description: '91% of orders have rider feedback' },
        rushCoverage:   { quality: activeRush ? 95 : 32, label: 'Rush Signal Coverage', description: activeRush ? 'Rush mode active' : 'No rush reported' },
        complexityScore:{ quality: 85, label: 'Complexity Score Accuracy',description: 'Deterministic — always available' },
      },
      metrics: {
        kptAccuracy:           activeRush ? 84 : 68,
        avgRiderWaitMins:      activeRush ? 2.8 : 4.8,
        totalOrdersToday:      23,
        signalsCollectedToday: recentSignals.length || 41,
      },
      activeRush,
      recentSignals,
    })
  } catch (err) {
    // Return mock data if DB not connected
    return NextResponse.json({
      signalHealth: {
        forSignal:      { quality: 68, label: 'FOR Signal Quality',        description: '32% are rider-triggered (biased)' },
        riderFeedback:  { quality: 91, label: 'Rider Feedback Coverage',   description: '91% of orders have rider feedback' },
        rushCoverage:   { quality: 32, label: 'Rush Signal Coverage',      description: 'No rush reported' },
        complexityScore:{ quality: 85, label: 'Complexity Score Accuracy', description: 'Deterministic — always available' },
      },
      metrics: {
        kptAccuracy: 68, avgRiderWaitMins: 4.8,
        totalOrdersToday: 23, signalsCollectedToday: 41,
      },
      activeRush: null,
      recentSignals: [],
    })
  }
}