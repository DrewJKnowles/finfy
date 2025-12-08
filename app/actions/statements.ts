'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { type ExtractedTransaction } from '@/lib/pdf-parser'
import { createTransaction } from './transactions'

export interface StatementUploadResult {
  success: boolean
  importId?: string
  extractedCount?: number
  error?: string
}

export async function uploadStatement(
  file: File,
  accountId: string
): Promise<StatementUploadResult> {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Validate file
    if (file.type !== 'application/pdf') {
      return { success: false, error: 'Only PDF files are supported' }
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 10MB' }
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('bank-statements')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: `Failed to upload file: ${uploadError.message}` }
    }

    // Create import record (extracted_count will be updated after processing)
    const { data: importRecord, error: importError } = await supabase
      .from('statement_imports')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        status: 'processing',
        extracted_count: 0,
      })
      .select()
      .single()

    if (importError) {
      return { success: false, error: `Failed to create import record: ${importError.message}` }
    }

    return {
      success: true,
      importId: importRecord.id,
      extractedCount: 0, // Will be updated after processing
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to process statement',
    }
  }
}

export async function getStatementImport(importId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('statement_imports')
    .select('*')
    .eq('id', importId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function processStatementText(text: string): Promise<ExtractedTransaction[]> {
  return parseTransactionsFromText(text)
}

export async function importTransactions(
  importId: string,
  transactions: Array<{
    date: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    accountId: string
  }>
) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Verify import belongs to user
  const { data: importRecord } = await supabase
    .from('statement_imports')
    .select('*')
    .eq('id', importId)
    .eq('user_id', user.id)
    .single()

  if (!importRecord) {
    throw new Error('Import record not found')
  }

  // Import transactions
  let importedCount = 0
  const errors: string[] = []

  for (const transaction of transactions) {
    try {
      await createTransaction({
        date: transaction.date,
        account_id: transaction.accountId,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        notes: `Imported from statement: ${transaction.description}`,
      })
      importedCount++
    } catch (error: any) {
      errors.push(`Failed to import transaction: ${error.message}`)
    }
  }

  // Update import record
  await supabase
    .from('statement_imports')
    .update({
      status: importedCount > 0 ? 'completed' : 'failed',
      imported_count: importedCount,
      processed_at: new Date().toISOString(),
      error_message: errors.length > 0 ? errors.join('; ') : null,
    })
    .eq('id', importId)

  return {
    importedCount,
    errors: errors.length > 0 ? errors : undefined,
  }
}

