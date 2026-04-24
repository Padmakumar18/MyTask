-- Fix Events Table Foreign Key Constraint
-- This script fixes the foreign key reference from auth.users to the custom users table

-- Step 1: Drop existing events table if it exists
DROP TABLE IF EXISTS events CASCADE;

-- Step 2: Create events table with correct foreign key reference
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

-- Step 3: Create indexes for better performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_user_date ON events(user_id, event_date);

-- Step 4: Enable Row Level Security (Optional - uncomment if needed)
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are commented out because they require Supabase Auth
-- If you're using custom authentication, you may need to adjust these policies
-- or handle security at the application level

-- CREATE POLICY "Users can view their own events"
--   ON events
--   FOR SELECT
--   USING (user_id = (SELECT user_id FROM users WHERE email = auth.jwt()->>'email'));

-- CREATE POLICY "Users can insert their own events"
--   ON events
--   FOR INSERT
--   WITH CHECK (user_id = (SELECT user_id FROM users WHERE email = auth.jwt()->>'email'));

-- CREATE POLICY "Users can update their own events"
--   ON events
--   FOR UPDATE
--   USING (user_id = (SELECT user_id FROM users WHERE email = auth.jwt()->>'email'));

-- CREATE POLICY "Users can delete their own events"
--   ON events
--   FOR DELETE
--   USING (user_id = (SELECT user_id FROM users WHERE email = auth.jwt()->>'email'));

-- Verification query
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
