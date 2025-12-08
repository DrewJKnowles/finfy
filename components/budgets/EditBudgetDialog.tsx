'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material'
import { budgetSchema, type BudgetInput } from '@/lib/validators'
import { updateBudget } from '@/app/actions/budgets'
import { useRouter } from 'next/navigation'

interface Budget {
  id: string
  category: string
  month: string
  amount: number
}

export function EditBudgetDialog({
  budget,
  open,
  onClose,
}: {
  budget: Budget
  open: boolean
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: budget.category,
      month: budget.month,
      amount: budget.amount,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        category: budget.category,
        month: budget.month,
        amount: budget.amount,
      })
    }
  }, [open, budget, reset])

  const onSubmit = async (data: BudgetInput) => {
    setError(null)
    setLoading(true)

    try {
      await updateBudget(budget.id, data)
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update budget')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Edit Budget</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            {...register('category')}
            label="Category"
            fullWidth
            margin="normal"
            error={!!errors.category}
            helperText={errors.category?.message}
          />
          <TextField
            {...register('month')}
            label="Month"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            error={!!errors.month}
            helperText={errors.month?.message || 'Select the first day of the month'}
          />
          <TextField
            {...register('amount', { valueAsNumber: true })}
            label="Budget Amount"
            type="number"
            fullWidth
            margin="normal"
            error={!!errors.amount}
            helperText={errors.amount?.message}
            inputProps={{ step: '0.01', min: '0.01' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}


