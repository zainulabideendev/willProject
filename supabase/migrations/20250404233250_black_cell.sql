/*
  # Add partner firm ID to profiles

  1. Changes
    - Add `partner_firm_id` column to profiles table
    - Add foreign key constraint to partner_firms table
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS partner_firm_id uuid REFERENCES partner_firms(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_partner_firm_id ON profiles(partner_firm_id);