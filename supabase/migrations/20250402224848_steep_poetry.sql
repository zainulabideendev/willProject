/*
  # Fix delete_executor function parameters

  1. Changes
    - Update delete_executor function to match frontend parameter names
    - Add proper error handling
    - Add proper transaction handling
    - Add proper cleanup of related data

  2. Security
    - No changes to RLS policies needed
*/

-- Drop existing delete_executor function if it exists
DROP FUNCTION IF EXISTS delete_executor(uuid, uuid);

-- Create function to delete executor with correct parameter names
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