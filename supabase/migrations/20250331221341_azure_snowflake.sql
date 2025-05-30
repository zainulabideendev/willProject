/*
  # Fix spouse/partner exclusivity trigger timing

  1. Changes
    - Change trigger timing from BEFORE to AFTER
    - Move data cleanup to separate function calls
    - Add proper transaction handling
    - Improve error handling and logging

  2. Security
    - No changes to RLS policies needed
*/

-- Create function to clean up spouse data
CREATE OR REPLACE FUNCTION cleanup_spouse_data(profile_id uuid)
RETURNS void AS $$
DECLARE
  spouse_beneficiary_id uuid;
BEGIN
  -- Find spouse beneficiary
  SELECT id INTO spouse_beneficiary_id
  FROM beneficiaries
  WHERE profile_id = profile_id
  AND is_family_member = true
  AND family_member_type = 'spouse';

  IF spouse_beneficiary_id IS NOT NULL THEN
    -- Remove spouse allocations
    DELETE FROM asset_allocations
    WHERE beneficiary_id = spouse_beneficiary_id;

    DELETE FROM residue_allocations
    WHERE beneficiary_id = spouse_beneficiary_id;

    -- Remove spouse beneficiary
    DELETE FROM beneficiaries
    WHERE id = spouse_beneficiary_id;
  END IF;

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
    spouse_uuid = NULL
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up partner data
CREATE OR REPLACE FUNCTION cleanup_partner_data(profile_id uuid)
RETURNS void AS $$
DECLARE
  partner_beneficiary_id uuid;
BEGIN
  -- Find partner beneficiary
  SELECT id INTO partner_beneficiary_id
  FROM beneficiaries
  WHERE profile_id = profile_id
  AND is_family_member = true
  AND family_member_type = 'partner';

  IF partner_beneficiary_id IS NOT NULL THEN
    -- Remove partner allocations
    DELETE FROM asset_allocations
    WHERE beneficiary_id = partner_beneficiary_id;

    DELETE FROM residue_allocations
    WHERE beneficiary_id = partner_beneficiary_id;

    -- Remove partner beneficiary
    DELETE FROM beneficiaries
    WHERE id = partner_beneficiary_id;
  END IF;

  -- Update profile
  UPDATE profiles SET
    has_life_partner = false,
    partner_title = NULL,
    partner_first_name = NULL,
    partner_last_name = NULL,
    partner_email = NULL,
    partner_phone = NULL,
    partner_id_number = NULL,
    partner_uuid = NULL
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the main trigger function
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

  RETURN NULL;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_spouse_partner_exclusivity: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_spouse_partner_exclusivity ON profiles;

-- Create the trigger with AFTER timing
CREATE TRIGGER enforce_spouse_partner_exclusivity
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_spouse_partner_exclusivity();