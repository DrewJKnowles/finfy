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
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { transactionSchema, type TransactionInput } from '@/lib/validators'
import { createTransaction } from '@/app/actions/transactions'
import { useRouter } from 'next/navigation'
import { getAccounts } from '@/app/actions/accounts'

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (open) {
      getAccounts().then(setAccounts).catch(console.error)
    }
  }, [open])

  const onSubmit = async (data: TransactionInput) => {
    setError(null)
    setLoading(true)

    try {
      await createTransaction(data)
      reset()
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction')
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
        Add Transaction
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              {...register('date')}
              label="Date"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
            <TextField
              {...register('account_id')}
              select
              label="Account"
              fullWidth
              margin="normal"
              error={!!errors.account_id}
              helperText={errors.account_id?.message}
              defaultValue=""
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...register('type')}
              select
              label="Type"
              fullWidth
              margin="normal"
              error={!!errors.type}
              helperText={errors.type?.message}
              defaultValue=""
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
            </TextField>
            <TextField
              {...register('amount', { valueAsNumber: true })}
              label="Amount"
              type="number"
              fullWidth
              margin="normal"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              inputProps={{ step: '0.01', min: '0.01' }}
            />
            <TextField
              {...register('category')}
              label="Category"
              fullWidth
              margin="normal"
              error={!!errors.category}
              helperText={errors.category?.message}
            />
            <TextField
              {...register('notes')}
              label="Notes (optional)"
              fullWidth
              margin="normal"
              multiline
              rows={2}
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

