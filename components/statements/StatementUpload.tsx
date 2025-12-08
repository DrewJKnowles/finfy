'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
} from '@mui/material'
import { CloudUpload, CheckCircle, Error as ErrorIcon } from '@mui/icons-material'
import { uploadStatement, importTransactions } from '@/app/actions/statements'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import type { ExtractedTransaction } from '@/lib/pdf-parser'
import { StatementInsights } from './StatementInsights'

interface Account {
  id: string
  name: string
  type: string
}

export function StatementUpload({ accounts }: { accounts: Account[] }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set())
  const [importId, setImportId] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    if (!selectedAccount) {
      setError('Please select an account first')
      return
    }

    const file = acceptedFiles[0]
    setUploading(true)
    setError(null)

    try {
      // First process the file to extract transactions via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('accountId', selectedAccount)

      const processResponse = await fetch('/api/statements/process', {
        method: 'POST',
        body: formData,
      })

      if (!processResponse.ok) {
        const errorData = await processResponse.json()
        throw new Error(errorData.error || 'Failed to process statement')
      }

      const { transactions } = await processResponse.json()

      if (!transactions || transactions.length === 0) {
        setError('No transactions found in the statement')
        return
      }

      // Upload file to storage and create import record
      const result = await uploadStatement(file, selectedAccount)
      
      if (!result.success) {
        setError(result.error || 'Failed to upload statement')
        return
      }

      setExtractedTransactions(transactions)
      setSelectedTransactions(new Set(transactions.map((_, i) => i)))
      setImportId(result.importId || null)
      setReviewOpen(true)
    } catch (err: any) {
      setError(err.message || 'Failed to process statement')
    } finally {
      setUploading(false)
    }
  }, [selectedAccount])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading || !selectedAccount,
  })

  const handleImport = async () => {
    if (!importId || !selectedAccount) return

    setImporting(true)
    setError(null)

    try {
      const transactionsToImport = Array.from(selectedTransactions).map(index => ({
        ...extractedTransactions[index],
        accountId: selectedAccount,
      }))

      const result = await importTransactions(importId, transactionsToImport)

      if (result.errors) {
        setError(`Some transactions failed to import: ${result.errors.join(', ')}`)
      } else {
        setReviewOpen(false)
        setExtractedTransactions([])
        setSelectedTransactions(new Set())
        setImportId(null)
        // Refresh the page to show new transactions
        window.location.href = '/transactions'
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import transactions')
    } finally {
      setImporting(false)
    }
  }

  const toggleTransaction = (index: number) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTransactions(newSelected)
  }

  const selectAll = () => {
    setSelectedTransactions(new Set(extractedTransactions.map((_, i) => i)))
  }

  const deselectAll = () => {
    setSelectedTransactions(new Set())
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Select Account"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.name} ({account.type})
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: uploading || !selectedAccount ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          opacity: uploading || !selectedAccount ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Box>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Processing statement...</Typography>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the PDF here' : 'Drag & drop a bank statement PDF'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Supported format: PDF (max 10MB)
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog
        open={reviewOpen}
        onClose={() => !importing && setReviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Review Extracted Transactions ({extractedTransactions.length} found)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button size="small" onClick={selectAll}>
              Select All
            </Button>
            <Button size="small" onClick={deselectAll}>
              Deselect All
            </Button>
            <Typography variant="body2" sx={{ ml: 'auto', alignSelf: 'center' }}>
              {selectedTransactions.size} selected
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Import</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extractedTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTransactions.has(index)}
                        onChange={() => toggleTransaction(index)}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.category || 'Other'}
                        size="small"
                        color={transaction.confidence > 0.7 ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        size="small"
                        color={transaction.type === 'income' ? 'success' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogContent dividers>
          <StatementInsights
            transactions={extractedTransactions}
            selectedIndices={selectedTransactions}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={importing || selectedTransactions.size === 0}
            startIcon={importing ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {importing ? 'Importing...' : `Import ${selectedTransactions.size} Transactions`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

