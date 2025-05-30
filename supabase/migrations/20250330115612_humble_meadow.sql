/*
  # Add residue allocations table

  1. New Tables
    - `residue_allocations`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `beneficiary_id` (uuid, foreign key to beneficiaries)
      - `allocation_percentage` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on residue_allocations table
    - Add policy for authenticated users to manage their residue allocations
*/

CREATE TABLE IF NOT EXISTS residue_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  beneficiary_id uuid REFERENCES beneficiaries(id) ON DELETE CASCADE,
  allocation_percentage numeric DEFAULT 0 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE residue_allocations ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their residue allocations
CREATE POLICY "Users can manage their residue allocations"
  ON residue_allocations
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_residue_allocations_updated_at
  BEFORE UPDATE ON residue_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();