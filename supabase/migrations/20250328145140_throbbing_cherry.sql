/*
  # Add Life Partner Fields

  1. Changes
    - Add has_life_partner boolean field to profiles table
    - Add partner details fields to profiles table (if not already present)
*/

DO $$ 
BEGIN
  -- Add has_life_partner field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_life_partner'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_life_partner boolean DEFAULT false;
  END IF;

  -- Add partner_title if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'partner_title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_title text;
  END IF;

  -- Add partner_first_name if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'partner_first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_first_name text;
  END IF;

  -- Add partner_last_name if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'partner_last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_last_name text;
  END IF;

  -- Add partner_email if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'partner_email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_email text;
  END IF;

  -- Add partner_phone if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'partner_phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_phone text;
  END IF;

  -- Add partner_id_number if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'partner_id_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_id_number text;
  END IF;
END $$;