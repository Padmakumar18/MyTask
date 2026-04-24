# Database Schema Fix for Events Table

## Issue

The `events` table has a foreign key constraint referencing `auth.users(id)`, but the application uses a custom `users` table in the public schema, not Supabase Auth.

## Error Message

```
{
  code: '23503',
  details: 'Key is not present in table "users".',
  hint: null,
  message: 'insert or update on table "events" violates foreign key constraint "events_user_id_fkey"'
}
```

## Root Cause

The foreign key constraint is looking for the user_id in `auth.users` table, but the application stores users in a custom `users` table in the public schema.

## Solution

### Step 1: Drop the existing events table (if it exists)

```sql
DROP TABLE IF EXISTS events CASCADE;
```

### Step 2: Create the events table with correct foreign key reference

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key referencing the custom users table (not auth.users)
  CONSTRAINT fk_events_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
```

### Step 3: Create indexes for better query performance

```sql
-- Index on user_id for faster user-specific queries
CREATE INDEX idx_events_user_id ON events(user_id);

-- Index on event_date for faster date-based queries
CREATE INDEX idx_events_date ON events(event_date);

-- Composite index for user + date queries
CREATE INDEX idx_events_user_date ON events(user_id, event_date);
```

### Step 4: Enable Row Level Security (RLS)

```sql
-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own events
CREATE POLICY "Users can view their own events"
  ON events
  FOR SELECT
  USING (user_id = (SELECT user_id FROM users WHERE email = auth.jwt()->>'email'));

-- Policy: Users can insert their own events
CREATE POLICY "Users can insert their own events"
  ON events
  FOR INSERT
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE email = auth.jwt()->>'email'));

-- Policy: Users can update their own events
CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  USING (user_id = (SELECT user_id FROM users WHERE email = auth.jwt()->>'email'));

-- Policy: Users can delete their own events
CREATE POLICY "Users can delete their own events"
  ON events
  FOR DELETE
  USING (user_id = (SELECT user_id FROM users WHERE email = auth.jwt()->>'email'));
```

## Alternative: If you want to use Supabase Auth

If you prefer to use Supabase's built-in authentication instead of the custom users table, you would need to:

1. **Migrate to Supabase Auth**:

```sql
-- Create events table referencing auth.users
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key referencing Supabase auth.users
  CONSTRAINT fk_events_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Simpler RLS policies with Supabase Auth
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events"
  ON events
  FOR ALL
  USING (auth.uid() = user_id);
```

2. **Update the application** to use Supabase Auth instead of custom authentication.

## Recommended Approach

**Use the first solution** (custom users table) since your application is already built around it. This requires only updating the database schema, not the application code.

## Verification

After applying the fix, verify the foreign key constraint:

```sql
-- Check foreign key constraints on events table
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

Expected result:

```
constraint_name    | table_name | column_name | foreign_table_name | foreign_column_name
-------------------|------------|-------------|--------------------|---------------------
fk_events_user     | events     | user_id     | users              | user_id
```

## Testing

After applying the fix, test by:

1. Log in to the application
2. Navigate to Events page
3. Try to create a new event
4. Verify the event is created successfully
5. Check that the event appears in the calendar

The foreign key constraint error should be resolved.
