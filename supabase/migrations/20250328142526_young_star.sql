/*
  # Remove documentation score column

  1. Changes
    - Remove documentation_score column from estate_score table
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'estate_score' AND column_name = 'documentation_score'
  ) THEN
    ALTER TABLE estate_score DROP COLUMN documentation_score;
  END IF;
END $$;