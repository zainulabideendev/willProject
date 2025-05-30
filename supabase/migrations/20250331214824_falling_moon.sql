/*
  # Enhance spouse allocation handling

  1. Changes
    - Add trigger for spouse removal
    - Update spouse allocation function to handle both addition and removal
    - Add cleanup of allocations when spouse is removed
    - Add validation to prevent over-allocation

  2. Security
    - No changes to RLS policies needed
*/

-- Create function to handle spouse allocation changes
CREATE OR REPLACE FUNCTION handle_spouse_allocations()
RETURNS TRIGGER AS $$
DECLARE
  marriage_regime text;
  asset_record RECORD;
  existing_allocation numeric;
  profile_spouse_id uuid;
BEGIN
  -- Get marriage property regime
  SELECT marriage_property_regime INTO marriage_regime
  FROM profiles
  WHERE id = CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.profile_id 
    ELSE NEW.profile_id 
  END;

  -- Handle spouse removal (DELETE)
  IF TG_OP = 'DELETE' AND OLD.is_family_member AND OLD.family_member_type = 'spouse' THEN
    -- Only remove allocations if marriage was in community of property
    IF marriage_regime = 'in_community' THEN
      -- Remove asset allocations
      DELETE FROM asset_allocations
      WHERE beneficiary_id = OLD.id;

      -- Remove residue allocation
      DELETE FROM residue_allocations
      WHERE beneficiary_id = OLD.id;
    END IF;
    RETURN OLD;
  END IF;

  -- Handle spouse addition (INSERT)
  IF TG_OP = 'INSERT' AND NEW.is_family_member AND NEW.family_member_type = 'spouse' THEN
    -- Only proceed for in community of property marriages
    IF marriage_regime = 'in_community' THEN
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
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN others THEN
    -- Log error and continue
    RAISE NOTICE 'Error in handle_spouse_allocations: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger
DROP TRIGGER IF EXISTS auto_spouse_allocation_trigger ON beneficiaries;

-- Create new trigger that handles both INSERT and DELETE
CREATE TRIGGER auto_spouse_allocation_trigger
  AFTER INSERT OR DELETE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION handle_spouse_allocations();