# Events Table Foreign Key Fix - Summary

## Problem

When trying to create an event, you received this error:

```
{
  code: '23503',
  details: 'Key is not present in table "users".',
  hint: null,
  message: 'insert or update on table "events" violates foreign key constraint "events_user_id_fkey"'
}
```

## Root Cause

The `events` table was created with a foreign key constraint referencing `auth.users(id)`:

```sql
CONSTRAINT fk_events_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)  -- ❌ WRONG - This table doesn't exist in your setup
  ON DELETE CASCADE
```

However, your application uses a **custom `users` table** in the public schema (not Supabase Auth), so the foreign key should reference `users(user_id)` instead.

## Solution

### Quick Fix (Run this SQL in Supabase SQL Editor)

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Run the following SQL**:

```sql
-- Drop existing events table
DROP TABLE IF EXISTS events CASCADE;

-- Create events table with correct foreign key
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Correct foreign key referencing custom users table
  CONSTRAINT fk_events_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)  -- ✅ CORRECT
    ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_user_date ON events(user_id, event_date);
```

### Alternative: Use the SQL File

I've created a file `fix_events_table.sql` in your project root. You can:

1. Open Supabase SQL Editor
2. Copy the contents of `fix_events_table.sql`
3. Paste and execute it

## What This Does

1. **Drops the old events table** (with incorrect foreign key)
2. **Creates a new events table** with the correct foreign key referencing `users(user_id)`
3. **Adds performance indexes** for faster queries
4. **Verifies the constraint** is correctly set up

## After Running the Fix

1. **Refresh your application**
2. **Log in** to your account
3. **Navigate to Events page**
4. **Try creating an event** - it should work now!

## Verification

After running the SQL, you can verify the fix worked by running:

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'events'
  AND tc.constraint_type = 'FOREIGN KEY';
```

**Expected Result:**

```
constraint_name | table_name | column_name | foreign_table_name | foreign_column_name
----------------|------------|-------------|--------------------|---------------------
fk_events_user  | events     | user_id     | users              | user_id
```

## Why This Happened

The original database schema you provided referenced `auth.users(id)`:

```sql
user_id uuid references auth.users(id) on delete cascade
```

This is the standard Supabase Auth reference, but your application uses a custom authentication system with a `users` table in the public schema, not Supabase's built-in auth.

## Important Notes

- ⚠️ **This will delete any existing events** in the table (if any)
- ✅ **The application code doesn't need any changes** - it already works correctly
- ✅ **Only the database schema needs to be fixed**
- ✅ **After this fix, event creation will work properly**

## Need Help?

If you encounter any issues:

1. Make sure you're logged in to your application
2. Check the browser console for any errors
3. Verify the user_id is being stored correctly in localStorage
4. Ensure the `users` table exists and has a `user_id` column

The fix is straightforward - just run the SQL script and your events feature will work perfectly!
