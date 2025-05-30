/*
  # Add super admin access to all tables

  1. Changes
    - Drop existing RLS policies
    - Create new policies that allow super admin access to all tables
    - Maintain existing user-level access for regular users
    - Add proper error handling and security checks

  2. Security
    - Super admins can access all data in all tables
    - Regular users maintain their existing access levels
    - Policies use proper security checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their children" ON children;
DROP POLICY IF EXISTS "Users can manage their beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Users can manage their asset allocations" ON asset_allocations;
DROP POLICY IF EXISTS "Users can manage their executors" ON executors;
DROP POLICY IF EXISTS "Users can manage their assets" ON assets;
DROP POLICY IF EXISTS "Users can manage their residue allocations" ON residue_allocations;
DROP POLICY IF EXISTS "Users can read partner firms" ON partner_firms;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can read audit logs" ON audit_logs;

-- Create new policies for children table
CREATE POLICY "Users can manage their children"
ON children
FOR ALL
TO authenticated
USING (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Create new policies for beneficiaries table
CREATE POLICY "Users can manage their beneficiaries"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Create new policies for asset_allocations table
CREATE POLICY "Users can manage their asset allocations"
ON asset_allocations
FOR ALL
TO authenticated
USING (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Create new policies for executors table
CREATE POLICY "Users can manage their executors"
ON executors
FOR ALL
TO authenticated
USING (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Create new policies for assets table
CREATE POLICY "Users can manage their assets"
ON assets
FOR ALL
TO authenticated
USING (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Create new policies for residue_allocations table
CREATE POLICY "Users can manage their residue allocations"
ON residue_allocations
FOR ALL
TO authenticated
USING (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  profile_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Create new policies for partner_firms table
CREATE POLICY "Users can read partner firms"
ON partner_firms
FOR SELECT
TO authenticated
USING (true);

-- Create new policies for profiles table
CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Users can read profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Users can delete profiles"
ON profiles
FOR DELETE
TO authenticated
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Create new policy for audit_logs table
CREATE POLICY "Super admins can read audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);