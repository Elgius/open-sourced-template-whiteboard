# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project
3. Wait for the project to be ready

## 2. Create Database Table

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase-setup.sql` in this repository

## 3. Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key

## 4. Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace the values with your actual Supabase credentials.

## 5. Test the Integration

1. Start your development server: `pnpm dev`
2. Go to `/whiteboard`
3. Create a drawing and save it
4. Check your Supabase dashboard > Table Editor > drawings to see the saved data

## Database Schema

The `drawings` table has the following structure:

- `id` (UUID, Primary Key, Auto-generated)
- `name` (TEXT, Required)
- `data` (TEXT, Required) - JSON string of drawing elements
- `created_at` (TIMESTAMP, Auto-generated)
- `updated_at` (TIMESTAMP, Auto-generated)

## Security Notes

- The current setup uses a permissive RLS policy for simplicity
- In production, consider implementing user authentication and more restrictive policies
- The anon key is safe to use in client-side code as it only allows operations permitted by RLS policies
