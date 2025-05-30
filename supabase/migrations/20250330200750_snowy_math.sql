/*
  # Add function to check for existing beneficiary before insert

  1. Changes
    - Add function to check if a beneficiary already exists before insert
    - Add trigger to call this function before insert
    - This prevents duplicate key violations while maintaining data integrity

  2. Security
    - No changes to RLS policies needed
*/

-- Create function to check for existing beneficiary
CREATE OR REPLACE FUNCTION check_existing_beneficiary()
RETURNS TRIGGER AS $$
BEGIN
  -- For family members, check if one already exists
  IF NEW.is_family_member = true THEN
    IF EXISTS (
      SELECT 1 
      FROM beneficiaries 
      WHERE profile_id = NEW.profile_id 
        AND is_family_member = true
        AND family_member_type = NEW.family_member_type
        AND (
          -- For children, check the specific child
          (NEW.family_member_type = 'child' AND family_member_id = NEW.family_member_id)
          -- For spouse/partner, just check the type
          OR (NEW.family_member_type IN ('spouse', 'partner'))
        )
    ) THEN
      RAISE EXCEPTION 'Beneficiary already exists for this family member'
        USING HINT = 'Remove the existing beneficiary first';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check for existing beneficiary before insert
DROP TRIGGER IF EXISTS check_existing_beneficiary_trigger ON beneficiaries;
CREATE TRIGGER check_existing_beneficiary_trigger
  BEFORE INSERT ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION check_existing_beneficiary();