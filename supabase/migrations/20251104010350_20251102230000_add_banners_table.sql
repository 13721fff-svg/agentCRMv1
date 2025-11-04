/*
  # Add Banners Table

  1. New Tables
    - `banners`
      - `id` (uuid, primary key)
      - `org_id` (uuid, foreign key to organizations)
      - `title` (text)
      - `description` (text, optional)
      - `image_url` (text, optional)
      - `link` (text, optional)
      - `is_active` (boolean)
      - `views` (integer, default 0)
      - `clicks` (integer, default 0)
      - `start_date` (timestamptz, optional)
      - `end_date` (timestamptz, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `banners` table
    - Add policies for authenticated users to manage their org's banners
*/

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  link text,
  is_active boolean DEFAULT true,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active banners"
  ON banners FOR SELECT
  TO authenticated
  USING (is_active = true OR org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create banners for their org"
  ON banners FOR INSERT
  TO authenticated
  WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their org banners"
  ON banners FOR UPDATE
  TO authenticated
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their org banners"
  ON banners FOR DELETE
  TO authenticated
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_banners_org_id ON banners(org_id);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
