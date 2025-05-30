/*
  # Add missing columns to profiles table

  1. Changes
    - Add has_beneficiaries boolean column
    - Add assets_fully_allocated boolean column
    - Add residue_fully_allocated boolean column
    - Add spouse_uuid uuid column
    - Set default values for boolean columns to false
    - Set default value for spouse_uuid to gen_random_uuid()

  2. Security
    - No changes to RLS policies needed
*/

-- Add missing columns to profiles table
DO $$ 
BEGIN
  -- Add has_beneficiaries column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_beneficiaries'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_beneficiaries boolean DEFAULT false;
  END IF;

  -- Add assets_fully_allocated column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'assets_fully_allocated'
  ) THEN
    ALTER TABLE profiles ADD COLUMN assets_fully_allocated boolean DEFAULT false;
  END IF;

  -- Add residue_fully_allocated column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'residue_fully_allocated'
  ) THEN
    ALTER TABLE profiles ADD COLUMN residue_fully_allocated boolean DEFAULT false;
  END IF;

  -- Add spouse_uuid column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'spouse_uuid'
  ) THEN
    ALTER TABLE profiles ADD COLUMN spouse_uuid uuid DEFAULT gen_random_uuid();
  END IF;
END $$;