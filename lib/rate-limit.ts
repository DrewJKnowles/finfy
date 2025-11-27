// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 100 // Max requests per window

export function rateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const key = identifier

  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    }
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (store[key].count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  store[key].count++
  return { allowed: true, remaining: MAX_REQUESTS - store[key].count }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  }
}, WINDOW_MS)

