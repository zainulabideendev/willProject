/*
  # Add memorial preferences to profiles table

  1. Changes
    - Add memorial_type column to profiles table
    - Add memorial_message column to profiles table
    - Add check constraint to validate memorial type values

  2. Security
    - No changes to RLS policies needed
*/

-- Add memorial columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS memorial_type text,
ADD COLUMN IF NOT EXISTS memorial_message text;

-- Add constraint to validate memorial type values
ALTER TABLE profiles
ADD CONSTRAINT valid_memorial_type
CHECK (
  memorial_type IS NULL OR
  memorial_type IN (
    'religious_service',
    'life_celebration',
    'private_gathering',
    'memorial_event'
  )
);