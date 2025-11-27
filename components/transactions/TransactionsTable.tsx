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
  Typography,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { formatCurrency } from '@/lib/utils'
import { deleteTransaction } from '@/app/actions/transactions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { EditTransactionDialog } from './EditTransactionDialog'
import { format } from 'date-fns'

interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  category: string
  notes: string | null
  accounts?: { name: string } | null
}

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id)
        router.refresh()
      } catch (error) {
        alert('Failed to delete transaction')
      }
    }
  }

  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          No transactions found. Add your first transaction to get started.
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
              <TableCell>Date</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{transaction.accounts?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      textTransform: 'capitalize',
                      color:
                        transaction.type === 'income'
                          ? 'success.main'
                          : transaction.type === 'expense'
                          ? 'error.main'
                          : 'text.secondary',
                    }}
                  >
                    {transaction.type}
                  </Typography>
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={
                      transaction.type === 'income'
                        ? 'success.main'
                        : transaction.type === 'expense'
                        ? 'error.main'
                        : 'text.secondary'
                    }
                  >
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </TableCell>
                <TableCell>{transaction.notes || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(transaction.id)}
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
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  )
}

