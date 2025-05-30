/*
  # Add last message field to profiles table

  1. Changes
    - Add last_message text column to profiles table
    - This column will store the user's personal message to their loved ones

  2. Security
    - No changes to RLS policies needed as this column is covered by existing profile policies
*/

-- Add last_message column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_message text;