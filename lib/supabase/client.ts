'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }
  
  // Provide cookie handlers to use cookies instead of localStorage
  // This is required for middleware to read the session
  // Check if we're in the browser before accessing document
  return createBrowserClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        if (typeof document === 'undefined') {
          return []
        }
        return document.cookie.split('; ').map(cookie => {
          const [name, ...rest] = cookie.split('=')
          return { name, value: rest.join('=') }
        })
      },
      setAll(cookiesToSet) {
        if (typeof document === 'undefined') {
          return
        }
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = `${name}=${value}; path=${options?.path || '/'}; ${options?.maxAge ? `max-age=${options.maxAge};` : ''} ${options?.sameSite ? `samesite=${options.sameSite};` : 'samesite=lax;'} ${options?.secure ? 'secure;' : ''}`
        })
      },
    },
  })
}
