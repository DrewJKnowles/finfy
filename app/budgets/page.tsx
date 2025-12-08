import { getBudgets } from '@/app/actions/budgets'
import { BudgetsTable } from '@/components/budgets/BudgetsTable'
import { Box, Typography } from '@mui/material'
import { AddBudgetDialog } from '@/components/budgets/AddBudgetDialog'
import { startOfMonth, format } from 'date-fns'

export default async function BudgetsPage() {
  const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const budgets = await getBudgets(currentMonth)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Budgets</Typography>
        <AddBudgetDialog />
      </Box>
      <BudgetsTable budgets={budgets} />
    </Box>
  )
}


