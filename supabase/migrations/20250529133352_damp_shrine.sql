/*
  # Add address field to beneficiaries table

  1. Changes
    - Add address text column to beneficiaries table
    - This column will store the beneficiary's address for legal documentation

  2. Security
    - No changes to RLS policies needed as this column is covered by existing beneficiary policies
*/

-- Add address column to beneficiaries table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'address'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN address text;
  END IF;
END $$;