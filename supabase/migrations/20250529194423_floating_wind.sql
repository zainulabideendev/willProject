/*
  # Add address column to children table

  1. Changes
    - Add `address` text column to the `children` table
*/

-- Add address column to children table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'address'
  ) THEN
    ALTER TABLE children ADD COLUMN address text;
  END IF;
END $$;