/*
  # Add debt handling fields to assets table

  1. Changes
    - Add is_fully_paid boolean column to assets table
    - Add debt_handling_method text column to assets table
    - Add constraints to validate debt handling method values

  2. Security
    - No changes to RLS policies needed
*/

-- Add new columns to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS is_fully_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS debt_handling_method text;

-- Add constraint to validate debt handling method values
ALTER TABLE assets
ADD CONSTRAINT valid_debt_handling_method
CHECK (
  debt_handling_method IS NULL OR
  debt_handling_method IN (
    'subject_to_existing_debt',
    'estate_paid_debt',
    'asset_sale_and_distribution',
    'partial_allocation_with_deduction',
    'hybrid_approach'
  )
);