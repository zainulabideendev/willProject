/*
  # Add executors table and related functions

  1. New Tables
    - `executors`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `first_names` (text)
      - `last_name` (text)
      - `id_number` (text)
      - `phone` (text)
      - `email` (text)
      - `address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on executors table
    - Add policy for authenticated users
*/

-- Create executors table
CREATE TABLE IF NOT EXISTS executors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  first_names text NOT NULL,
  last_name text NOT NULL,
  id_number text,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE executors ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage their executors"
  ON executors
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_executors_updated_at
  BEFORE UPDATE ON executors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();