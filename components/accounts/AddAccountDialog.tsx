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
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { accountSchema, type AccountInput } from '@/lib/validators'
import { createAccount } from '@/app/actions/accounts'
import { useRouter } from 'next/navigation'

export function AddAccountDialog() {
  const [open, setOpen] = useState(false)
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
      starting_balance: 0,
    },
  })

  const onSubmit = async (data: AccountInput) => {
    setError(null)
    setLoading(true)

    try {
      await createAccount(data)
      reset()
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
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
        Add Account
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Add Account</DialogTitle>
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
              defaultValue=""
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

