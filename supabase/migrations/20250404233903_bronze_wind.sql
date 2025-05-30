/*
  # Add executor_type column to profiles table

  1. Changes
    - Add `executor_type` column to `profiles` table
    - Add check constraint to validate executor_type values
    - Make the column nullable to handle existing records

  2. Security
    - No changes to RLS policies needed as the existing profile policies will cover this new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'executor_type'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN executor_type text DEFAULT NULL;

    ALTER TABLE profiles 
    ADD CONSTRAINT valid_executor_type 
    CHECK (
      executor_type IS NULL OR 
      executor_type = ANY (ARRAY['manual'::text, 'partner_firm'::text])
    );
  END IF;
END $$;