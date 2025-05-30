/*
  # Add order field to children table

  1. Changes
    - Add `order` integer field to children table to track the order of children
    - Add index on profile_id and order for efficient querying
    - Remove unique constraint on profile_id and relationship since we now support multiple children

  2. Security
    - No changes to RLS policies needed
*/

-- Add order field to children table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'children' AND column_name = 'order'
  ) THEN
    ALTER TABLE children ADD COLUMN "order" integer DEFAULT 0;
  END IF;
END $$;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS children_profile_id_order_idx ON children (profile_id, "order");

-- Drop the old unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'dependents_profile_id_relationship_key'
  ) THEN
    ALTER TABLE children DROP CONSTRAINT IF EXISTS dependents_profile_id_relationship_key;
  END IF;
END $$;