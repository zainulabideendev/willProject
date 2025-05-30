/*
  # Enforce spouse and life partner exclusivity

  1. Changes
    - Add trigger to enforce that a profile cannot have both a spouse and a life partner
    - When setting has_life_partner to true, clear spouse details
    - When setting marital_status to 'married', clear life partner details

  2. Security
    - No changes to RLS policies
*/

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION handle_spouse_partner_exclusivity()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting has_life_partner to true, clear spouse details
  IF NEW.has_life_partner = true THEN
    NEW.marital_status = 'single';
    NEW.marriage_property_regime = NULL;
    NEW.spouse_title = NULL;
    NEW.spouse_first_name = NULL;
    NEW.spouse_last_name = NULL;
    NEW.spouse_email = NULL;
    NEW.spouse_phone = NULL;
    NEW.spouse_id_number = NULL;
  END IF;

  -- If setting marital_status to married, clear life partner details
  IF NEW.marital_status = 'married' THEN
    NEW.has_life_partner = false;
    NEW.partner_title = NULL;
    NEW.partner_first_name = NULL;
    NEW.partner_last_name = NULL;
    NEW.partner_email = NULL;
    NEW.partner_phone = NULL;
    NEW.partner_id_number = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'enforce_spouse_partner_exclusivity'
  ) THEN
    CREATE TRIGGER enforce_spouse_partner_exclusivity
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_spouse_partner_exclusivity();
  END IF;
END $$;