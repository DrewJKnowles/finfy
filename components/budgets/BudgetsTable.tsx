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
  LinearProgress,
  Box,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { formatCurrency } from '@/lib/utils'
import { deleteBudget } from '@/app/actions/budgets'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { EditBudgetDialog } from './EditBudgetDialog'
import { getTransactions } from '@/app/actions/transactions'
import { startOfMonth, endOfMonth, format } from 'date-fns'

interface Budget {
  id: string
  category: string
  month: string
  amount: number
}

export function BudgetsTable({ budgets }: { budgets: Budget[] }) {
  const router = useRouter()
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [spending, setSpending] = useState<Record<string, number>>({})

  useEffect(() => {
    if (budgets.length > 0) {
      const month = budgets[0].month
      const monthStart = format(startOfMonth(new Date(month)), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(new Date(month)), 'yyyy-MM-dd')

      getTransactions({
        type: 'expense',
        start_date: monthStart,
        end_date: monthEnd,
      })
        .then((transactions) => {
          const spendingMap = transactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
            return acc
          }, {} as Record<string, number>)
          setSpending(spendingMap)
        })
        .catch(console.error)
    }
  }, [budgets])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id)
        router.refresh()
      } catch (error) {
        alert('Failed to delete budget')
      }
    }
  }

  if (budgets.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          No budgets set for this month. Add a budget to start tracking your spending.
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
              <TableCell>Category</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Spent</TableCell>
              <TableCell>Remaining</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.map((budget) => {
              const spent = spending[budget.category] || 0
              const remaining = budget.amount - spent
              const progress = Math.min((spent / budget.amount) * 100, 100)

              return (
                <TableRow key={budget.id}>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell>{formatCurrency(budget.amount)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={spent > budget.amount ? 'error.main' : 'text.primary'}
                    >
                      {formatCurrency(spent)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={remaining < 0 ? 'error.main' : 'success.main'}
                      fontWeight="bold"
                    >
                      {formatCurrency(remaining)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={progress > 100 ? 'error' : progress > 80 ? 'warning' : 'primary'}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 45 }}>
                        {progress.toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => setEditingBudget(budget)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(budget.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {editingBudget && (
        <EditBudgetDialog
          budget={editingBudget}
          open={!!editingBudget}
          onClose={() => setEditingBudget(null)}
        />
      )}
    </>
  )
}


