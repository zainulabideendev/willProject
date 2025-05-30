/*
  # Add executor constraints and fix save_executor function

  1. Changes
    - Add unique constraint on profile_id and executor_order
    - Update save_executor function to handle upserts correctly
    - Add index for efficient ordering

  2. Security
    - No changes to RLS policies needed
*/

-- Add unique constraint for profile_id and executor_order
ALTER TABLE executors 
ADD CONSTRAINT executors_profile_id_executor_order_key 
UNIQUE (profile_id, executor_order);

-- Add index for efficient ordering
CREATE INDEX IF NOT EXISTS executors_profile_id_order_idx 
ON executors (profile_id, executor_order);

-- Drop and recreate save_executor function with proper conflict handling
DROP FUNCTION IF EXISTS save_executor(uuid, integer, jsonb);

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
  -- Insert or update executor
  INSERT INTO executors (
    profile_id,
    title,
    first_names,
    last_name,
    id_number,
    phone,
    email,
    address,
    executor_order,
    is_primary
  ) VALUES (
    profile_uuid,
    executor_data->>'title',
    executor_data->>'first_names',
    executor_data->>'last_name',
    executor_data->>'id_number',
    executor_data->>'phone',
    executor_data->>'email',
    executor_data->>'address',
    executor_index,
    executor_index = 0
  )
  ON CONFLICT (profile_id, executor_order) 
  DO UPDATE SET
    title = EXCLUDED.title,
    first_names = EXCLUDED.first_names,
    last_name = EXCLUDED.last_name,
    id_number = EXCLUDED.id_number,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    is_primary = EXCLUDED.is_primary,
    updated_at = now();

  -- Update profile to show manual executor type
  UPDATE profiles
  SET
    executor_type = 'manual',
    -- Clear any partner firm data
    partner_firm_id = NULL,
    partner_firm_reference = NULL
  WHERE id = profile_uuid;
END;
$$;