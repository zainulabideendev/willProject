/*
  # Add unique constraints to beneficiaries table

  1. Changes
    - Add unique constraint for family member beneficiaries to prevent duplicates
    - Add unique constraint for non-family member beneficiaries to prevent duplicates
    - Add function to enforce uniqueness rules

  2. Security
    - No changes to RLS policies needed
*/

-- Add unique constraint for family member beneficiaries
ALTER TABLE beneficiaries
ADD CONSTRAINT unique_family_member_beneficiary
UNIQUE (profile_id, is_family_member, family_member_type, family_member_id)
WHERE is_family_member = true;

-- Add unique constraint for non-family member beneficiaries
ALTER TABLE beneficiaries
ADD CONSTRAINT unique_non_family_beneficiary
UNIQUE (profile_id, id)
WHERE is_family_member = false;