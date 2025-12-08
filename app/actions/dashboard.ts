'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export async function getDashboardData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  // Get accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, starting_balance')
    .eq('user_id', user.id)
    .eq('archived', false)

  // Get transactions for current month
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .order('date', { ascending: false })

  // Calculate totals
  const totalAccounts = accounts?.reduce((sum, acc) => sum + Number(acc.starting_balance), 0) || 0
  const transactionsTotal = transactions?.reduce((sum, t) => {
    if (t.type === 'income') return sum + Number(t.amount)
    if (t.type === 'expense') return sum - Number(t.amount)
    return sum
  }, 0) || 0

  const income = transactions?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const expenses = transactions?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0

  const netCashFlow = income - expenses
  const totalNetWorth = totalAccounts + transactionsTotal

  // Get recent transactions
  const recentTransactions = transactions?.slice(0, 5) || []

  // Get category spending
  const categorySpending = transactions?.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
    }
    return acc
  }, {} as Record<string, number>) || {}

  return {
    income,
    expenses,
    netCashFlow,
    totalNetWorth,
    recentTransactions,
    categorySpending,
    monthlyData: transactions?.map(t => ({
      date: t.date,
      income: t.type === 'income' ? Number(t.amount) : 0,
      expense: t.type === 'expense' ? Number(t.amount) : 0,
    })) || [],
  }
}


