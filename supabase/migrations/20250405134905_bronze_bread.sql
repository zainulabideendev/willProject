/*
  # Drop get_total_users function

  1. Changes
    - Drop the get_total_users function as we'll count directly from profiles table
    - This simplifies the counting logic and ensures we only count users with profiles

  2. Security
    - No changes to RLS policies needed
*/

DROP FUNCTION IF EXISTS get_total_users();