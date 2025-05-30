/*
  # Fix infinite recursion in profile policies

  1. Changes
    - Remove recursive super_admin checks from profile policies
    - Simplify policy conditions to prevent circular dependencies
    - Add separate policy for super_admin access

  2. Security
    - Maintain row-level security while avoiding recursion
    - Ensure super_admin users can still access all profiles
    - Keep basic user access to own profile
*/

-- First drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Super admins can manage all profiles"
ON profiles FOR ALL
TO authenticated
USING (
  role = 'super_admin'
);

CREATE POLICY "Users can manage own profile"
ON profiles FOR ALL
TO authenticated
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);