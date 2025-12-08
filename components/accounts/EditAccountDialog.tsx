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
import { accountSchema, type AccountInput } from '@/lib/validators'
import { updateAccount } from '@/app/actions/accounts'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  name: string
  type: string
  starting_balance: number
}

export function EditAccountDialog({
  account,
  open,
  onClose,
}: {
  account: Account
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
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account.name,
      type: account.type as any,
      starting_balance: account.starting_balance,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: account.name,
        type: account.type as any,
        starting_balance: account.starting_balance,
      })
    }
  }, [open, account, reset])

  const onSubmit = async (data: AccountInput) => {
    setError(null)
    setLoading(true)

    try {
      await updateAccount(account.id, data)
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Edit Account</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            {...register('name')}
            label="Account Name"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register('type')}
            select
            label="Account Type"
            fullWidth
            margin="normal"
            error={!!errors.type}
            helperText={errors.type?.message}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Chequing">Chequing</MenuItem>
            <MenuItem value="Savings">Savings</MenuItem>
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="Investment">Investment</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            {...register('starting_balance', { valueAsNumber: true })}
            label="Starting Balance"
            type="number"
            fullWidth
            margin="normal"
            error={!!errors.starting_balance}
            helperText={errors.starting_balance?.message}
            inputProps={{ step: '0.01', min: '0' }}
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


