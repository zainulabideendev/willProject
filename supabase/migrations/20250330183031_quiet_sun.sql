/*
  # Add beneficiary count tracking

  1. Changes
    - Add `beneficiary_count` integer column to profiles table
    - Set default value to 0
    - Add trigger to automatically update count when beneficiaries change

  2. Security
    - No changes to RLS policies needed as this column is covered by existing profile policies
*/

-- Add beneficiary_count column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beneficiary_count integer DEFAULT 0;

-- Create function to update beneficiary count
CREATE OR REPLACE FUNCTION update_beneficiary_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET beneficiary_count = beneficiary_count + 1
    WHERE id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET beneficiary_count = beneficiary_count - 1
    WHERE id = OLD.profile_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for beneficiary count updates
DROP TRIGGER IF EXISTS update_beneficiary_count_insert ON beneficiaries;
CREATE TRIGGER update_beneficiary_count_insert
  AFTER INSERT ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_beneficiary_count();

DROP TRIGGER IF EXISTS update_beneficiary_count_delete ON beneficiaries;
CREATE TRIGGER update_beneficiary_count_delete
  AFTER DELETE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_beneficiary_count();

-- Initialize beneficiary count for existing profiles
UPDATE profiles p
SET beneficiary_count = (
  SELECT COUNT(*)
  FROM beneficiaries b
  WHERE b.profile_id = p.id
);