/*
  # Remove life partner functionality

  1. Changes
    - Remove life partner columns from profiles table
    - Remove life partner type from beneficiaries constraint
    - Remove partner-related functions and triggers
    - Clean up any existing partner data

  2. Security
    - No changes to RLS policies needed
*/

-- First, clean up any existing partner data
DELETE FROM asset_allocations aa
USING beneficiaries b
WHERE b.family_member_type = 'partner'
AND aa.beneficiary_id = b.id;

DELETE FROM residue_allocations ra
USING beneficiaries b
WHERE b.family_member_type = 'partner'
AND ra.beneficiary_id = b.id;

DELETE FROM beneficiaries
WHERE family_member_type = 'partner';

-- Remove partner columns from profiles table
ALTER TABLE profiles
  DROP COLUMN IF EXISTS has_life_partner,
  DROP COLUMN IF EXISTS partner_title,
  DROP COLUMN IF EXISTS partner_first_name,
  DROP COLUMN IF EXISTS partner_last_name,
  DROP COLUMN IF EXISTS partner_email,
  DROP COLUMN IF EXISTS partner_phone,
  DROP COLUMN IF EXISTS partner_id_number,
  DROP COLUMN IF EXISTS partner_uuid;

-- Update the valid_family_member_type constraint
ALTER TABLE beneficiaries
  DROP CONSTRAINT IF EXISTS valid_family_member_type;

ALTER TABLE beneficiaries
  ADD CONSTRAINT valid_family_member_type
  CHECK (
    (is_family_member = false) OR 
    (family_member_type IN ('spouse', 'child'))
  );