import { NextResponse } from 'next/server'

export async function POST(request) {
  const {
    rushLevel = 50,
    rushActive = false,
    activeOrderCount = 0,
    overdueOrderCount = 0,
    kptBuffer = 0,
  } = await request.json()

  const advice = getAdvice({ rushActive, rushLevel, activeOrderCount, overdueOrderCount, kptBuffer })
  return NextResponse.json({ suggestion: advice })
}

function getAdvice({ rushActive, rushLevel, activeOrderCount, overdueOrderCount, kptBuffer }) {
  // Overdue orders — highest priority
  if (overdueOrderCount >= 3) {
    return `🚨 ${overdueOrderCount} orders are overdue — focus kitchen on completing these first before accepting new complexity. Consider activating rush mode if not already on to buffer incoming riders.`
  }
  if (overdueOrderCount === 2) {
    return `⚠️ 2 orders overdue. Assign your fastest chef to clear the backlog. If dine-in is also busy, activate rush mode now to buy extra time on incoming Zomato orders.`
  }
  if (overdueOrderCount === 1) {
    return `One order is running late — expedite it immediately. Communicate with the rider if they're already waiting to set expectations.`
  }

  // Rush is active
  if (rushActive && rushLevel >= 75) {
    return `Rush mode active at HIGH intensity (+${kptBuffer}m buffer). Good call — riders are being dispatched later so food is ready on arrival. Monitor the ${activeOrderCount} active orders closely.`
  }
  if (rushActive && rushLevel >= 45) {
    return `Rush mode active at MEDIUM intensity (+${kptBuffer}m buffer). Kitchen load is manageable — if it gets busier, increase the rush level for a larger buffer.`
  }

  // Rush not active but load is high
  if (!rushActive && activeOrderCount >= 5) {
    return `${activeOrderCount} orders preparing simultaneously — kitchen load is high. Tap 🔥 Mark Rush to activate a KPT buffer so riders aren't dispatched before food is ready.`
  }
  if (!rushActive && activeOrderCount >= 3) {
    return `${activeOrderCount} orders in preparation. Things look manageable — if dine-in picks up or a large offline order comes in, activate rush mode proactively before delays start.`
  }

  // Low load
  if (activeOrderCount === 0) {
    return `No active orders right now. Good time to prep ingredients and mise en place so the kitchen is ready for the next rush window.`
  }

  return `Kitchen looks stable with ${activeOrderCount} active order${activeOrderCount !== 1 ? 's' : ''}. Stay proactive — mark rush before delays happen, not after riders start waiting.`
}