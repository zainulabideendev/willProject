/*
  # Fix admin dashboard metrics functions

  1. Changes
    - Update get_total_children function to properly bypass RLS
    - Update get_total_beneficiaries function to properly bypass RLS
    - Update get_total_married_users function to properly bypass RLS
    - Update get_total_single_users function to properly bypass RLS
    - Fix permission checks to use JWT role instead of profiles table
    - Add proper error handling and schema search path

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
BEGIN
  -- Check if caller is a super admin
  IF (auth.jwt() ->> 'role')::text != 'super_admin' THEN
    RAISE EXCEPTION 'Permission denied';
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
BEGIN
  -- Check if caller is a super admin
  IF (auth.jwt() ->> 'role')::text != 'super_admin' THEN
    RAISE EXCEPTION 'Permission denied';
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
BEGIN
  -- Check if caller is a super admin
  IF (auth.jwt() ->> 'role')::text != 'super_admin' THEN
    RAISE EXCEPTION 'Permission denied';
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
BEGIN
  -- Check if caller is a super admin
  IF (auth.jwt() ->> 'role')::text != 'super_admin' THEN
    RAISE EXCEPTION 'Permission denied';
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