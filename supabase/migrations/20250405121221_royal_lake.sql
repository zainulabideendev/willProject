/*
  # Fix profiles RLS policy

  1. Changes
    - Remove recursive RLS policies on profiles table
    - Add simplified policies for CRUD operations
    - Ensure super_admin role check doesn't cause recursion

  2. Security
    - Enable RLS on profiles table
    - Add policies for:
      - Users can read their own profile or if they are super_admin
      - Users can update their own profile or if they are super_admin
      - Users can delete their own profile or if they are super_admin
      - Users can insert their own profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
  )
);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
  )
)
WITH CHECK (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
  )
);

CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
  )
);

CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);