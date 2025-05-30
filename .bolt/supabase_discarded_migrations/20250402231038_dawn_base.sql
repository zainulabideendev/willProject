/*
  # Remove executors functionality

  1. Changes
    - Drop all functions related to executors
    - Drop executors table and its dependencies
    - Clean up executor-related columns in profiles table

  2. Security
    - No changes to RLS policies needed
*/

-- First, drop all functions that depend on the executors table
DROP FUNCTION IF EXISTS get_executors(uuid);
DROP FUNCTION IF EXISTS save_executor(uuid, integer, jsonb);
DROP FUNCTION IF EXISTS delete_executor(uuid, uuid);

-- Drop the executors table and all its dependencies
DROP TABLE IF EXISTS executors CASCADE;

-- Clean up executor-related columns in profiles table
UPDATE profiles SET
  executor_type = NULL,
  partner_firm_id = NULL,
  partner_firm_reference = NULL,
  executor_order = NULL,
  is_primary_executor = NULL;