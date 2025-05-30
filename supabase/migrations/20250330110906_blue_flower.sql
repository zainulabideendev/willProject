/*
  # Add UUID fields for spouse and partner

  1. Changes
    - Add spouse_uuid and partner_uuid columns to profiles table
    - These UUIDs will be used for asset allocations instead of 'spouse' and 'partner' strings
    - Add trigger to automatically generate UUIDs when spouse or partner is added

  2. Security
    - No changes to RLS policies needed
*/

-- Add UUID columns for spouse and partner
ALTER TABLE profiles 
ADD COLUMN spouse_uuid uuid DEFAULT gen_random_uuid(),
ADD COLUMN partner_uuid uuid DEFAULT gen_random_uuid();

-- Create function to handle UUID generation
CREATE OR REPLACE FUNCTION handle_spouse_partner_uuid()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate new UUID for spouse if marital status changes to married
  IF (OLD.marital_status IS NULL OR OLD.marital_status != 'married') 
     AND NEW.marital_status = 'married' THEN
    NEW.spouse_uuid = gen_random_uuid();
  END IF;

  -- Generate new UUID for partner if has_life_partner changes to true
  IF (OLD.has_life_partner IS NULL OR OLD.has_life_partner = false) 
     AND NEW.has_life_partner = true THEN
    NEW.partner_uuid = gen_random_uuid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;