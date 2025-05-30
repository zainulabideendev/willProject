/*
  # Add function to get total users count

  1. Changes
    - Add function to count total users from profiles table
    - Function is accessible to super admins only
    - Returns count of all users in the system

  2. Security
    - Only super admins can access this function
    - Function runs with security definer to access all profiles
*/

CREATE OR REPLACE FUNCTION get_total_users()
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

  -- Get total count from profiles
  SELECT COUNT(*)
  INTO total_count
  FROM profiles;
  
  RETURN total_count;
END;
$$;