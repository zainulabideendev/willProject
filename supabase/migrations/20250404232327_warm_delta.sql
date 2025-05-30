/*
  # Add executor handling type to profiles table

  1. Changes
    - Add executor_handling_type column to profiles table
    - Add check constraint to validate handling type values
    - This column will store how multiple executors should handle the estate

  2. Security
    - No changes to RLS policies needed
*/

-- Add executor_handling_type column to profiles table
ALTER TABLE profiles 
ADD COLUMN executor_handling_type text;

-- Add constraint to validate handling type values
ALTER TABLE profiles
ADD CONSTRAINT valid_executor_handling_type
CHECK (
  executor_handling_type IS NULL OR
  executor_handling_type IN ('jointly', 'independently')
);