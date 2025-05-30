/*
  # Add welcome modal shown flag to profiles

  1. Changes
    - Add `welcome_modal_shown` boolean column to profiles table with default value of false
    - This column tracks whether a user has seen the welcome modal

  2. Security
    - No changes to RLS policies needed as this column is covered by existing profile policies
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'welcome_modal_shown'
  ) THEN
    ALTER TABLE profiles ADD COLUMN welcome_modal_shown boolean DEFAULT false;
  END IF;
END $$;