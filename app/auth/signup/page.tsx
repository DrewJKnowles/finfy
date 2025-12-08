import { SignupForm } from '@/components/auth/SignupForm'
import { Box, Container, Typography, Link as MuiLink, Paper } from '@mui/material'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
            Sign up for Finfy
          </Typography>
          <SignupForm />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} href="/auth/login">
                Log in
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}


