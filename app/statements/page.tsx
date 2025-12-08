import { getAccounts } from '@/app/actions/accounts'
import { StatementUpload } from '@/components/statements/StatementUpload'
import { Box, Typography, Paper } from '@mui/material'

export default async function StatementsPage() {
  const accounts = await getAccounts()

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Import Bank Statements
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload your bank statement PDFs to automatically extract and categorize transactions.
          Review and approve transactions before they're imported into your account.
        </Typography>
        <StatementUpload accounts={accounts} />
      </Paper>
    </Box>
  )
}

