export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          display_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          display_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          display_name?: string | null
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'Cash' | 'Chequing' | 'Savings' | 'Credit Card' | 'Investment' | 'Other'
          starting_balance: number
          created_at: string
          archived: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'Cash' | 'Chequing' | 'Savings' | 'Credit Card' | 'Investment' | 'Other'
          starting_balance?: number
          created_at?: string
          archived?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'Cash' | 'Chequing' | 'Savings' | 'Credit Card' | 'Investment' | 'Other'
          starting_balance?: number
          created_at?: string
          archived?: boolean
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          date: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          category: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          date: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          category: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          date?: string
          type?: 'income' | 'expense' | 'transfer'
          amount?: number
          category?: string
          notes?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          month: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          month: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          month?: string
          amount?: number
          created_at?: string
        }
      }
    }
  }
}

