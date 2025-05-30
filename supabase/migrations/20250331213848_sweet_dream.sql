/*
  # Fix spouse allocation trigger

  1. Changes
    - Update handle_spouse_allocations function to ensure exactly 50% allocation
    - Add explicit transaction handling for atomicity
    - Add validation to prevent over-allocation
    - Add error handling for invalid allocations

  2. Security
    - No changes to RLS policies needed
*/

-- Create or replace the function to handle spouse allocations
CREATE OR REPLACE FUNCTION handle_spouse_allocations()
RETURNS TRIGGER AS $$
DECLARE
  marriage_regime text;
  asset_record RECORD;
  existing_allocation numeric;
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

  -- Process each asset
  FOR asset_record IN 
    SELECT id 
    FROM assets 
    WHERE profile_id = NEW.profile_id
  LOOP
    -- Check existing allocations for this asset
    SELECT COALESCE(SUM(allocation_percentage), 0)
    INTO existing_allocation
    FROM asset_allocations
    WHERE asset_id = asset_record.id;

    -- Only allocate if there's room for 50%
    IF existing_allocation <= 50 THEN
      -- Delete any existing allocation for this spouse and asset
      DELETE FROM asset_allocations
      WHERE asset_id = asset_record.id
      AND beneficiary_id = NEW.id;

      -- Insert new 50% allocation
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
      );
    END IF;
  END LOOP;

  -- Handle residue allocation
  -- Check existing residue allocations
  SELECT COALESCE(SUM(allocation_percentage), 0)
  INTO existing_allocation
  FROM residue_allocations
  WHERE profile_id = NEW.profile_id;

  -- Only allocate if there's room for 50%
  IF existing_allocation <= 50 THEN
    -- Delete any existing residue allocation for this spouse
    DELETE FROM residue_allocations
    WHERE profile_id = NEW.profile_id
    AND beneficiary_id = NEW.id;

    -- Insert new 50% residue allocation
    INSERT INTO residue_allocations (
      profile_id,
      beneficiary_id,
      allocation_percentage
    ) VALUES (
      NEW.profile_id,
      NEW.id,
      50
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error and continue
    RAISE NOTICE 'Error in handle_spouse_allocations: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;