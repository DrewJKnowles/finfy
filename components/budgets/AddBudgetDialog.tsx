'use client'

import { useState } from 'react'
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
import { Add as AddIcon } from '@mui/icons-material'
import { budgetSchema, type BudgetInput } from '@/lib/validators'
import { createBudget } from '@/app/actions/budgets'
import { useRouter } from 'next/navigation'
import { startOfMonth, format } from 'date-fns'

export function AddBudgetDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: currentMonth,
    },
  })

  const onSubmit = async (data: BudgetInput) => {
    setError(null)
    setLoading(true)

    try {
      await createBudget(data)
      reset()
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create budget')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
      >
        Add Budget
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Add Budget</DialogTitle>
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
            <Button onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}


