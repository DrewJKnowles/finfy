import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const result = rateLimit(`auth:${ip}`)

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  return null
}


