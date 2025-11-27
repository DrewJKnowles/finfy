import { getDashboardData } from '@/app/actions/dashboard'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { DashboardChart } from '@/components/dashboard/DashboardChart'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This Month's Income
            </Typography>
            <Typography variant="h4" color="success.main">
              {formatCurrency(data.income)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This Month's Expenses
            </Typography>
            <Typography variant="h4" color="error.main">
              {formatCurrency(data.expenses)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Net Cash Flow
            </Typography>
            <Typography
              variant="h4"
              color={data.netCashFlow >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(data.netCashFlow)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Net Worth
            </Typography>
            <Typography variant="h4" color="primary.main">
              {formatCurrency(data.totalNetWorth)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Income vs Expenses
            </Typography>
            <DashboardChart data={data.monthlyData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Categories
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(data.categorySpending)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{category}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(amount)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              {Object.keys(data.categorySpending).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No expenses this month
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Transactions
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No transactions yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.recentTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{(transaction.accounts as any)?.name || 'N/A'}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

