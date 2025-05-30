/*
  # Add marriage property regime

  1. Changes
    - Add marriage_property_regime column to profiles table
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'marriage_property_regime'
  ) THEN
    ALTER TABLE profiles ADD COLUMN marriage_property_regime text;
  END IF;
END $$;