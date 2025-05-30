/*
  # Add partner management tables and functions

  1. New Tables
    - `partner_types` - Lookup table for partner categories
    - `partner_firms` - Enhanced with additional fields for partner management
    - `partner_offerings` - Services/packages offered by partners
    - `partner_testimonials` - Client testimonials for partners
    - `partner_metrics` - Performance tracking for partners

  2. Security
    - Enable RLS on all tables
    - Add policies for super admins to manage all partner data
    - Add policies for regular users to view approved partner data
*/

-- Create partner_types lookup table
CREATE TABLE IF NOT EXISTS partner_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE partner_types ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins
CREATE POLICY "Super admins can manage partner types"
  ON partner_types
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'super_admin');

-- Create policy for regular users to view
CREATE POLICY "Users can view partner types"
  ON partner_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_partner_types_updated_at
  BEFORE UPDATE ON partner_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default partner types
INSERT INTO partner_types (name, description)
VALUES 
  ('law_firm', 'Legal services and executor services'),
  ('insurance_company', 'Insurance and financial protection services'),
  ('funeral_provider', 'Funeral planning and services'),
  ('financial_advisor', 'Financial planning and wealth management'),
  ('estate_planner', 'Specialized estate planning services')
ON CONFLICT (name) DO NOTHING;

-- Enhance partner_firms table with additional fields
ALTER TABLE partner_firms
ADD COLUMN IF NOT EXISTS type_id uuid REFERENCES partner_types(id),
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS service_areas text[],
ADD COLUMN IF NOT EXISTS online_consultation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb;

-- Create partner_offerings table
CREATE TABLE IF NOT EXISTS partner_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partner_firms(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_range text,
  is_featured boolean DEFAULT false,
  active boolean DEFAULT true,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE partner_offerings ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins
CREATE POLICY "Super admins can manage partner offerings"
  ON partner_offerings
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'super_admin');

-- Create policy for regular users to view active offerings
CREATE POLICY "Users can view active partner offerings"
  ON partner_offerings
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Create updated_at trigger
CREATE TRIGGER update_partner_offerings_updated_at
  BEFORE UPDATE ON partner_offerings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create partner_testimonials table
CREATE TABLE IF NOT EXISTS partner_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partner_firms(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  testimonial text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE partner_testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins
CREATE POLICY "Super admins can manage partner testimonials"
  ON partner_testimonials
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'super_admin');

-- Create policy for regular users to view approved testimonials
CREATE POLICY "Users can view approved partner testimonials"
  ON partner_testimonials
  FOR SELECT
  TO authenticated
  USING (approved = true);

-- Create updated_at trigger
CREATE TRIGGER update_partner_testimonials_updated_at
  BEFORE UPDATE ON partner_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create partner_metrics table
CREATE TABLE IF NOT EXISTS partner_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES partner_firms(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, metric_date)
);

-- Enable RLS
ALTER TABLE partner_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins
CREATE POLICY "Super admins can manage partner metrics"
  ON partner_metrics
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'super_admin');

-- Create updated_at trigger
CREATE TRIGGER update_partner_metrics_updated_at
  BEFORE UPDATE ON partner_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to track partner views
CREATE OR REPLACE FUNCTION track_partner_view(partner_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today date := current_date;
BEGIN
  -- Insert or update metrics for today
  INSERT INTO partner_metrics (partner_id, metric_date, views)
  VALUES (partner_uuid, today, 1)
  ON CONFLICT (partner_id, metric_date)
  DO UPDATE SET
    views = partner_metrics.views + 1,
    updated_at = now();
END;
$$;

-- Create function to track partner clicks
CREATE OR REPLACE FUNCTION track_partner_click(partner_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today date := current_date;
BEGIN
  -- Insert or update metrics for today
  INSERT INTO partner_metrics (partner_id, metric_date, clicks)
  VALUES (partner_uuid, today, 1)
  ON CONFLICT (partner_id, metric_date)
  DO UPDATE SET
    clicks = partner_metrics.clicks + 1,
    updated_at = now();
END;
$$;

-- Create function to track partner conversions
CREATE OR REPLACE FUNCTION track_partner_conversion(partner_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today date := current_date;
BEGIN
  -- Insert or update metrics for today
  INSERT INTO partner_metrics (partner_id, metric_date, conversions)
  VALUES (partner_uuid, today, 1)
  ON CONFLICT (partner_id, metric_date)
  DO UPDATE SET
    conversions = partner_metrics.conversions + 1,
    updated_at = now();
END;
$$;

-- Create function to get partner metrics summary
CREATE OR REPLACE FUNCTION get_partner_metrics_summary(partner_uuid uuid, days_back integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  is_admin boolean;
BEGIN
  -- Check if caller is a super admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RETURN '{}'::jsonb;
  END IF;

  SELECT jsonb_build_object(
    'total_views', COALESCE(SUM(views), 0),
    'total_clicks', COALESCE(SUM(clicks), 0),
    'total_conversions', COALESCE(SUM(conversions), 0),
    'click_through_rate', CASE 
      WHEN COALESCE(SUM(views), 0) = 0 THEN 0
      ELSE ROUND((COALESCE(SUM(clicks), 0)::numeric / COALESCE(SUM(views), 1)::numeric) * 100, 2)
    END,
    'conversion_rate', CASE 
      WHEN COALESCE(SUM(clicks), 0) = 0 THEN 0
      ELSE ROUND((COALESCE(SUM(conversions), 0)::numeric / COALESCE(SUM(clicks), 1)::numeric) * 100, 2)
    END,
    'daily_metrics', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', metric_date,
          'views', views,
          'clicks', clicks,
          'conversions', conversions
        )
        ORDER BY metric_date DESC
      )
      FROM partner_metrics
      WHERE partner_id = partner_uuid
      AND metric_date >= (current_date - (days_back || ' days')::interval)
    )
  ) INTO result
  FROM partner_metrics
  WHERE partner_id = partner_uuid
  AND metric_date >= (current_date - (days_back || ' days')::interval);
  
  RETURN result;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in get_partner_metrics_summary: %', SQLERRM;
    RETURN '{}'::jsonb;
END;
$$;