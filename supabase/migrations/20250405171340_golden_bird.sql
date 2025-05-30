/*
  # Add address field to profiles table

  1. Changes
    - Add address text column to profiles table
    - This column will store the user's residential address for the will

  2. Security
    - No changes to RLS policies needed as this column is covered by existing profile policies
*/

-- Add address column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address text;