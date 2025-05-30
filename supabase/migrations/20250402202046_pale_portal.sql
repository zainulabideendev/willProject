/*
  # Add executor fields to profiles table

  1. Changes
    - Add executor_type field to track whether executor is manual or partner
    - Add manual executor fields for storing individual executor details
    - Add partner_firm_id for storing selected partner firm
    - Add partner_firm_reference for tracking partner firm reference number

  2. Security
    - No changes to RLS policies needed
*/

-- Add executor fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS executor_type text CHECK (executor_type IN ('manual', 'partner')),
ADD COLUMN IF NOT EXISTS executor_title text,
ADD COLUMN IF NOT EXISTS executor_first_names text,
ADD COLUMN IF NOT EXISTS executor_last_name text,
ADD COLUMN IF NOT EXISTS executor_id_number text,
ADD COLUMN IF NOT EXISTS executor_phone text,
ADD COLUMN IF NOT EXISTS executor_email text,
ADD COLUMN IF NOT EXISTS executor_address text,
ADD COLUMN IF NOT EXISTS partner_firm_id uuid,
ADD COLUMN IF NOT EXISTS partner_firm_reference text;