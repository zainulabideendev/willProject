/*
  # Add name column to assets table

  1. Changes
    - Add `name` text column to assets table
    - Make it required (NOT NULL)
    - Add this column to support asset identification

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' AND column_name = 'name'
  ) THEN
    ALTER TABLE assets ADD COLUMN name text NOT NULL;
  END IF;
END $$;