import { Box, Button, Container, Typography, Stack, Paper } from '@mui/material'
import Link from 'next/link'
import { CheckCircle } from '@mui/icons-material'

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={8}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Finfy
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Simple, secure budgeting & net worth tracking
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6 }}>
            <Button
              component={Link}
              href="/auth/signup"
              variant="contained"
              size="large"
              sx={{ px: 4 }}
            >
              Sign up
            </Button>
            <Button
              component={Link}
              href="/auth/login"
              variant="outlined"
              size="large"
              sx={{ px: 4 }}
            >
              Log in
            </Button>
          </Stack>

          <Stack spacing={3} sx={{ mt: 4, textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CheckCircle color="primary" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Track income & expenses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Easily record and categorize all your financial transactions
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CheckCircle color="primary" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Simple monthly budgets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set budgets by category and track your spending progress
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CheckCircle color="primary" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Private by design
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your data is yours. We use end-to-end encryption and never share your information
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

