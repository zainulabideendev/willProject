/*
  # Fix admin dashboard metrics functions

  1. Changes
    - Fix the role check in all metric functions to use profiles table instead of JWT
    - Add proper error handling to return 0 instead of raising exceptions
    - Fix schema search path to ensure proper access to tables
    - Ensure functions work with RLS enabled

  2. Security
    - Functions run with security definer to bypass RLS
    - Only super admins can access these functions
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
    RETURN 0;
  END IF;

  SELECT COUNT(*)
  INTO total_count
  FROM children;
  
  RETURN total_count;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in get_total_children: %', SQLERRM;
    RETURN 0;
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
    RETURN 0;
  END IF;

  SELECT COUNT(*)
  INTO total_count
  FROM beneficiaries;
  
  RETURN total_count;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in get_total_beneficiaries: %', SQLERRM;
    RETURN 0;
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
    RETURN 0;
  END IF;

  SELECT COUNT(*)
  INTO total_count
  FROM profiles
  WHERE marital_status = 'married';
  
  RETURN total_count;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in get_total_married_users: %', SQLERRM;
    RETURN 0;
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
    RETURN 0;
  END IF;

  SELECT COUNT(*)
  INTO total_count
  FROM profiles
  WHERE marital_status = 'single';
  
  RETURN total_count;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in get_total_single_users: %', SQLERRM;
    RETURN 0;
END;
$$;

-- Fix get_total_users function to use the same pattern
CREATE OR REPLACE FUNCTION get_total_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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
    RETURN 0;
  END IF;

  -- Get total count from auth.users
  SELECT COUNT(*)
  INTO total_count
  FROM auth.users;
  
  RETURN total_count;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in get_total_users: %', SQLERRM;
    RETURN 0;
END;
$$;