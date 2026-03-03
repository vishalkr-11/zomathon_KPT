'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'rest_koramangala_001'

const MOCK_ORDERS = [
  { _id:'1', orderId:'ZMT-4821', status:'preparing', elapsedMins:14, kptEstimate:22, kptAdjusted:26, complexityScore:7,
    items:[{name:'Butter Chicken',category:'curry',quantity:1},{name:'Naan',category:'bread',quantity:2}] },
  { _id:'2', orderId:'ZMT-4820', status:'ready',     elapsedMins:28, kptEstimate:28, kptAdjusted:33, complexityScore:9,
    items:[{name:'Veg Biryani',category:'biryani',quantity:1}] },
  { _id:'3', orderId:'ZMT-4819', status:'preparing', elapsedMins:5,  kptEstimate:15, kptAdjusted:18, complexityScore:5,
    items:[{name:'Masala Dosa',category:'dosa',quantity:3},{name:'Filter Coffee',category:'beverage',quantity:2}] },
  { _id:'4', orderId:'ZMT-4818', status:'preparing', elapsedMins:10, kptEstimate:35, kptAdjusted:40, complexityScore:10,
    items:[{name:'Chicken Biryani',category:'biryani',quantity:1}] },
  { _id:'5', orderId:'ZMT-4817', status:'dispatched', elapsedMins:22, kptEstimate:20, kptAdjusted:24, complexityScore:6,
    items:[{name:'Paneer Tikka',category:'curry',quantity:1},{name:'Roti',category:'bread',quantity:4}] },
]

export function useOrders() {
  const [orders,  setOrders]  = useState(MOCK_ORDERS)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // Track which orders the merchant has manually marked ready
  // so polling never reverts them back
  const markedReadyRef = useRef(new Set())

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?restaurantId=${RESTAURANT_ID}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.orders?.length > 0) {
        // Apply any local overrides before setting state
        const merged = data.orders.map(o =>
          markedReadyRef.current.has(o.orderId)
            ? { ...o, status: 'ready' }
            : o
        )
        setOrders(merged)
      }
    } catch {
      // Keep current state — don't reset to mock on poll failure
    } finally {
      setLoading(false)
    }
  }, [])

  // Tick elapsed time every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prev => prev.map(o =>
        o.status === 'preparing'
          ? { ...o, elapsedMins: (o.elapsedMins || 0) + 0.5 }
          : o
      ))
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Poll every 15s
  useEffect(() => {
    fetchOrders()
    const poll = setInterval(fetchOrders, 15000)
    return () => clearInterval(poll)
  }, [fetchOrders])

  const markReady = useCallback(async (orderId) => {
    // 1. Record it so polling never reverts this order
    markedReadyRef.current.add(orderId)

    // 2. Optimistic update immediately
    setOrders(prev => prev.map(o =>
      o.orderId === orderId ? { ...o, status: 'ready' } : o
    ))

    // 3. Fire API (silent fail — doesn't matter if DB is down)
    try {
      await fetch(`/api/orders/${orderId}/mark-ready`, { method: 'POST' })
    } catch { /* silent */ }
  }, [])

  return { orders, loading, error, markReady, refetch: fetchOrders }
}