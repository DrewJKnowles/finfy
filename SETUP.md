# Setup Guide - Fixing Authentication Issues

## Step 1: Create Environment Variables File

Create a `.env.local` file in the root of your project with your Supabase credentials:

```bash
# In the project root directory
touch .env.local
```

Then add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 2: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Project Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Check **Enable email confirmations** - you can disable this for testing

## Step 4: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it in the SQL Editor
4. Verify tables were created in **Table Editor**

## Step 5: Restart Development Server

After creating `.env.local`, you MUST restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 6: Check Browser Console

Open your browser's developer console (F12) and look for:
- ✅ `Environment Check:` logs showing your credentials are loaded
- ✅ `Supabase client initialized successfully`
- Any error messages that might indicate the issue

## Troubleshooting

### "Invalid login credentials" error

1. **Check if user exists**: Go to Supabase dashboard → **Authentication** → **Users**
2. **Create a test user** if needed
3. **Verify password** is correct
4. **Check email confirmation**: If enabled, user must confirm email first

### "Missing Supabase environment variables" error

1. Verify `.env.local` exists in project root
2. Verify variable names are correct (case-sensitive)
3. Restart dev server after creating/editing `.env.local`
4. Check that variables start with `NEXT_PUBLIC_` for client-side access

### No logs in console

1. Make sure browser console is open (F12)
2. Check console filter isn't hiding logs
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check if JavaScript errors are blocking execution

### Still not working?

1. Check Supabase project is active (not paused)
2. Verify network tab in browser DevTools for API calls
3. Check Supabase dashboard → **Logs** for server-side errors
4. Try creating a new user via signup form first

