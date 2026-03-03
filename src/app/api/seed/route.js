

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Restaurant from '@/models/Restaurant'
import Order from '@/models/Order'
import RushEvent from '@/models/RushEvent'
import KptSignal from '@/models/KptSignal'

const RESTAURANT_ID = 'rest_koramangala_001'

const DEMO_RESTAURANT = {
  restaurantId: RESTAURANT_ID,
  name: 'Spice Garden',
  location: {
    city: 'Bangalore',
    zone: 'Koramangala',
    googlePlaceId: 'ChIJXXXXXXXXXXXX', // mock
  },
  cuisine: ['North Indian', 'Biryani', 'Mughlai'],
  priceRange: 'mid',
  signalStats: {
    forTrustScore: 0.68,
    avgKptAccuracy: 0.72,
    avgRiderWaitMins: 4.2,
    totalOrdersTracked: 1247,
    lastUpdated: new Date(),
  },
}

const DEMO_ORDERS = [
  {
    orderId: 'ZMT-4821',
    restaurantId: RESTAURANT_ID,
    items: [
      { name: 'Butter Chicken', category: 'curry', quantity: 1, price: 320, customizations: ['extra gravy'] },
      { name: 'Butter Naan', category: 'bread', quantity: 2, price: 60, customizations: [] },
    ],
    status: 'preparing',
    kptEstimate: 22,
    kptAdjusted: 24,
    complexityScore: 6,
    confirmedAt: new Date(Date.now() - 14 * 60 * 1000), // 14 mins ago
    totalValue: 440,
    customer: { customerId: 'cust_001', deliveryZone: 'Koramangala 5th Block' },
  },
  {
    orderId: 'ZMT-4820',
    restaurantId: RESTAURANT_ID,
    items: [
      { name: 'Veg Biryani', category: 'biryani', quantity: 1, price: 280, customizations: ['less spicy', 'extra raita'] },
    ],
    status: 'ready',
    kptEstimate: 28,
    kptAdjusted: 31,
    complexityScore: 9,
    confirmedAt: new Date(Date.now() - 32 * 60 * 1000),
    forMarkedAt: new Date(Date.now() - 3 * 60 * 1000),
    totalValue: 280,
    customer: { customerId: 'cust_002', deliveryZone: 'Koramangala 4th Block' },
  },
  {
    orderId: 'ZMT-4819',
    restaurantId: RESTAURANT_ID,
    items: [
      { name: 'Masala Dosa', category: 'dosa', quantity: 3, price: 120, customizations: [] },
      { name: 'Filter Coffee', category: 'beverage', quantity: 2, price: 60, customizations: [] },
    ],
    status: 'preparing',
    kptEstimate: 15,
    kptAdjusted: 17,
    complexityScore: 5,
    confirmedAt: new Date(Date.now() - 6 * 60 * 1000),
    totalValue: 480,
    customer: { customerId: 'cust_003', deliveryZone: 'HSR Layout' },
  },
  {
    orderId: 'ZMT-4818',
    restaurantId: RESTAURANT_ID,
    items: [
      { name: 'Paneer Tikka', category: 'curry', quantity: 1, price: 350, customizations: ['extra paneer'] },
      { name: 'Garlic Naan', category: 'bread', quantity: 4, price: 80, customizations: [] },
    ],
    status: 'dispatched',
    kptEstimate: 20,
    kptAdjusted: 22,
    complexityScore: 7,
    confirmedAt: new Date(Date.now() - 55 * 60 * 1000),
    forMarkedAt: new Date(Date.now() - 35 * 60 * 1000),
    riderArrivedAt: new Date(Date.now() - 33 * 60 * 1000),
    riderPickedAt: new Date(Date.now() - 32 * 60 * 1000),
    actualPrepTime: 22,
    riderWaitTime: 2,
    riderFeedback: {
      foodWasReady: true,
      observedWaitMins: 2,
      submittedAt: new Date(Date.now() - 20 * 60 * 1000),
    },
    totalValue: 670,
    customer: { customerId: 'cust_004', deliveryZone: 'Indiranagar' },
  },
  {
    orderId: 'ZMT-4817',
    restaurantId: RESTAURANT_ID,
    items: [
      { name: 'Chicken Biryani', category: 'biryani', quantity: 1, price: 380, customizations: ['extra chicken', 'less spice'] },
    ],
    status: 'preparing',
    kptEstimate: 35,
    kptAdjusted: 40,
    complexityScore: 10,
    confirmedAt: new Date(Date.now() - 10 * 60 * 1000),
    totalValue: 380,
    customer: { customerId: 'cust_005', deliveryZone: 'Koramangala 7th Block' },
  },
]

export async function POST(request) {
  try {
    await connectDB()

    // Clear existing demo data
    await Promise.all([
      Restaurant.deleteMany({ restaurantId: RESTAURANT_ID }),
      Order.deleteMany({ restaurantId: RESTAURANT_ID }),
      RushEvent.deleteMany({ restaurantId: RESTAURANT_ID }),
      KptSignal.deleteMany({ restaurantId: RESTAURANT_ID }),
    ])

    // Insert fresh demo data
    const [restaurant, orders] = await Promise.all([
      Restaurant.create(DEMO_RESTAURANT),
      Order.insertMany(DEMO_ORDERS),
    ])

    // Add some historical KPT signals for the analytics chart
    const signalHistory = []
    for (let i = 7; i >= 0; i--) {
      const recordedAt = new Date(Date.now() - i * 60 * 60 * 1000)
      signalHistory.push({
        restaurantId: RESTAURANT_ID,
        signalType: 'merchant_for',
        signalValue: {
          elapsedMins: 18 + Math.floor(Math.random() * 12),
          estimatedKpt: 20,
          diffFromEstimate: 3 + Math.floor(Math.random() * 8),
        },
        confidence: 0.70,
        source: 'merchant_app',
        recordedAt,
      })
    }
    await KptSignal.insertMany(signalHistory)

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      created: {
        restaurants: 1,
        orders: orders.length,
        signals: signalHistory.length,
      },
    })
  } catch (error) {
    console.error('[POST /api/seed]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET — just returns what's in the DB (useful for checking)
export async function GET() {
  await connectDB()
  const orders = await Order.find({ restaurantId: RESTAURANT_ID })
  const restaurant = await Restaurant.findOne({ restaurantId: RESTAURANT_ID })
  return NextResponse.json({ restaurant, orders, count: orders.length })
}
