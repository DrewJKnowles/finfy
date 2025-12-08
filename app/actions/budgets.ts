'use server'

import { createClient } from '@/lib/supabase/server'
import { budgetSchema, type BudgetInput } from '@/lib/validators'
import { revalidatePath } from 'next/cache'

export async function createBudget(data: BudgetInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const validated = budgetSchema.parse(data)

  const { data: budget, error } = await supabase
    .from('budgets')
    .insert({
      user_id: user.id,
      ...validated,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
  return budget
}

export async function updateBudget(id: string, data: Partial<BudgetInput>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const validated = budgetSchema.partial().parse(data)

  const { error } = await supabase
    .from('budgets')
    .update(validated)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
}

export async function deleteBudget(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
}

export async function getBudgets(month?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })

  if (month) {
    query = query.eq('month', month)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}


