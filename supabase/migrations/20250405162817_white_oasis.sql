/*
  # Add admin metrics functions

  1. Changes
    - Add functions to get various user statistics
    - Add proper security checks for super admin access
    - Add proper error handling

  2. Security
    - Only super admins can access these functions
    - Functions run with security definer to access all data
*/

-- Function to get total number of children
CREATE OR REPLACE FUNCTION get_total_children()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count integer;
  is_admin boolean;
BEGIN
  -- Check if caller is a super admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT COUNT(*)
  INTO total_count
  FROM children;
  
  RETURN total_count;
END;
$$;

-- Function to get total number of beneficiaries
CREATE OR REPLACE FUNCTION get_total_beneficiaries()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count integer;
  is_admin boolean;
BEGIN
  -- Check if caller is a super admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT COUNT(*)
  INTO total_count
  FROM beneficiaries;
  
  RETURN total_count;
END;
$$;

-- Function to get total number of married users
CREATE OR REPLACE FUNCTION get_total_married_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count integer;
  is_admin boolean;
BEGIN
  -- Check if caller is a super admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT COUNT(*)
  INTO total_count
  FROM profiles
  WHERE marital_status = 'married';
  
  RETURN total_count;
END;
$$;

-- Function to get total number of single users
CREATE OR REPLACE FUNCTION get_total_single_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count integer;
  is_admin boolean;
BEGIN
  -- Check if caller is a super admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT COUNT(*)
  INTO total_count
  FROM profiles
  WHERE marital_status = 'single';
  
  RETURN total_count;
END;
$$;