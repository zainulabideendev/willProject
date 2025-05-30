/*
  # Add support for multiple executors

  1. Changes
    - Create executors table to store multiple executors
    - Add migration function to move existing executor data
    - Update get_executors function to use new table
    - Update save_executor function to use new table

  2. Security
    - Enable RLS on executors table
    - Add policies for authenticated users
*/

-- Create executors table
CREATE TABLE IF NOT EXISTS executors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  first_names text NOT NULL,
  last_name text NOT NULL,
  id_number text,
  phone text,
  email text,
  address text,
  executor_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE executors ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage their executors"
  ON executors
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create unique constraint for primary executor
CREATE UNIQUE INDEX idx_primary_executor_per_profile 
ON executors (profile_id) 
WHERE is_primary = true;

-- Create updated_at trigger
CREATE TRIGGER update_executors_updated_at
  BEFORE UPDATE ON executors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing executor data
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT 
      id,
      executor_title,
      executor_first_names,
      executor_last_name,
      executor_id_number,
      executor_phone,
      executor_email,
      executor_address,
      executor_order,
      is_primary_executor
    FROM profiles 
    WHERE executor_type = 'manual'
      AND executor_first_names IS NOT NULL
  LOOP
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
      profile_record.id,
      profile_record.executor_title,
      profile_record.executor_first_names,
      profile_record.executor_last_name,
      profile_record.executor_id_number,
      profile_record.executor_phone,
      profile_record.executor_email,
      profile_record.executor_address,
      profile_record.executor_order,
      profile_record.is_primary_executor
    );
  END LOOP;
END $$;

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_executors(uuid);
DROP FUNCTION IF EXISTS save_executor(uuid, integer, jsonb);

-- Create new get_executors function
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
  is_primary boolean
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.title,
    e.first_names,
    e.last_name,
    e.id_number,
    e.phone,
    e.email,
    e.address,
    e.executor_order,
    e.is_primary
  FROM executors e
  WHERE e.profile_id = profile_uuid
  ORDER BY e.executor_order;
END;
$$;

-- Create new save_executor function
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