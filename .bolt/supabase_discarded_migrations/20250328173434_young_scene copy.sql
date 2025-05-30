/*
  # Create assets table and related functions

  1. New Tables
    - `assets`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `asset_type` (text) - vehicle, property, electronics, bank, business, other
      - `name` (text) - descriptive name of the asset
      - `details` (jsonb) - flexible storage for type-specific fields
      - `estimated_value` (numeric)
      - `location` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on assets table
    - Add policy for authenticated users to manage their assets
*/

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  name text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  estimated_value numeric NOT NULL CHECK (estimated_value >= 0),
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their assets
CREATE POLICY "Users can manage their assets"
  ON assets
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();