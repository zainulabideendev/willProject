/*
  # Clean up duplicate beneficiaries and add unique constraints

  1. Changes
    - Remove duplicate beneficiary records
    - Add unique constraints to prevent future duplicates
    - Keep only the most recently created beneficiary for each unique combination

  2. Security
    - No changes to RLS policies needed
*/

-- First, clean up any existing duplicate family member beneficiaries
WITH duplicates AS (
  SELECT DISTINCT ON (profile_id, family_member_type, family_member_id)
    id,
    profile_id,
    family_member_type,
    family_member_id,
    created_at
  FROM beneficiaries
  WHERE is_family_member = true
  ORDER BY profile_id, family_member_type, family_member_id, created_at DESC
),
to_delete AS (
  SELECT b.id
  FROM beneficiaries b
  LEFT JOIN duplicates d ON b.id = d.id
  WHERE b.is_family_member = true
    AND d.id IS NULL
)
DELETE FROM beneficiaries
WHERE id IN (SELECT id FROM to_delete);

-- Then create the unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_family_member_beneficiary 
ON beneficiaries (profile_id, family_member_type, family_member_id) 
WHERE is_family_member = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_non_family_beneficiary 
ON beneficiaries (profile_id, id) 
WHERE is_family_member = false;