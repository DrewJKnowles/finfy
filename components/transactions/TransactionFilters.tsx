'use client'

import { useState, useEffect } from 'react'
import { Box, TextField, MenuItem, Paper } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAccounts } from '@/app/actions/accounts'

export function TransactionFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error)
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/transactions?${params.toString()}`)
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Account"
          size="small"
          sx={{ minWidth: 150 }}
          value={searchParams.get('account_id') || ''}
          onChange={(e) => handleFilterChange('account_id', e.target.value)}
        >
          <MenuItem value="">All Accounts</MenuItem>
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Type"
          size="small"
          sx={{ minWidth: 150 }}
          value={searchParams.get('type') || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
          <MenuItem value="transfer">Transfer</MenuItem>
        </TextField>
        <TextField
          label="Start Date"
          type="date"
          size="small"
          sx={{ minWidth: 150 }}
          InputLabelProps={{ shrink: true }}
          value={searchParams.get('start_date') || ''}
          onChange={(e) => handleFilterChange('start_date', e.target.value)}
        />
        <TextField
          label="End Date"
          type="date"
          size="small"
          sx={{ minWidth: 150 }}
          InputLabelProps={{ shrink: true }}
          value={searchParams.get('end_date') || ''}
          onChange={(e) => handleFilterChange('end_date', e.target.value)}
        />
      </Box>
    </Paper>
  )
}

