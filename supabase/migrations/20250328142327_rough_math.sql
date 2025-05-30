/*
  # Add children table and update estate score triggers

  1. New Tables
    - `children`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `first_names` (text)
      - `last_name` (text)
      - `date_of_birth` (date)
      - `email` (text)
      - `phone` (text)
      - `id_number` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `children` table
    - Add policy for authenticated users to manage their children
*/

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  first_names text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  email text,
  phone text,
  id_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their children
CREATE POLICY "Users can manage their children"
  ON children
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();