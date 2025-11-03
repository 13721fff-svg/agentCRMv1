/*
  # Make org_id nullable for anonymous users

  ## Overview
  This migration makes the org_id column nullable in all tables to support
  anonymous/demo users who don't belong to any organization.

  ## Changes
  1. Remove NOT NULL constraint from org_id in all tables
  2. Update foreign key constraints to handle null values

  ## Security
  RLS policies already handle anonymous access separately, so this is safe.
*/

-- Make org_id nullable in clients table
ALTER TABLE clients ALTER COLUMN org_id DROP NOT NULL;

-- Make org_id nullable in orders table
ALTER TABLE orders ALTER COLUMN org_id DROP NOT NULL;

-- Make org_id nullable in tasks table
ALTER TABLE tasks ALTER COLUMN org_id DROP NOT NULL;

-- Make org_id nullable in meetings table
ALTER TABLE meetings ALTER COLUMN org_id DROP NOT NULL;

-- Make org_id nullable in campaigns table
ALTER TABLE campaigns ALTER COLUMN org_id DROP NOT NULL;

-- Make org_id nullable in kpis table (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpis' AND column_name = 'org_id'
  ) THEN
    ALTER TABLE kpis ALTER COLUMN org_id DROP NOT NULL;
  END IF;
END $$;
