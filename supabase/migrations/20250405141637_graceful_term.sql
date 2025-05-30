/*
  # Fix get_total_users function permissions

  1. Changes
    - Drop existing function
    - Recreate with proper permissions and error handling
    - Add check for super admin role
    - Add proper schema search path

  2. Security
    - Only super admins can access the function
    - Function runs with elevated privileges
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_total_users();

-- Create new function with proper permissions
CREATE OR REPLACE FUNCTION get_total_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  total_count integer;
BEGIN
  -- Check if caller is a super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  ) THEN
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