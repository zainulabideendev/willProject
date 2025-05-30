/*
  # Add multiple executors support

  1. Changes
    - Add order column to profiles table for executor ordering
    - Add is_primary boolean column to identify primary executor
    - Add constraint to ensure only one primary executor

  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS executor_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_primary_executor boolean DEFAULT false;

-- Create unique constraint to ensure only one primary executor per profile
CREATE UNIQUE INDEX IF NOT EXISTS idx_primary_executor 
ON profiles (id) 
WHERE is_primary_executor = true;