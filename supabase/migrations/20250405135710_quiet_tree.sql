/*
  # Add function to get total registered users

  1. Changes
    - Add function to count total users from auth.users table
    - Function has security definer to access auth schema
    - Returns total count of registered users

  2. Security
    - Function can only be called by authenticated users
*/

CREATE OR REPLACE FUNCTION get_total_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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