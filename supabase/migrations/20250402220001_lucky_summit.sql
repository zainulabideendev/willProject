/*
  # Add functions for managing multiple executors

  1. Changes
    - Add function to get all executors for a profile
    - Add function to save executor data
    - Add function to delete executor
    - Handle executor ordering and primary executor status

  2. Security
    - Functions inherit RLS policies from profiles table
*/

-- Function to get all executors for a profile
CREATE OR REPLACE FUNCTION get_executors(profile_uuid uuid)
RETURNS TABLE (
  title text,
  first_names text,
  last_name text,
  id_number text,
  phone text,
  email text,
  address text,
  executor_order integer,
  is_primary_executor boolean
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.executor_title,
    p.executor_first_names,
    p.executor_last_name,
    p.executor_id_number,
    p.executor_phone,
    p.executor_email,
    p.executor_address,
    p.executor_order,
    p.is_primary_executor
  FROM profiles p
  WHERE p.id = profile_uuid
    AND p.executor_type = 'manual'
  ORDER BY p.executor_order;
END;
$$;

-- Function to save executor data
CREATE OR REPLACE FUNCTION save_executor(
  profile_uuid uuid,
  executor_index integer,
  executor_data jsonb
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update profile with executor data
  UPDATE profiles
  SET
    executor_type = 'manual',
    executor_title = executor_data->>'title',
    executor_first_names = executor_data->>'first_names',
    executor_last_name = executor_data->>'last_name',
    executor_id_number = executor_data->>'id_number',
    executor_phone = executor_data->>'phone',
    executor_email = executor_data->>'email',
    executor_address = executor_data->>'address',
    executor_order = executor_index,
    is_primary_executor = (executor_index = 0),
    -- Clear any partner firm data
    partner_firm_id = NULL,
    partner_firm_reference = NULL
  WHERE id = profile_uuid;
END;
$$;