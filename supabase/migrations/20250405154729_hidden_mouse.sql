/*
  # Fix get_total_users function

  1. Changes
    - Update function to handle permissions correctly
    - Fix return type handling
    - Add proper error handling
    - Add proper schema search path

  2. Security
    - Only super admins can access the function
    - Function runs with elevated privileges
*/

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
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Get total count from auth.users
  SELECT COUNT(*)
  INTO total_count
  FROM auth.users;
  
  RETURN total_count;
EXCEPTION
  WHEN others THEN
    -- Log error and re-raise
    RAISE NOTICE 'Error in get_total_users: %', SQLERRM;
    RAISE;
END;
$$;