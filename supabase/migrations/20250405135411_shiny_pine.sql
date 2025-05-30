/*
  # Add audit logs table and related functions

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to profiles)
      - `action` (text) - Type of action performed
      - `details` (jsonb) - Additional details about the action
      - `created_at` (timestamptz)
      - `ip_address` (text)
      - `user_agent` (text)

  2. Security
    - Enable RLS on audit_logs table
    - Add policy for super_admin users to read logs
*/

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins to read logs
CREATE POLICY "Super admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Create index for efficient querying
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create function to add audit log
CREATE OR REPLACE FUNCTION add_audit_log(
  action text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT NULL,
  user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO audit_logs (
    admin_id,
    action,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    action,
    details,
    ip_address,
    user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;