/*
  # Add guardian fields to profiles table

  1. Changes
    - Add guardian_title text column
    - Add guardian_first_names text column
    - Add guardian_last_name text column
    - Add guardian_id_number text column
    - Add guardian_phone text column
    - Add guardian_relationship text column
    - Add guardian_address text column

  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS guardian_title text,
ADD COLUMN IF NOT EXISTS guardian_first_names text,
ADD COLUMN IF NOT EXISTS guardian_last_name text,
ADD COLUMN IF NOT EXISTS guardian_id_number text,
ADD COLUMN IF NOT EXISTS guardian_phone text,
ADD COLUMN IF NOT EXISTS guardian_relationship text,
ADD COLUMN IF NOT EXISTS guardian_address text;