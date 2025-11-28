'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { loginSchema, type LoginInput } from '@/lib/validators'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  
  // Check environment variables and initialize Supabase client on mount
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    console.log('🔍 Environment Check:')
    console.log('  - Supabase URL configured:', !!url, url ? `${url.substring(0, 30)}...` : 'MISSING')
    console.log('  - Supabase Key configured:', !!key, key ? `${key.substring(0, 30)}...` : 'MISSING')
    
    if (!url || !key) {
      console.error('❌ Missing Supabase environment variables!')
      setError('Configuration error: Missing Supabase credentials. Please check your .env.local file.')
      return
    }
    
    try {
      const client = createClient()
      setSupabase(client)
      console.log('✅ Supabase client initialized successfully')
    } catch (err: any) {
      console.error('❌ Failed to create Supabase client:', err)
      setError(err.message || 'Failed to initialize authentication. Please check your configuration.')
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    if (!supabase) {
      setError('Authentication client not initialized')
      return
    }

    setError(null)
    setLoading(true)

    console.log('🔐 Attempting login for:', data.email)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      console.log('📦 Auth response:', { 
        hasSession: !!authData.session, 
        hasUser: !!authData.user,
        error: error?.message 
      })

      if (error) {
        console.error('❌ Login error:', error)
        console.error('   Error code:', error.status)
        console.error('   Error message:', error.message)
        throw error
      }

      if (authData.session) {
        console.log('✅ Login successful! Session created.')
        console.log('   User ID:', authData.user?.id)
        console.log('   Session token:', authData.session.access_token ? 'Present' : 'Missing')
        
        // Verify session is stored
        const { data: { session: verifySession } } = await supabase.auth.getSession()
        console.log('🔍 Session verification:', verifySession ? 'Session found' : 'No session')
        
        if (!verifySession) {
          console.error('❌ Session not stored properly')
          throw new Error('Session not stored. Please try again.')
        }
        
        // Check cookies are set
        const cookies = document.cookie
        console.log('🍪 Cookies:', cookies ? 'Present' : 'Missing')
        const hasAuthCookie = cookies.includes('sb-') || cookies.includes('supabase')
        console.log('🍪 Auth cookie found:', hasAuthCookie)
        
        // Wait a moment for cookies to be fully set by Supabase
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Verify cookies are actually set before redirecting
        const cookiesAfterWait = document.cookie
        console.log('🍪 Cookies after wait:', cookiesAfterWait)
        const authCookies = cookiesAfterWait.split(';').filter(c => 
          c.trim().startsWith('sb-') || c.trim().includes('supabase')
        )
        console.log('🍪 Auth cookies found:', authCookies.length, authCookies)
        
        // Use window.location.href for a full page reload to ensure cookies are sent
        // This is necessary because middleware needs to read cookies from the request
        console.log('🔄 Redirecting to dashboard with full page reload...')
        window.location.href = '/dashboard'
      } else {
        console.error('❌ No session created')
        throw new Error('No session created. Please try again.')
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err)
      setError(err.message || 'Failed to log in')
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        {...register('email')}
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        autoComplete="email"
      />
      <TextField
        {...register('password')}
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
        autoComplete="current-password"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading || !supabase}
      >
        {loading ? <CircularProgress size={24} /> : 'Log in'}
      </Button>
      {!supabase && !error && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Initializing authentication...
        </Alert>
      )}
    </Box>
  )
}

