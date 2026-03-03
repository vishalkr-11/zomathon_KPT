// src/app/api/rush/activate/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import RushEvent from '@/models/RushEvent'
import KptSignal from '@/models/KptSignal'

// This function handles POST /api/rush/activate
export async function POST(request) {
  try {
   
  try {
    // 1. Connect to DB
    await connectDB()

    // 2. Parse the request body
    const body = await request.json()
    const { restaurantId, rushLevel, reasons, durationMins } = body

    // 3. Validate input
    if (!restaurantId || rushLevel === undefined) {
      return NextResponse.json(
        { error: 'restaurantId and rushLevel are required' },
        { status: 400 }   // 400 = Bad Request
      )
    }

    // 4. Calculate buffer
    const kptBufferAdded = rushLevel >= 75 ? 12 : rushLevel >= 45 ? 7 : 3

    // 5. Deactivate any existing rush for this restaurant
    await RushEvent.updateMany(
      { restaurantId, isActive: true },
      { isActive: false, endedAt: new Date() }
    )

    // 6. Create new rush event in MongoDB
    const rushEvent = await RushEvent.create({
      restaurantId,
      rushLevel,
      reasons,
      durationMins,
      kptBufferAdded,
      isActive: true,
    })

    // 7. Also log it as a KPT signal
    await KptSignal.create({
      restaurantId,
      signalType: 'rush_override',
      signalValue: { rushLevel, reasons, buffer: kptBufferAdded },
      confidence: 0.9,
      source: 'merchant_app',
    })

    // 8. Return success response
    return NextResponse.json({
      success: true,
      bufferAdded: kptBufferAdded,
      rushEventId: rushEvent._id,
    }, { status: 201 })  // 201 = Created

  } catch (error) {
    console.error('Rush activate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

   
  } catch (error) {
    
  }
}