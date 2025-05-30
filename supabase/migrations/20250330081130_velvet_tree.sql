/*
  # Create beneficiaries table and related functions

  1. New Tables
    - `beneficiaries`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `first_names` (text)
      - `last_name` (text)
      - `id_number` (text)
      - `relationship` (text)
      - `phone` (text)
      - `allocation_percentage` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `is_family_member` (boolean)
      - `family_member_type` (text) - 'spouse', 'partner', 'child'
      - `family_member_id` (uuid)

  2. Security
    - Enable RLS on beneficiaries table
    - Add policy for authenticated users to manage their beneficiaries
*/

-- Create beneficiaries table
CREATE TABLE IF NOT EXISTS beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  first_names text NOT NULL,
  last_name text NOT NULL,
  id_number text,
  relationship text,
  phone text,
  allocation_percentage numeric DEFAULT 0 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_family_member boolean DEFAULT false,
  family_member_type text,
  family_member_id uuid,
  CONSTRAINT valid_family_member_type CHECK (
    is_family_member = false OR 
    family_member_type IN ('spouse', 'partner', 'child')
  )
);

-- Enable RLS
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their beneficiaries
CREATE POLICY "Users can manage their beneficiaries"
  ON beneficiaries
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();