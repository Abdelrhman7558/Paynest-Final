# Supabase Setup Instructions

## Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select your existing project
3. Go to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 2: Update Environment Variables

Open the `.env` file in the root directory and replace the placeholders:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create Database Table

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire content from `supabase_migration.sql`
5. Click **Run** to execute the migration

This will create:
- `user_masareefy` table with all required columns
- Row Level Security (RLS) policies
- Indexes for better performance
- Triggers for automatic timestamp updates
- Email verification sync from auth.users

## Step 4: Configure Email Settings

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Customize the **Confirm Signup** template if needed
3. Go to **Authentication** → **Settings**
4. Make sure **Enable email confirmations** is turned ON
5. Configure your SMTP settings (or use Supabase's default for testing)

## Step 5: Test the Application

1. Restart your dev server: `npm run dev`
2. Navigate to `/signup`
3. Fill in all the fields and create an account
4. Check your email for the verification link
5. Click the verification link
6. Try to login at `/login`
7. You should be redirected to the dashboard!

## Troubleshooting

### "Missing Supabase environment variables" Error
- Make sure `.env` file exists in the root directory
- Restart the dev server after updating `.env`

### Email Not Received
- Check spam folder
- Verify SMTP settings in Supabase Dashboard
- For testing, you can manually verify users in Supabase Dashboard → Authentication → Users

### "User already exists" Error
- The email is already registered
- Try a different email or delete the user from Supabase Dashboard

### Login Blocked - "Please verify your email"
- Check your email inbox for verification link
- Or manually verify in Supabase Dashboard → Authentication → Users → Click user → Click "Confirm Email"

## Next Steps

After basic authentication is working:
1. Update Header component to show/hide buttons based on auth state
2. Add user profile menu with avatar
3. Implement plan-based dashboard access
4. Add protected routes
