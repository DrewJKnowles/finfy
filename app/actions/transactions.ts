'use server'

import { createClient } from '@/lib/supabase/server'
import { transactionSchema, type TransactionInput } from '@/lib/validators'
import { revalidatePath } from 'next/cache'

export async function createTransaction(data: TransactionInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const validated = transactionSchema.parse(data)

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      ...validated,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budgets')
  return transaction
}

export async function updateTransaction(id: string, data: Partial<TransactionInput>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const validated = transactionSchema.partial().parse(data)

  const { error } = await supabase
    .from('transactions')
    .update(validated)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budgets')
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/budgets')
}

export async function getTransactions(filters?: {
  account_id?: string
  type?: 'income' | 'expense' | 'transfer'
  start_date?: string
  end_date?: string
  limit?: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('transactions')
    .select(`
      *,
      accounts(name)
    `)
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.account_id) {
    query = query.eq('account_id', filters.account_id)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.start_date) {
    query = query.gte('date', filters.start_date)
  }

  if (filters?.end_date) {
    query = query.lte('date', filters.end_date)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

