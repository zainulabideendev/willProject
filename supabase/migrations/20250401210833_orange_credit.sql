/*
  # Add burial type to profiles table

  1. Changes
    - Add burial_type column to profiles table
    - Add check constraint to validate burial type values
    - Set default value to null

  2. Security
    - No changes to RLS policies needed
*/

-- Add burial_type column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS burial_type text;

-- Add constraint to validate burial type values
ALTER TABLE profiles
ADD CONSTRAINT valid_burial_type
CHECK (
  burial_type IS NULL OR
  burial_type IN (
    'traditional',
    'cremation', 
    'green_burial',
    'celebration_of_life'
  )
);