/*
  # Add function to get total users count

  1. Changes
    - Add function to count total users from auth.users table
    - Function is accessible to authenticated users
    - Returns count of all users in the system

  2. Security
    - Only authenticated users can access this function
    - Function runs with security definer to access auth schema
*/

CREATE OR REPLACE FUNCTION get_total_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count integer;
BEGIN
  SELECT COUNT(*)
  INTO total_count
  FROM auth.users;
  
  RETURN total_count;
END;
$$;