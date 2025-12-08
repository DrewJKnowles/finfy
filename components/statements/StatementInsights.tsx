'use client'

import { Box, Paper, Typography, Grid, Chip, Alert } from '@mui/material'
import { TrendingUp, TrendingDown, Category, CheckCircle } from '@mui/icons-material'
import { formatCurrency } from '@/lib/utils'
import type { ExtractedTransaction } from '@/lib/pdf-parser'

interface StatementInsightsProps {
  transactions: ExtractedTransaction[]
  selectedIndices: Set<number>
}

export function StatementInsights({ transactions, selectedIndices }: StatementInsightsProps) {
  const selectedTransactions = transactions.filter((_, index) => selectedIndices.has(index))
  
  const totalIncome = selectedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = selectedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryBreakdown = selectedTransactions.reduce((acc, t) => {
    const category = t.category || 'Other'
    if (!acc[category]) {
      acc[category] = { count: 0, total: 0 }
    }
    acc[category].count++
    acc[category].total += t.amount
    return acc
  }, {} as Record<string, { count: number; total: number }>)

  const highConfidenceCount = selectedTransactions.filter(t => t.confidence > 0.7).length
  const confidencePercentage = selectedTransactions.length > 0
    ? Math.round((highConfidenceCount / selectedTransactions.length) * 100)
    : 0

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Import Insights
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total Income
              </Typography>
            </Box>
            <Typography variant="h5" color="success.main">
              {formatCurrency(totalIncome)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingDown color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Total Expenses
              </Typography>
            </Box>
            <Typography variant="h5" color="error.main">
              {formatCurrency(totalExpenses)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Confidence
              </Typography>
            </Box>
            <Typography variant="h5">
              {confidencePercentage}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {highConfidenceCount} of {selectedTransactions.length} transactions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Category sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                Top Categories
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {topCategories.map(([category, data]) => (
                <Chip
                  key={category}
                  label={`${category}: ${formatCurrency(data.total)} (${data.count})`}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
        {confidencePercentage < 70 && (
          <Grid item xs={12}>
            <Alert severity="warning">
              Some transactions have low confidence scores. Please review the categories carefully before importing.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

