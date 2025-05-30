/*
  # Recreate executors table and functions

  1. New Tables
    - `executors`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `first_names` (text)
      - `last_name` (text)
      - `id_number` (text)
      - `phone` (text)
      - `email` (text)
      - `address` (text)
      - `executor_order` (integer)
      - `is_primary` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - get_executors: Retrieve all executors for a profile
    - save_executor: Save or update executor details
    - delete_executor: Remove an executor

  3. Security
    - Enable RLS on executors table
    - Add policy for authenticated users
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

-- Create unique constraint for executor order
CREATE UNIQUE INDEX executors_profile_id_executor_order_key
ON executors (profile_id, executor_order);

-- Create index for efficient ordering
CREATE INDEX executors_profile_id_order_idx
ON executors (profile_id, executor_order);

-- Create updated_at trigger
CREATE TRIGGER update_executors_updated_at
  BEFORE UPDATE ON executors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get all executors for a profile
CREATE OR REPLACE FUNCTION get_executors(profile_uuid uuid)
RETURNS TABLE (
  id uuid,
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
    e.id,
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

-- Create function to save executor data
CREATE OR REPLACE FUNCTION save_executor(
  profile_uuid uuid,
  executor_index integer,
  executor_data jsonb
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  executor_id uuid;
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
    updated_at = now()
  RETURNING id INTO executor_id;

  -- Update profile to show manual executor type
  UPDATE profiles
  SET
    executor_type = 'manual',
    -- Clear any partner firm data
    partner_firm_id = NULL,
    partner_firm_reference = NULL
  WHERE id = profile_uuid;

  RETURN executor_id;
END;
$$;

-- Create function to delete executor
CREATE OR REPLACE FUNCTION delete_executor(
  profile_uuid uuid,
  executor_id uuid
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  executor_count integer;
  executor_exists boolean;
BEGIN
  -- Check if executor exists and belongs to profile
  SELECT EXISTS (
    SELECT 1 
    FROM executors 
    WHERE id = executor_id 
    AND profile_id = profile_uuid
  ) INTO executor_exists;

  IF NOT executor_exists THEN
    RAISE EXCEPTION 'Executor not found or does not belong to profile';
  END IF;

  -- Start transaction
  BEGIN
    -- Delete the executor
    DELETE FROM executors
    WHERE id = executor_id
    AND profile_id = profile_uuid;

    -- Get remaining executor count
    SELECT COUNT(*) INTO executor_count
    FROM executors
    WHERE profile_id = profile_uuid;

    -- If no executors left, update profile
    IF executor_count = 0 THEN
      UPDATE profiles
      SET
        executor_type = NULL,
        partner_firm_id = NULL,
        partner_firm_reference = NULL
      WHERE id = profile_uuid;
    END IF;

    -- Commit transaction
    COMMIT;
  EXCEPTION
    WHEN others THEN
      -- Rollback transaction on error
      ROLLBACK;
      RAISE;
  END;
END;
$$;