import { getAccounts } from '@/app/actions/accounts'
import { AccountsTable } from '@/components/accounts/AccountsTable'
import { Box, Typography, Button } from '@mui/material'
import { AddAccountDialog } from '@/components/accounts/AddAccountDialog'

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Accounts</Typography>
        <AddAccountDialog />
      </Box>
      <AccountsTable accounts={accounts} />
    </Box>
  )
}

