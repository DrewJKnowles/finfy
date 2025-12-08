# Finfy Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned (takes a few minutes)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in your Supabase project settings:
- Go to Project Settings → API
- Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy the "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 4. Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migrations in order:

   **First migration** (`supabase/migrations/001_initial_schema.sql`):
   - Creates `profiles`, `accounts`, `transactions`, and `budgets` tables
   - Sets up Row Level Security (RLS) policies
   - Creates indexes for performance

   **Second migration** (`supabase/migrations/002_statements_storage.sql`):
   - Creates the `bank-statements` storage bucket
   - Creates `statement_imports` table for tracking imports
   - Sets up RLS policies for storage and imports

3. Copy and paste each migration file's contents into the SQL Editor
4. Click "Run" to execute

### 5. Configure Storage Bucket (Optional - for bank statement uploads)

The storage bucket is automatically created by the migration, but you may want to verify:

1. Go to **Storage** in your Supabase dashboard
2. You should see a `bank-statements` bucket
3. The bucket should be **private** (not public)

### 6. Start the Development Server

```bash
npm run dev
```

### 7. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## First-Time Setup

1. **Create an account**: Click "Sign up" and create your account
2. **Verify your email**: Check your email for the verification link (if email confirmation is enabled)
3. **Create an account**: Go to Accounts and add your first bank account
4. **Add transactions**: Start adding transactions manually or import from bank statements

## Features

### Manual Transaction Entry
- Add transactions with date, amount, category, and notes
- Categorize as income or expense
- Link to specific accounts

### Bank Statement Import
- Upload PDF bank statements
- Automatic transaction extraction
- Smart categorization based on merchant names
- Review and approve transactions before importing
- View insights and feedback on extracted transactions

### Budgeting
- Set monthly budgets by category
- Track spending against budgets
- View remaining budget amounts

### Dashboard
- Overview of income, expenses, and net cash flow
- Account balances
- Recent transactions
- Spending by category

## Troubleshooting

### Authentication Issues
- Make sure your `.env.local` file has the correct Supabase credentials
- Check that RLS policies are correctly set up
- Verify your email if email confirmation is required

### Database Errors
- Ensure all migrations have been run
- Check that RLS policies are enabled on all tables
- Verify your service role key is correct

### Storage Upload Issues
- Verify the `bank-statements` bucket exists
- Check that RLS policies are set for storage.objects
- Ensure file size is under 10MB

### PDF Processing Issues
- Make sure the PDF is a valid bank statement
- Check that the statement format is supported (basic formats work, custom formats may need adjustment)
- Review the extracted transactions for accuracy

## Development

### Project Structure

```
finfy/
├── app/
│   ├── actions/          # Server actions for data operations
│   ├── api/              # API routes (e.g., PDF processing)
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard page
│   ├── accounts/         # Accounts management
│   ├── transactions/     # Transactions management
│   ├── budgets/          # Budgets management
│   ├── statements/       # Bank statement import
│   └── layout.tsx        # Root layout
├── components/
│   ├── auth/             # Auth forms
│   ├── layout/           # App layout and navigation
│   ├── dashboard/        # Dashboard components
│   ├── accounts/         # Account components
│   ├── transactions/     # Transaction components
│   ├── budgets/          # Budget components
│   └── statements/       # Statement import components
├── lib/
│   ├── supabase/         # Supabase client helpers
│   ├── validators.ts     # Zod schemas
│   ├── auth.ts           # Auth helpers
│   ├── utils.ts          # Utility functions
│   └── pdf-parser.ts     # PDF parsing and transaction extraction
├── supabase/
│   └── migrations/       # Database migrations
└── middleware.ts          # Route protection middleware
```

### Building for Production

```bash
npm run build
npm start
```

## Security Notes

- **Service Role Key**: Never expose this in client-side code. It bypasses RLS.
- **RLS Policies**: All tables have RLS enabled. Users can only access their own data.
- **File Uploads**: Bank statements are stored securely in Supabase Storage with user-specific folders.
- **Input Validation**: All forms use Zod schemas for validation.

## Support

For issues or questions, please check:
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
- Project README.md for more details
