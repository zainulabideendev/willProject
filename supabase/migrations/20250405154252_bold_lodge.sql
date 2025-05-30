/*
  # Fix policy creation with existence checks
  
  1. Changes
    - Add existence checks before creating policies
    - Drop existing policies safely
    - Create new policies only if they don't exist
    - Fix super admin role checks
    
  2. Security
    - Maintain existing security model
    - Use auth.users metadata for role checks
*/

DO $$ 
BEGIN
  -- Drop existing policies if they exist
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
  DROP POLICY IF EXISTS "Super admins can do everything" ON profiles;
  DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
  DROP POLICY IF EXISTS "Super admins can read audit logs" ON audit_logs;
  DROP POLICY IF EXISTS "Super admins can manage all children" ON children;
  DROP POLICY IF EXISTS "Users can manage their own children" ON children;
  DROP POLICY IF EXISTS "Super admins can manage all beneficiaries" ON beneficiaries;
  DROP POLICY IF EXISTS "Users can manage their own beneficiaries" ON beneficiaries;
  DROP POLICY IF EXISTS "Super admins can manage all allocations" ON asset_allocations;
  DROP POLICY IF EXISTS "Users can manage their own allocations" ON asset_allocations;
  DROP POLICY IF EXISTS "Super admins can manage all assets" ON assets;
  DROP POLICY IF EXISTS "Users can manage their own assets" ON assets;
  DROP POLICY IF EXISTS "Super admins can manage all residue" ON residue_allocations;
  DROP POLICY IF EXISTS "Users can manage their own residue" ON residue_allocations;
  DROP POLICY IF EXISTS "Super admins can manage all executors" ON executors;
  DROP POLICY IF EXISTS "Users can manage their own executors" ON executors;
  DROP POLICY IF EXISTS "Everyone can read partner firms" ON partner_firms;

  -- Create new policies only if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can do everything' 
    AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Super admins can do everything"
    ON profiles FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'super_admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage own profile' 
    AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can manage own profile"
    ON profiles FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;

  -- Create policies for children table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can manage all children' 
    AND tablename = 'children'
  ) THEN
    CREATE POLICY "Super admins can manage all children"
    ON children FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'super_admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own children' 
    AND tablename = 'children'
  ) THEN
    CREATE POLICY "Users can manage their own children"
    ON children FOR ALL
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());
  END IF;

  -- Create policies for beneficiaries table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can manage all beneficiaries' 
    AND tablename = 'beneficiaries'
  ) THEN
    CREATE POLICY "Super admins can manage all beneficiaries"
    ON beneficiaries FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'super_admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own beneficiaries' 
    AND tablename = 'beneficiaries'
  ) THEN
    CREATE POLICY "Users can manage their own beneficiaries"
    ON beneficiaries FOR ALL
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());
  END IF;

  -- Create policies for asset_allocations table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can manage all allocations' 
    AND tablename = 'asset_allocations'
  ) THEN
    CREATE POLICY "Super admins can manage all allocations"
    ON asset_allocations FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'super_admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own allocations' 
    AND tablename = 'asset_allocations'
  ) THEN
    CREATE POLICY "Users can manage their own allocations"
    ON asset_allocations FOR ALL
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());
  END IF;

  -- Create policies for assets table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can manage all assets' 
    AND tablename = 'assets'
  ) THEN
    CREATE POLICY "Super admins can manage all assets"
    ON assets FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'super_admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own assets' 
    AND tablename = 'assets'
  ) THEN
    CREATE POLICY "Users can manage their own assets"
    ON assets FOR ALL
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());
  END IF;

  -- Create policies for residue_allocations table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can manage all residue' 
    AND tablename = 'residue_allocations'
  ) THEN
    CREATE POLICY "Super admins can manage all residue"
    ON residue_allocations FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'super_admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own residue' 
    AND tablename = 'residue_allocations'
  ) THEN
    CREATE POLICY "Users can manage their own residue"
    ON residue_allocations FOR ALL
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());
  END IF;

  -- Create policies for executors table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can manage all executors' 
    AND tablename = 'executors'
  ) THEN
    CREATE POLICY "Super admins can manage all executors"
    ON executors FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'super_admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own executors' 
    AND tablename = 'executors'
  ) THEN
    CREATE POLICY "Users can manage their own executors"
    ON executors FOR ALL
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());
  END IF;

  -- Create policy for partner_firms table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Everyone can read partner firms' 
    AND tablename = 'partner_firms'
  ) THEN
    CREATE POLICY "Everyone can read partner firms"
    ON partner_firms FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  -- Create policy for audit_logs table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Super admins can read audit logs' 
    AND tablename = 'audit_logs'
  ) THEN
    CREATE POLICY "Super admins can read audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'super_admin');
  END IF;

END $$;