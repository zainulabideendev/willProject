/*
  # Remove location field from vehicle assets

  1. Changes
    - Add details column if it doesn't exist
    - Migrate existing vehicle location data to details jsonb field
    - Remove location column from assets table

  2. Security
    - No changes to RLS policies needed
*/

-- First, ensure details column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'details'
  ) THEN
    ALTER TABLE assets ADD COLUMN details jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Migrate existing vehicle location data to details
DO $$ 
BEGIN
  UPDATE assets
  SET details = COALESCE(details, '{}'::jsonb) || jsonb_build_object('location', location)
  WHERE asset_type = 'vehicle' AND location IS NOT NULL;
END $$;

-- Remove location column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'location'
  ) THEN
    ALTER TABLE assets DROP COLUMN location;
  END IF;
END $$;