'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { signupSchema, type SignupInput } from '@/lib/validators'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    setError(null)
    setLoading(true)

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error('Signup error:', error)
        throw error
      }

      if (authData.session) {
        // Wait a moment for cookies to be set and session to be established
        await new Promise(resolve => setTimeout(resolve, 200))
        // Force a hard navigation to ensure middleware runs
        window.location.href = '/dashboard'
      } else if (authData.user) {
        // User created but needs email confirmation
        setError('Please check your email to confirm your account')
        setLoading(false)
      } else {
        throw new Error('Failed to create account. Please try again.')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to sign up')
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
        helperText={errors.password?.message || 'Minimum 8 characters'}
        autoComplete="new-password"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign up'}
      </Button>
    </Box>
  )
}

