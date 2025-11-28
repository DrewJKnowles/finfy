export function checkSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  if (!url.startsWith('http')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }

  return { url, anonKey }
}

