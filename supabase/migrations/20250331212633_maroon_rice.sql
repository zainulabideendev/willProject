/*
  # Add spouse allocation trigger

  1. Changes
    - Add trigger to automatically allocate 50% to spouse for marriages in community of property
    - Trigger fires when a new beneficiary is added for a spouse
    - Automatically creates asset and residue allocations
    - Only applies to marriages in community of property

  2. Security
    - No changes to RLS policies needed
*/

-- Create function to handle automatic spouse allocations
CREATE OR REPLACE FUNCTION handle_spouse_allocations()
RETURNS TRIGGER AS $$
DECLARE
  marriage_regime text;
  asset_record RECORD;
BEGIN
  -- Only proceed for spouse beneficiaries
  IF NOT (NEW.is_family_member AND NEW.family_member_type = 'spouse') THEN
    RETURN NEW;
  END IF;

  -- Get marriage property regime
  SELECT marriage_property_regime INTO marriage_regime
  FROM profiles
  WHERE id = NEW.profile_id;

  -- Only proceed for in community of property marriages
  IF marriage_regime != 'in_community' THEN
    RETURN NEW;
  END IF;

  -- Allocate 50% of each asset to spouse
  FOR asset_record IN 
    SELECT id 
    FROM assets 
    WHERE profile_id = NEW.profile_id
  LOOP
    INSERT INTO asset_allocations (
      profile_id,
      asset_id,
      beneficiary_id,
      allocation_percentage
    ) VALUES (
      NEW.profile_id,
      asset_record.id,
      NEW.id,
      50
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  -- Allocate 50% of residue to spouse
  INSERT INTO residue_allocations (
    profile_id,
    beneficiary_id,
    allocation_percentage
  ) VALUES (
    NEW.profile_id,
    NEW.id,
    50
  ) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS auto_spouse_allocation_trigger ON beneficiaries;
CREATE TRIGGER auto_spouse_allocation_trigger
  AFTER INSERT ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION handle_spouse_allocations();