'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { formatCurrency } from '@/lib/utils'
import { deleteAccount } from '@/app/actions/accounts'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { EditAccountDialog } from './EditAccountDialog'

interface Account {
  id: string
  name: string
  type: string
  starting_balance: number
  created_at: string
}

export function AccountsTable({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id)
        router.refresh()
      } catch (error) {
        alert('Failed to delete account')
      }
    }
  }

  if (accounts.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          No accounts yet. Add your first account to get started.
        </Typography>
      </Paper>
    )
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Starting Balance</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell align="right">
                  {formatCurrency(account.starting_balance)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => setEditingAccount(account)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(account.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          open={!!editingAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </>
  )
}


