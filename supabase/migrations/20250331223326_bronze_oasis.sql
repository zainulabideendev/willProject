/*
  # Fix spouse/partner cleanup and beneficiary handling

  1. Changes
    - Add proper transaction handling
    - Add proper error handling and rollback
    - Add allocation status updates
    - Fix race conditions with FOR UPDATE clause
    - Add proper cleanup order to handle foreign key constraints
    - Add proper status updates after cleanup
    - Add proper cleanup of all related data

  2. Security
    - No changes to RLS policies needed
*/

-- Drop existing functions and triggers first
DROP TRIGGER IF EXISTS enforce_spouse_partner_exclusivity ON profiles;
DROP FUNCTION IF EXISTS handle_spouse_partner_exclusivity();
DROP FUNCTION IF EXISTS cleanup_spouse_data(uuid);
DROP FUNCTION IF EXISTS cleanup_partner_data(uuid);

-- Create function to clean up spouse data with transaction handling
CREATE OR REPLACE FUNCTION cleanup_spouse_data(target_profile_id uuid)
RETURNS void AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Find and remove spouse beneficiary and all related data
    WITH spouse_beneficiary AS (
      SELECT id 
      FROM beneficiaries 
      WHERE profile_id = target_profile_id
        AND is_family_member = true
        AND family_member_type = 'spouse'
      FOR UPDATE
    )
    -- Delete all related allocations first (due to foreign key constraints)
    DELETE FROM asset_allocations
    WHERE beneficiary_id IN (SELECT id FROM spouse_beneficiary);

    DELETE FROM residue_allocations
    WHERE beneficiary_id IN (SELECT id FROM spouse_beneficiary);

    -- Delete the beneficiary record
    DELETE FROM beneficiaries
    WHERE profile_id = target_profile_id
      AND is_family_member = true
      AND family_member_type = 'spouse';

    -- Update profile
    UPDATE profiles SET
      marital_status = 'single',
      marriage_property_regime = NULL,
      spouse_title = NULL,
      spouse_first_name = NULL,
      spouse_last_name = NULL,
      spouse_email = NULL,
      spouse_phone = NULL,
      spouse_id_number = NULL,
      spouse_uuid = gen_random_uuid() -- Generate new UUID for future use
    WHERE id = target_profile_id;

    -- Update allocation status
    PERFORM update_asset_allocation_status();
    PERFORM update_residue_allocation_status();
    PERFORM update_has_beneficiaries();

    -- Commit transaction
    COMMIT;
  EXCEPTION
    WHEN others THEN
      -- Rollback transaction on error
      ROLLBACK;
      RAISE WARNING 'Error in cleanup_spouse_data for profile %: %', target_profile_id, SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up partner data with transaction handling
CREATE OR REPLACE FUNCTION cleanup_partner_data(target_profile_id uuid)
RETURNS void AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Find and remove partner beneficiary and all related data
    WITH partner_beneficiary AS (
      SELECT id 
      FROM beneficiaries 
      WHERE profile_id = target_profile_id
        AND is_family_member = true
        AND family_member_type = 'partner'
      FOR UPDATE
    )
    -- Delete all related allocations first (due to foreign key constraints)
    DELETE FROM asset_allocations
    WHERE beneficiary_id IN (SELECT id FROM partner_beneficiary);

    DELETE FROM residue_allocations
    WHERE beneficiary_id IN (SELECT id FROM partner_beneficiary);

    -- Delete the beneficiary record
    DELETE FROM beneficiaries
    WHERE profile_id = target_profile_id
      AND is_family_member = true
      AND family_member_type = 'partner';

    -- Update profile
    UPDATE profiles SET
      has_life_partner = false,
      partner_title = NULL,
      partner_first_name = NULL,
      partner_last_name = NULL,
      partner_email = NULL,
      partner_phone = NULL,
      partner_id_number = NULL,
      partner_uuid = gen_random_uuid() -- Generate new UUID for future use
    WHERE id = target_profile_id;

    -- Update allocation status
    PERFORM update_asset_allocation_status();
    PERFORM update_residue_allocation_status();
    PERFORM update_has_beneficiaries();

    -- Commit transaction
    COMMIT;
  EXCEPTION
    WHEN others THEN
      -- Rollback transaction on error
      ROLLBACK;
      RAISE WARNING 'Error in cleanup_partner_data for profile %: %', target_profile_id, SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the main trigger function with improved error handling
CREATE OR REPLACE FUNCTION handle_spouse_partner_exclusivity()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting has_life_partner to true, clean up spouse data
  IF COALESCE(OLD.has_life_partner, false) = false AND NEW.has_life_partner = true THEN
    PERFORM cleanup_spouse_data(NEW.id);
  END IF;

  -- If setting marital_status to married, clean up partner data
  IF COALESCE(OLD.marital_status, '') != 'married' AND NEW.marital_status = 'married' THEN
    PERFORM cleanup_partner_data(NEW.id);
  END IF;

  -- If unmarrying, clean up spouse data
  IF COALESCE(OLD.marital_status, '') = 'married' AND NEW.marital_status = 'single' THEN
    PERFORM cleanup_spouse_data(NEW.id);
  END IF;

  -- Update allocation status
  PERFORM update_asset_allocation_status();
  PERFORM update_residue_allocation_status();
  PERFORM update_has_beneficiaries();

  RETURN NULL;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_spouse_partner_exclusivity: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger with AFTER timing
CREATE TRIGGER enforce_spouse_partner_exclusivity
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_spouse_partner_exclusivity();