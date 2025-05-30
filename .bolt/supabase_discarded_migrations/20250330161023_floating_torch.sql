/*
  # Add unique constraints to beneficiaries table

  1. Changes
    - Add partial unique indexes to prevent duplicate beneficiary records
    - One index for family member beneficiaries
    - One index for non-family member beneficiaries

  2. Security
    - No changes to RLS policies needed
*/

-- Create unique index for family member beneficiaries
CREATE UNIQUE INDEX unique_family_member_beneficiary 
ON beneficiaries (profile_id, family_member_type, family_member_id) 
WHERE is_family_member = true;

-- Create unique index for non-family member beneficiaries
CREATE UNIQUE INDEX unique_non_family_beneficiary 
ON beneficiaries (profile_id, id) 
WHERE is_family_member = false;