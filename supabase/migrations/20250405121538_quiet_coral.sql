/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing RLS policies on profiles table
    - Create new comprehensive RLS policies for profiles table
    - Add proper foreign key constraint to users table
    
  2. Security
    - Enable RLS on profiles table
    - Add policies for:
      - SELECT: Users can read their own profile
      - INSERT: Users can create their own profile
      - UPDATE: Users can update their own profile
      - DELETE: Users can delete their own profile
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Ensure proper foreign key constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;