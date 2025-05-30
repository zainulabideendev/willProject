/*
  # Add address to will template

  1. Changes
    - Ensure address column exists in profiles table
    - This migration is a safety check to ensure the address column exists
    - The address will be used in the will template for legal documentation

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