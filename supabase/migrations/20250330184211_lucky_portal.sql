/*
  # Add residue allocation tracking

  1. Changes
    - Add `residue_fully_allocated` boolean column to profiles table
    - Add trigger to automatically update this flag when residue allocations change
    - Add function to calculate if residue is fully allocated

  2. Security
    - No changes to RLS policies needed
*/

-- Add column to track if residue is fully allocated
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS residue_fully_allocated boolean DEFAULT false;

-- Create function to check if residue is fully allocated
CREATE OR REPLACE FUNCTION check_residue_allocations(profile_uuid uuid)
RETURNS boolean AS $$
DECLARE
  total_allocation numeric;
BEGIN
  SELECT COALESCE(SUM(allocation_percentage), 0)
  INTO total_allocation
  FROM residue_allocations
  WHERE profile_id = profile_uuid;
  
  RETURN ROUND(total_allocation) = 100;
END;
$$ LANGUAGE plpgsql;

-- Create function to update the residue allocation status
CREATE OR REPLACE FUNCTION update_residue_allocation_status()
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

  -- Update the profile's residue allocation status
  UPDATE profiles
  SET residue_fully_allocated = check_residue_allocations(profile_uuid)
  WHERE id = profile_uuid;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for residue_allocations table
DROP TRIGGER IF EXISTS update_residue_status_insert ON residue_allocations;
CREATE TRIGGER update_residue_status_insert
  AFTER INSERT OR UPDATE ON residue_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_residue_allocation_status();

DROP TRIGGER IF EXISTS update_residue_status_delete ON residue_allocations;
CREATE TRIGGER update_residue_status_delete
  AFTER DELETE ON residue_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_residue_allocation_status();

-- Initialize the status for all existing profiles
UPDATE profiles p
SET residue_fully_allocated = check_residue_allocations(p.id);