/*
  # Add super admin functionality

  1. Changes
    - Add role column to profiles table
    - Add check constraint for valid roles
    - Add index for role lookups
    - Drop existing policies and create new ones for super admin access

  2. Security
    - Only super admins can access other profiles
    - Regular users can only access their own profile
*/

-- First drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Add constraint to validate role values
ALTER TABLE profiles
ADD CONSTRAINT valid_role
CHECK (role IN ('user', 'super_admin'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create new policies that handle super admin role
CREATE POLICY "Users can create their own profile" 
ON profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view profiles" 
ON profiles 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id OR -- Users can view their own profile
  EXISTS ( -- Super admins can view all profiles
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Users can update profiles" 
ON profiles 
FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = id OR -- Users can update their own profile
  EXISTS ( -- Super admins can update all profiles
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
)
WITH CHECK (
  auth.uid() = id OR -- Users can update their own profile
  EXISTS ( -- Super admins can update all profiles
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Users can delete profiles" 
ON profiles 
FOR DELETE 
TO authenticated 
USING (
  auth.uid() = id OR -- Users can delete their own profile
  EXISTS ( -- Super admins can delete any profile
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);