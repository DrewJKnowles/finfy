'use server'

import { createClient } from '@/lib/supabase/server'
import { accountSchema, type AccountInput } from '@/lib/validators'
import { revalidatePath } from 'next/cache'

export async function createAccount(data: AccountInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const validated = accountSchema.parse(data)

  const { data: account, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      ...validated,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return account
}

export async function updateAccount(id: string, data: Partial<AccountInput>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const validated = data.name || data.type || data.starting_balance !== undefined
    ? accountSchema.partial().parse(data)
    : data

  const { error } = await supabase
    .from('accounts')
    .update(validated)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('accounts')
    .update({ archived: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/accounts')
  revalidatePath('/dashboard')
}

export async function getAccounts() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

