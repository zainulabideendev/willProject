/*
  # Add partner firm reference column to profiles table

  1. Changes
    - Add `partner_firm_reference` column to `profiles` table
    - Add foreign key constraint to reference `partner_firms` table
    - Add index for better query performance

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'partner_firm_reference'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN partner_firm_reference uuid REFERENCES partner_firms(id);

    CREATE INDEX IF NOT EXISTS idx_profiles_partner_firm_reference 
    ON profiles(partner_firm_reference);
  END IF;
END $$;