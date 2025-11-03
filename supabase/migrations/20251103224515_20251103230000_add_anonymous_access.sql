/*
  # Add Anonymous User Access Policies

  ## Overview
  This migration adds RLS policies to allow anonymous (demo) users to access all
  functionality without authentication. This is useful for demo environments.

  ## Changes
  1. Add SELECT policies for anonymous users on all main tables
  2. Add INSERT/UPDATE/DELETE policies for anonymous users (demo mode)
  3. Keep existing authenticated user policies intact

  ## Security Note
  These policies allow full access for anonymous users. In production, you may want
  to restrict this or use a different approach.
*/

-- ============================================================================
-- CLIENTS TABLE - Anonymous Access
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Anonymous users can view all clients'
  ) THEN
    CREATE POLICY "Anonymous users can view all clients"
      ON clients FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Anonymous users can create clients'
  ) THEN
    CREATE POLICY "Anonymous users can create clients"
      ON clients FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Anonymous users can update clients'
  ) THEN
    CREATE POLICY "Anonymous users can update clients"
      ON clients FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Anonymous users can delete clients'
  ) THEN
    CREATE POLICY "Anonymous users can delete clients"
      ON clients FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- TASKS TABLE - Anonymous Access
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tasks' AND policyname = 'Anonymous users can view all tasks'
  ) THEN
    CREATE POLICY "Anonymous users can view all tasks"
      ON tasks FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tasks' AND policyname = 'Anonymous users can create tasks'
  ) THEN
    CREATE POLICY "Anonymous users can create tasks"
      ON tasks FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tasks' AND policyname = 'Anonymous users can update tasks'
  ) THEN
    CREATE POLICY "Anonymous users can update tasks"
      ON tasks FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tasks' AND policyname = 'Anonymous users can delete tasks'
  ) THEN
    CREATE POLICY "Anonymous users can delete tasks"
      ON tasks FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- MEETINGS TABLE - Anonymous Access
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'meetings' AND policyname = 'Anonymous users can view all meetings'
  ) THEN
    CREATE POLICY "Anonymous users can view all meetings"
      ON meetings FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'meetings' AND policyname = 'Anonymous users can create meetings'
  ) THEN
    CREATE POLICY "Anonymous users can create meetings"
      ON meetings FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'meetings' AND policyname = 'Anonymous users can update meetings'
  ) THEN
    CREATE POLICY "Anonymous users can update meetings"
      ON meetings FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'meetings' AND policyname = 'Anonymous users can delete meetings'
  ) THEN
    CREATE POLICY "Anonymous users can delete meetings"
      ON meetings FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- ORDERS TABLE - Anonymous Access
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Anonymous users can view all orders'
  ) THEN
    CREATE POLICY "Anonymous users can view all orders"
      ON orders FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Anonymous users can create orders'
  ) THEN
    CREATE POLICY "Anonymous users can create orders"
      ON orders FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Anonymous users can update orders'
  ) THEN
    CREATE POLICY "Anonymous users can update orders"
      ON orders FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Anonymous users can delete orders'
  ) THEN
    CREATE POLICY "Anonymous users can delete orders"
      ON orders FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- CAMPAIGNS TABLE - Anonymous Access
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'campaigns' AND policyname = 'Anonymous users can view all campaigns'
  ) THEN
    CREATE POLICY "Anonymous users can view all campaigns"
      ON campaigns FOR SELECT
      TO anon
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'campaigns' AND policyname = 'Anonymous users can create campaigns'
  ) THEN
    CREATE POLICY "Anonymous users can create campaigns"
      ON campaigns FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'campaigns' AND policyname = 'Anonymous users can update campaigns'
  ) THEN
    CREATE POLICY "Anonymous users can update campaigns"
      ON campaigns FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'campaigns' AND policyname = 'Anonymous users can delete campaigns'
  ) THEN
    CREATE POLICY "Anonymous users can delete campaigns"
      ON campaigns FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- CATEGORIES TABLE - Anonymous Access (Already public for authenticated)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'categories' AND policyname = 'Anonymous users can view categories'
  ) THEN
    CREATE POLICY "Anonymous users can view categories"
      ON categories FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;
