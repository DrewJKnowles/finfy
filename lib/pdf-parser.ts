import pdfParse from 'pdf-parse'

export interface ExtractedTransaction {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category?: string
  confidence: number
}

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Parse transactions from bank statement text
 * This is a basic parser - you may need to customize based on your bank's format
 */
export function parseTransactionsFromText(text: string): ExtractedTransaction[] {
  const transactions: ExtractedTransaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  // Common patterns for bank statements
  // Date patterns: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
  // Amount patterns: $123.45, -$123.45, 123.45, -123.45
  const amountPattern = /[\$]?([-]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/

  let currentDate: string | null = null
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    
    // Try to find a date
    const dateMatch = line.match(datePattern)
    if (dateMatch) {
      const dateStr = dateMatch[1]
      // Try to parse and normalize the date
      try {
        const parsedDate = parseDate(dateStr)
        if (parsedDate) {
          currentDate = parsedDate
        }
      } catch (e) {
        // Invalid date, continue
      }
    }

    // Look for amount patterns
    const amountMatches = line.match(amountPattern)
    if (amountMatches && currentDate) {
      const amountStr = amountMatches[1].replace(/,/g, '')
      const amount = parseFloat(amountStr)
      
      if (!isNaN(amount) && amount !== 0) {
        // Extract description (everything before the amount, or previous lines)
        let description = line
          .replace(amountPattern, '')
          .replace(datePattern, '')
          .trim()
        
        // If description is too short, try to get more context
        if (description.length < 5 && i > 0) {
          description = lines[i - 1] + ' ' + description
        }

        if (description.length > 0) {
          const type: 'income' | 'expense' = amount > 0 ? 'income' : 'expense'
          const absAmount = Math.abs(amount)
          
          // Auto-categorize based on description
          const category = categorizeTransaction(description)
          
          transactions.push({
            date: currentDate,
            description: description.substring(0, 200), // Limit description length
            amount: absAmount,
            type,
            category,
            confidence: 0.7, // Basic confidence score
          })
        }
      }
    }

    i++
  }

  return transactions
}

/**
 * Parse various date formats to YYYY-MM-DD
 */
function parseDate(dateStr: string): string | null {
  try {
    // Try different formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{2})/, // MM/DD/YY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/,   // MM-DD-YYYY
    ]

    for (const format of formats) {
      const match = dateStr.match(format)
      if (match) {
        let month: string, day: string, year: string

        if (format.source.includes('\\d{4}') && format.source.startsWith('(\\d{4})')) {
          // YYYY-MM-DD format
          year = match[1]
          month = match[2].padStart(2, '0')
          day = match[3].padStart(2, '0')
        } else {
          // MM/DD/YYYY or MM-DD-YYYY format
          month = match[1].padStart(2, '0')
          day = match[2].padStart(2, '0')
          year = match[3]
          if (year.length === 2) {
            // Convert YY to YYYY (assuming 20XX)
            year = '20' + year
          }
        }

        const date = new Date(`${year}-${month}-${day}`)
        if (!isNaN(date.getTime())) {
          return `${year}-${month}-${day}`
        }
      }
    }
  } catch (e) {
    // Invalid date
  }

  return null
}

/**
 * Auto-categorize transaction based on description
 */
function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase()

  // Common category patterns
  const categories: Record<string, string[]> = {
    'Groceries': ['grocery', 'supermarket', 'walmart', 'target', 'kroger', 'safeway', 'whole foods', 'trader joe'],
    'Restaurants': ['restaurant', 'cafe', 'starbucks', 'mcdonald', 'subway', 'pizza', 'dining', 'food', 'eat'],
    'Gas': ['gas', 'fuel', 'shell', 'exxon', 'bp', 'chevron', 'mobil', 'petrol'],
    'Rent': ['rent', 'lease', 'apartment', 'housing'],
    'Utilities': ['electric', 'water', 'gas bill', 'utility', 'power', 'internet', 'cable', 'phone bill'],
    'Transportation': ['uber', 'lyft', 'taxi', 'metro', 'transit', 'bus', 'train'],
    'Shopping': ['amazon', 'store', 'shop', 'retail', 'purchase'],
    'Entertainment': ['movie', 'netflix', 'spotify', 'entertainment', 'theater', 'concert'],
    'Healthcare': ['pharmacy', 'drug', 'cvs', 'walgreens', 'medical', 'doctor', 'hospital', 'health'],
    'Salary': ['salary', 'payroll', 'paycheck', 'income', 'deposit'],
    'Transfer': ['transfer', 'payment', 'ach', 'wire'],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category
    }
  }

  // Default category
  return 'Other'
}

