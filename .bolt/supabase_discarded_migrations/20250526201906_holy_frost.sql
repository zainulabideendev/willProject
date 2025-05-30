/*
  # Add will_reviewed column to profiles table

  1. Changes
    - Add will_reviewed boolean column to profiles table
    - Set default value to false
    - Make column not null

  2. Security
    - No changes to RLS policies needed as this column is covered by existing profile policies
*/

-- Add will_reviewed column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'will_reviewed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN will_reviewed boolean NOT NULL DEFAULT false;
  END IF;
END $$;