/*
  # Add spouse address column to profiles table

  1. Changes
    - Adds a `spouse_address` column to the `profiles` table if it doesn't already exist
*/

-- Add spouse_address column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'spouse_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN spouse_address text;
  END IF;
END $$;