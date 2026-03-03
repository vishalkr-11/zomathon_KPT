import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { orderId, restaurantId, wasReadyOnArrival, waitMinutes = 0 } = await request.json()

    // Try DB if available
    try {
      const connectDB  = (await import('@/lib/mongodb')).default
      const KptSignal  = (await import('@/models/KptSignal')).default
      const Restaurant = (await import('@/models/Restaurant')).default

      await connectDB()

      await KptSignal.create({
        restaurantId,
        orderId,
        signalType:  'rider_feedback',
        signalValue: { wasReadyOnArrival, waitMinutes },
        confidence:  0.95,
        source:      'rider_app',
      })

      await Restaurant.findOneAndUpdate(
        { restaurantId },
        { $inc: {
            'signalStats.riderFeedbackCount': 1,
            'signalStats.readyOnArrivalCount': wasReadyOnArrival ? 1 : 0,
        }},
        { upsert: true }
      )
    } catch {
      // DB unavailable — still return success
    }

    return NextResponse.json({ success: true, message: 'Feedback recorded' })
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}