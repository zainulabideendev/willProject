/*
  # Remove executor functionality completely

  1. Changes
    - Drop all executor-related functions
    - Drop executors table and its dependencies
    - Remove executor-related columns from profiles table
    - Clean up any remaining executor data

  2. Security
    - No changes to RLS policies needed
*/

-- First, drop all functions that depend on the executors table
DROP FUNCTION IF EXISTS get_executors(uuid);
DROP FUNCTION IF EXISTS save_executor(uuid, integer, jsonb);
DROP FUNCTION IF EXISTS delete_executor(uuid, uuid);

-- Drop the executors table and all its dependencies
DROP TABLE IF EXISTS executors CASCADE;

-- Remove executor-related columns from profiles table
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS executor_type,
  DROP COLUMN IF EXISTS executor_title,
  DROP COLUMN IF EXISTS executor_first_names,
  DROP COLUMN IF EXISTS executor_last_name,
  DROP COLUMN IF EXISTS executor_id_number,
  DROP COLUMN IF EXISTS executor_phone,
  DROP COLUMN IF EXISTS executor_email,
  DROP COLUMN IF EXISTS executor_address,
  DROP COLUMN IF EXISTS partner_firm_id,
  DROP COLUMN IF EXISTS partner_firm_reference,
  DROP COLUMN IF EXISTS executor_order,
  DROP COLUMN IF EXISTS is_primary_executor;