/*
  # Add beneficiary tracking

  1. Changes
    - Add `has_beneficiaries` boolean column to profiles table
    - Add trigger to automatically update this flag when beneficiaries are added/removed
    - Add function to check if profile has any beneficiaries

  2. Security
    - No changes to RLS policies needed
*/

-- Add column to track if profile has any beneficiaries
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_beneficiaries boolean DEFAULT false;

-- Create function to check if profile has any beneficiaries
CREATE OR REPLACE FUNCTION check_has_beneficiaries(profile_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM beneficiaries
    WHERE profile_id = profile_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to update the has_beneficiaries status
CREATE OR REPLACE FUNCTION update_has_beneficiaries()
RETURNS TRIGGER AS $$
DECLARE
  profile_uuid uuid;
BEGIN
  -- Get the profile_id based on whether this is an insert, update, or delete
  IF TG_OP = 'DELETE' THEN
    profile_uuid := OLD.profile_id;
  ELSE
    profile_uuid := NEW.profile_id;
  END IF;

  -- Update the profile's has_beneficiaries status
  UPDATE profiles
  SET has_beneficiaries = check_has_beneficiaries(profile_uuid)
  WHERE id = profile_uuid;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for beneficiaries table
DROP TRIGGER IF EXISTS update_has_beneficiaries_insert ON beneficiaries;
CREATE TRIGGER update_has_beneficiaries_insert
  AFTER INSERT OR UPDATE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_has_beneficiaries();

DROP TRIGGER IF EXISTS update_has_beneficiaries_delete ON beneficiaries;
CREATE TRIGGER update_has_beneficiaries_delete
  AFTER DELETE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_has_beneficiaries();

-- Initialize the status for all existing profiles
UPDATE profiles p
SET has_beneficiaries = check_has_beneficiaries(p.id);