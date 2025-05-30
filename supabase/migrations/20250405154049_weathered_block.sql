/*
  # Fix RLS policies for super admin access

  1. Changes
    - Drop existing policies
    - Create new simplified policies that give super admins full access
    - Ensure regular users can only access their own data
    - Fix recursive policy issues

  2. Security
    - Super admins get full access to all tables
    - Regular users remain restricted to their own data
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can manage their children" ON children;
DROP POLICY IF EXISTS "Users can manage their beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Users can manage their asset allocations" ON asset_allocations;
DROP POLICY IF EXISTS "Users can manage their executors" ON executors;
DROP POLICY IF EXISTS "Users can manage their assets" ON assets;
DROP POLICY IF EXISTS "Users can manage their residue allocations" ON residue_allocations;
DROP POLICY IF EXISTS "Users can read partner firms" ON partner_firms;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can read audit logs" ON audit_logs;

-- Create new simplified policies for profiles
CREATE POLICY "Super admins can do everything"
ON profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role')::text = 'super_admin'
  )
);

CREATE POLICY "Users can manage own profile"
ON profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policies for children table
CREATE POLICY "Super admins can manage all children"
ON children FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role')::text = 'super_admin'
  )
);

CREATE POLICY "Users can manage their own children"
ON children FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Create policies for beneficiaries table
CREATE POLICY "Super admins can manage all beneficiaries"
ON beneficiaries FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role')::text = 'super_admin'
  )
);

CREATE POLICY "Users can manage their own beneficiaries"
ON beneficiaries FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Create policies for asset_allocations table
CREATE POLICY "Super admins can manage all allocations"
ON asset_allocations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role')::text = 'super_admin'
  )
);

CREATE POLICY "Users can manage their own allocations"
ON asset_allocations FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Create policies for assets table
CREATE POLICY "Super admins can manage all assets"
ON assets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role')::text = 'super_admin'
  )
);

CREATE POLICY "Users can manage their own assets"
ON assets FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Create policies for residue_allocations table
CREATE POLICY "Super admins can manage all residue"
ON residue_allocations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role')::text = 'super_admin'
  )
);

CREATE POLICY "Users can manage their own residue"
ON residue_allocations FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Create policies for executors table
CREATE POLICY "Super admins can manage all executors"
ON executors FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role')::text = 'super_admin'
  )
);

CREATE POLICY "Users can manage their own executors"
ON executors FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Create policy for partner_firms table
CREATE POLICY "Everyone can read partner firms"
ON partner_firms FOR SELECT
TO authenticated
USING (true);

-- Create policy for audit_logs table
CREATE POLICY "Super admins can read audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role')::text = 'super_admin'
  )
);