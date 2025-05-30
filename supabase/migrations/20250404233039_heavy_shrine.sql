/*
  # Add partner firms table and related fields

  1. New Tables
    - `partner_firms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `logo_url` (text)
      - `contact_email` (text)
      - `contact_phone` (text)
      - `address` (text)
      - `registration_number` (text)
      - `years_experience` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on partner_firms table
    - Add policy for authenticated users to read partner firms
*/

-- Create partner_firms table
CREATE TABLE IF NOT EXISTS partner_firms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  contact_email text,
  contact_phone text,
  address text,
  registration_number text,
  years_experience integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE partner_firms ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read partner firms
CREATE POLICY "Users can read partner firms"
  ON partner_firms
  FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_partner_firms_updated_at
  BEFORE UPDATE ON partner_firms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();