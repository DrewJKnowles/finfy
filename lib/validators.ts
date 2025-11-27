import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['Cash', 'Chequing', 'Savings', 'Credit Card', 'Investment', 'Other']),
  starting_balance: z.number().min(0, 'Starting balance must be non-negative'),
})

export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  account_id: z.string().uuid('Invalid account ID'),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional().nullable(),
})

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  amount: z.number().positive('Amount must be positive'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AccountInput = z.infer<typeof accountSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type BudgetInput = z.infer<typeof budgetSchema>

