/*
  # Fix get_total_users function

  1. Changes
    - Drop existing function
    - Recreate function with proper permissions and schema access
    - Add proper error handling
    - Add proper security definer settings

  2. Security
    - Function runs with security definer to access auth schema
    - Restricted to authenticated super admins only
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
    RAISE EXCEPTION 'Failed to get total users count: %', SQLERRM;
END;
$$;