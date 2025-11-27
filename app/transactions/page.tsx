import { getTransactions } from '@/app/actions/transactions'
import { TransactionsTable } from '@/components/transactions/TransactionsTable'
import { Box, Typography } from '@mui/material'
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { account_id?: string; type?: string; start_date?: string; end_date?: string }
}) {
  const transactions = await getTransactions({
    account_id: searchParams.account_id,
    type: searchParams.type as any,
    start_date: searchParams.start_date,
    end_date: searchParams.end_date,
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Transactions</Typography>
        <AddTransactionDialog />
      </Box>
      <TransactionFilters />
      <TransactionsTable transactions={transactions} />
    </Box>
  )
}

