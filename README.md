# Finfy - Personal Finance Tracker

A secure, privacy-focused personal finance web application built with Next.js, TypeScript, Material UI, and Supabase.

## Features

- 🔐 **Secure Authentication** - Email/password authentication with Supabase Auth
- 💰 **Account Management** - Track multiple accounts (Cash, Chequing, Savings, Credit Card, etc.)
- 📊 **Transaction Tracking** - Record income, expenses, and transfers with categories
- 📈 **Budget Management** - Set monthly budgets by category with progress tracking
- 📉 **Dashboard** - View income vs expenses, net worth, and spending insights
- 🔒 **Privacy First** - Row Level Security ensures your data is completely isolated

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Material UI (MUI)
- **Database & Auth**: Supabase (PostgreSQL + Auth + RLS)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd finfy
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API to get your keys
   - Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. **Configure environment variables**

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. **Run database migrations**

   - In your Supabase dashboard, go to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run it in the SQL Editor

   This will create:
   - `profiles` table
   - `accounts` table
   - `transactions` table
   - `budgets` table
   - Row Level Security (RLS) policies
   - Indexes for performance
   - Trigger to auto-create profiles on signup

6. **Start the development server**

```bash
npm run dev
```

7. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Profiles
- `id` (UUID, references auth.users)
- `created_at`
- `display_name`

### Accounts
- `id` (UUID)
- `user_id` (UUID, references auth.users)
- `name` (text)
- `type` (Cash, Chequing, Savings, Credit Card, Investment, Other)
- `starting_balance` (numeric)
- `archived` (boolean)

### Transactions
- `id` (UUID)
- `user_id` (UUID, references auth.users)
- `account_id` (UUID, references accounts)
- `date` (date)
- `type` (income, expense, transfer)
- `amount` (numeric)
- `category` (text)
- `notes` (text, nullable)

### Budgets
- `id` (UUID)
- `user_id` (UUID, references auth.users)
- `category` (text)
- `month` (date, first day of month)
- `amount` (numeric)

## Security Features

- **Row Level Security (RLS)**: All tables have RLS enabled. Users can only access their own data.
- **Server-side Operations**: All database operations happen server-side via Next.js Server Actions.
- **Input Validation**: All forms use Zod schemas for validation.
- **Rate Limiting**: Basic rate limiting on authentication routes.
- **Environment Variables**: Sensitive keys are never exposed to the client.

## Project Structure

```
finfy/
├── app/
│   ├── actions/          # Server actions for data operations
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard page
│   ├── accounts/         # Accounts management
│   ├── transactions/     # Transactions management
│   ├── budgets/          # Budgets management
│   └── layout.tsx        # Root layout
├── components/
│   ├── auth/             # Auth forms
│   ├── layout/           # App layout and navigation
│   ├── dashboard/        # Dashboard components
│   ├── accounts/         # Account components
│   ├── transactions/     # Transaction components
│   └── budgets/          # Budget components
├── lib/
│   ├── supabase/         # Supabase client helpers
│   ├── validators.ts     # Zod schemas
│   ├── auth.ts           # Auth helpers
│   └── utils.ts          # Utility functions
├── supabase/
│   └── migrations/       # Database migrations
└── middleware.ts          # Route protection middleware
```

## Development

### Running in Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

1. **Deploy to Vercel** (recommended for Next.js):
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

2. **Or deploy to any Node.js hosting**:
   - Build the project: `npm run build`
   - Start the server: `npm start`
   - Ensure environment variables are set

## Important Notes

- **No Bank Connections**: This MVP does not include bank API integrations. All data is manually entered.
- **Service Role Key**: The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side and never exposed to the client.
- **RLS Policies**: All tables have RLS enabled. Make sure your policies are correctly set up in Supabase.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

