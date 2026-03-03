import { NextResponse } from 'next/server'

const MOCK_ORDERS = [
  { _id:'1', orderId:'ZMT-4821', status:'preparing', elapsedMins:14, kptEstimate:22, kptAdjusted:26, complexityScore:7,
    items:[{name:'Butter Chicken',category:'curry',quantity:1},{name:'Naan',category:'bread',quantity:2}] },
  { _id:'2', orderId:'ZMT-4820', status:'ready',     elapsedMins:28, kptEstimate:28, kptAdjusted:33, complexityScore:9,
    items:[{name:'Veg Biryani',category:'biryani',quantity:1}] },
  { _id:'3', orderId:'ZMT-4819', status:'preparing', elapsedMins:5,  kptEstimate:15, kptAdjusted:18, complexityScore:5,
    items:[{name:'Masala Dosa',category:'dosa',quantity:3},{name:'Filter Coffee',category:'beverage',quantity:2}] },
  { _id:'4', orderId:'ZMT-4818', status:'preparing', elapsedMins:10, kptEstimate:35, kptAdjusted:40, complexityScore:10,
    items:[{name:'Chicken Biryani',category:'biryani',quantity:1}] },
  { _id:'5', orderId:'ZMT-4817', status:'dispatched',elapsedMins:22, kptEstimate:20, kptAdjusted:24, complexityScore:6,
    items:[{name:'Paneer Tikka',category:'curry',quantity:1},{name:'Roti',category:'bread',quantity:4}] },
]

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get('restaurantId')

  try {
    const connectDB = (await import('@/lib/mongodb')).default
    const Order = (await import('@/models/Order')).default
    await connectDB()
    const orders = await Order.find({ restaurantId, status: { $in: ['preparing','ready','dispatched'] } })
      .sort({ confirmedAt: -1 }).limit(20).lean()
    return NextResponse.json({ orders: orders.length ? orders : MOCK_ORDERS })
  } catch {
    return NextResponse.json({ orders: MOCK_ORDERS })
  }
}