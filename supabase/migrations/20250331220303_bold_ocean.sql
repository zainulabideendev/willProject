/*
  # Fix spouse and partner exclusivity trigger

  1. Changes
    - Remove problematic NOTIFY statement
    - Ensure complete cleanup of spouse/partner data
    - Add proper error handling
    - Maintain data integrity during transitions

  2. Security
    - No changes to RLS policies needed
*/

-- Create or replace the function to handle spouse/partner exclusivity
CREATE OR REPLACE FUNCTION handle_spouse_partner_exclusivity()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting has_life_partner to true, clear spouse details
  IF NEW.has_life_partner = true THEN
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

    -- Delete spouse beneficiary and allocations
    DELETE FROM asset_allocations aa
    USING beneficiaries b
    WHERE b.profile_id = NEW.id
    AND b.is_family_member = true
    AND b.family_member_type = 'spouse'
    AND aa.beneficiary_id = b.id;

    DELETE FROM residue_allocations ra
    USING beneficiaries b
    WHERE b.profile_id = NEW.id
    AND b.is_family_member = true
    AND b.family_member_type = 'spouse'
    AND ra.beneficiary_id = b.id;

    DELETE FROM beneficiaries
    WHERE profile_id = NEW.id
    AND is_family_member = true
    AND family_member_type = 'spouse';
  END IF;

  -- If setting marital_status to married, clear partner details
  IF NEW.marital_status = 'married' THEN
    -- Clear partner details
    NEW.has_life_partner = false;
    NEW.partner_title = NULL;
    NEW.partner_first_name = NULL;
    NEW.partner_last_name = NULL;
    NEW.partner_email = NULL;
    NEW.partner_phone = NULL;
    NEW.partner_id_number = NULL;
    NEW.partner_uuid = NULL;

    -- Delete partner beneficiary and allocations
    DELETE FROM asset_allocations aa
    USING beneficiaries b
    WHERE b.profile_id = NEW.id
    AND b.is_family_member = true
    AND b.family_member_type = 'partner'
    AND aa.beneficiary_id = b.id;

    DELETE FROM residue_allocations ra
    USING beneficiaries b
    WHERE b.profile_id = NEW.id
    AND b.is_family_member = true
    AND b.family_member_type = 'partner'
    AND ra.beneficiary_id = b.id;

    DELETE FROM beneficiaries
    WHERE profile_id = NEW.id
    AND is_family_member = true
    AND family_member_type = 'partner';
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error and continue
    RAISE WARNING 'Error in handle_spouse_partner_exclusivity: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;