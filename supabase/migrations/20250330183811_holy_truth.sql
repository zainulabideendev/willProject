/*
  # Add asset allocation tracking

  1. Changes
    - Add `assets_fully_allocated` boolean column to profiles table
    - Add trigger to automatically update this flag when asset allocations change
    - Add function to calculate if all assets are fully allocated

  2. Security
    - No changes to RLS policies needed
*/

-- Add column to track if all assets are fully allocated
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assets_fully_allocated boolean DEFAULT false;

-- Create function to check if all assets are fully allocated
CREATE OR REPLACE FUNCTION check_asset_allocations(profile_uuid uuid)
RETURNS boolean AS $$
DECLARE
  all_allocated boolean;
BEGIN
  WITH asset_totals AS (
    SELECT 
      a.id as asset_id,
      COALESCE(SUM(aa.allocation_percentage), 0) as total_allocation
    FROM assets a
    LEFT JOIN asset_allocations aa ON a.id = aa.asset_id
    WHERE a.profile_id = profile_uuid
    GROUP BY a.id
  )
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN true  -- No assets means technically "fully allocated"
      ELSE bool_and(ROUND(total_allocation) = 100)  -- All assets must sum to 100%
    END INTO all_allocated
  FROM asset_totals;
  
  RETURN all_allocated;
END;
$$ LANGUAGE plpgsql;

-- Create function to update the allocation status
CREATE OR REPLACE FUNCTION update_asset_allocation_status()
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

  -- Update the profile's allocation status
  UPDATE profiles
  SET assets_fully_allocated = check_asset_allocations(profile_uuid)
  WHERE id = profile_uuid;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for asset_allocations table
DROP TRIGGER IF EXISTS update_allocation_status_insert ON asset_allocations;
CREATE TRIGGER update_allocation_status_insert
  AFTER INSERT OR UPDATE ON asset_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_allocation_status();

DROP TRIGGER IF EXISTS update_allocation_status_delete ON asset_allocations;
CREATE TRIGGER update_allocation_status_delete
  AFTER DELETE ON asset_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_allocation_status();

-- Also trigger when assets are added or removed
DROP TRIGGER IF EXISTS update_allocation_status_assets ON assets;
CREATE TRIGGER update_allocation_status_assets
  AFTER INSERT OR DELETE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_allocation_status();

-- Initialize the status for all existing profiles
UPDATE profiles p
SET assets_fully_allocated = check_asset_allocations(p.id);