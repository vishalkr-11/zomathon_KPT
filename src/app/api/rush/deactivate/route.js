import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    success: true,
    deactivatedAt: new Date(),
    message: 'Rush mode deactivated — KPT buffer removed from new orders',
  })
}