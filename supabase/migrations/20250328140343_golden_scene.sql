/*
  # Add has_children field to profiles table

  1. Changes
    - Add `has_children` boolean field to profiles table with default false
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_children'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_children boolean DEFAULT false;
  END IF;
END $$;