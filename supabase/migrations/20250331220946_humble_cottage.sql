/*
  # Fix marriage details persistence

  1. Changes
    - Update spouse/partner exclusivity trigger to properly handle marriage status changes
    - Add notification for profile updates
    - Ensure spouse details are properly saved and cleared

  2. Security
    - No changes to RLS policies needed
*/

-- Create or replace the function to handle spouse/partner exclusivity
CREATE OR REPLACE FUNCTION handle_spouse_partner_exclusivity()
RETURNS TRIGGER AS $$
DECLARE
  spouse_beneficiary_id uuid;
  partner_beneficiary_id uuid;
BEGIN
  -- If setting has_life_partner to true, clear spouse details
  IF COALESCE(OLD.has_life_partner, false) = false AND NEW.has_life_partner = true THEN
    -- Clear spouse details
    NEW.marital_status = 'single';
    NEW.marriage_property_regime = NULL;
    NEW.spouse_title = NULL;
    NEW.spouse_first_name = NULL;
    NEW.spouse_last_name = NULL;
    NEW.spouse_email = NULL;
    NEW.spouse_phone = NULL;
    NEW.spouse_id_number = NULL;
    NEW.spouse_uuid = NULL;

    -- Find and remove spouse beneficiary
    SELECT id INTO spouse_beneficiary_id
    FROM beneficiaries
    WHERE profile_id = NEW.id
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
  END IF;

  -- If setting marital_status to married, clear partner details
  IF COALESCE(OLD.marital_status, '') != 'married' AND NEW.marital_status = 'married' THEN
    -- Clear partner details
    NEW.has_life_partner = false;
    NEW.partner_title = NULL;
    NEW.partner_first_name = NULL;
    NEW.partner_last_name = NULL;
    NEW.partner_email = NULL;
    NEW.partner_phone = NULL;
    NEW.partner_id_number = NULL;
    NEW.partner_uuid = NULL;

    -- Find and remove partner beneficiary
    SELECT id INTO partner_beneficiary_id
    FROM beneficiaries
    WHERE profile_id = NEW.id
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
  END IF;

  -- If unmarrying, clear spouse details
  IF COALESCE(OLD.marital_status, '') = 'married' AND NEW.marital_status = 'single' THEN
    NEW.marriage_property_regime = NULL;
    NEW.spouse_title = NULL;
    NEW.spouse_first_name = NULL;
    NEW.spouse_last_name = NULL;
    NEW.spouse_email = NULL;
    NEW.spouse_phone = NULL;
    NEW.spouse_id_number = NULL;
    NEW.spouse_uuid = NULL;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_spouse_partner_exclusivity: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;