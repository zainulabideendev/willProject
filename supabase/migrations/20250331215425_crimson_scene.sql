/*
  # Remove spouse allocation functionality

  1. Changes
    - Remove auto_spouse_allocation_trigger from beneficiaries table
    - Drop handle_spouse_allocations function
    - This removes the automatic 50% allocation for spouses in community of property marriages

  2. Security
    - No changes to RLS policies needed
    - Existing allocations will remain intact
    - Future allocations will need to be made manually
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS auto_spouse_allocation_trigger ON beneficiaries;

-- Then drop the function
DROP FUNCTION IF EXISTS handle_spouse_allocations();