import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Log cookies for debugging
  if (process.env.NODE_ENV === 'development') {
    const allCookies = request.cookies.getAll()
    const authCookies = allCookies.filter(c => 
      c.name.includes('sb-') || c.name.includes('supabase')
    )
    console.log('🍪 Middleware cookies:', {
      total: allCookies.length,
      authCookies: authCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    })
  }

  // Refresh session if expired - required for Server Components
  // This also ensures cookies are properly read
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware check:', {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    })
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/accounts') ||
    request.nextUrl.pathname.startsWith('/transactions') ||
    request.nextUrl.pathname.startsWith('/budgets')

  // Redirect authenticated users away from auth pages
  if (isAuthPage && user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ User authenticated, redirecting from auth page to dashboard')
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ No user found, redirecting to login')
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

