// src/app/api/orders/[id]/mark-ready/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import KptSignal from '@/models/KptSignal'

// POST /api/orders/ZMT-4821/mark-ready
export async function POST(request, { params }) {
  await connectDB()

  const orderId = params.id   // "ZMT-4821" comes from the URL

  const order = await Order.findOneAndUpdate(
    { orderId },
    {
      status: 'ready',
      forMarkedAt: new Date(),
    },
    { new: true }   // return updated document
  )

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Log this FOR signal with timestamp
  await KptSignal.create({
    orderId,
    restaurantId: order.restaurantId,
    signalType: 'merchant_for',
    signalValue: {
      markedAt: new Date(),
      estimatedKpt: order.kptEstimate,
      elapsedTime: (new Date() - order.createdAt) / 1000 / 60,  // minutes
    },
    confidence: 0.7,   // merchant-marked, potentially biased
    source: 'merchant_app',
  })

  return NextResponse.json({ success: true, order })
}