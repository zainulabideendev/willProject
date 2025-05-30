/*
  # Add support for multiple executors

  1. Changes
    - Add executor_order integer column to executors table
    - Add is_primary boolean column to identify primary executor
    - Add unique constraint to ensure order uniqueness per profile
    - Add unique constraint for primary executor per profile

  2. Security
    - No changes to RLS policies needed
*/

-- Add new columns to executors table
ALTER TABLE executors 
ADD COLUMN executor_order integer DEFAULT 0,
ADD COLUMN is_primary boolean DEFAULT false;

-- Create unique constraint for executor order per profile
CREATE UNIQUE INDEX idx_executor_order_per_profile 
ON executors (profile_id, executor_order);

-- Create unique constraint for primary executor per profile
CREATE UNIQUE INDEX idx_primary_executor_per_profile 
ON executors (profile_id) 
WHERE is_primary = true;