/*
  # Add address field to profiles table

  1. Changes
    - Add `address` text column to profiles table
    - This column will store the user's residential address

  2. Security
    - No changes to RLS policies needed as this column is covered by existing profile policies
*/

-- Add address column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;
END $$;