/*
  # Add index for beneficiary lookup and fix deletion

  1. Changes
    - Add composite index on beneficiaries table for efficient lookups
    - Index includes profile_id, is_family_member, family_member_type, and family_member_id
    - This will improve performance of beneficiary deletion queries

  2. Security
    - No changes to RLS policies needed
*/

-- Add composite index for beneficiary lookups
CREATE INDEX IF NOT EXISTS idx_beneficiaries_lookup 
ON beneficiaries (
  profile_id,
  is_family_member,
  family_member_type,
  family_member_id
);