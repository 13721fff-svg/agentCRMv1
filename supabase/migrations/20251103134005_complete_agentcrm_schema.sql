/*
  # Complete AgentCRM Database Schema - Full Migration
  
  ## Overview
  This migration updates the existing AgentCRM database with all missing features including:
  - Recurring events support for meetings
  - Payment methods, transactions, and invoices
  - Subscription tiers and user subscriptions
  - Enhanced reviews with attachments
  - Marketing banners
  - Audit logging
  - Storage buckets configuration
  
  ## Changes Applied
  
  ### 1. Meetings - Add Recurring Events Support
  - recurrence_frequency (none/daily/weekly/monthly)
  - recurrence_end_date
  - parent_meeting_id (self-reference for recurring instances)
  - status (scheduled/completed/cancelled)
  
  ### 2. Payment Methods Table
  - Stores customer payment methods (card, cash, bank_transfer)
  - Links to organizations
  
  ### 3. Transactions Table
  - Records all payment transactions
  - Links to orders and payment methods
  
  ### 4. Invoices Table
  - Invoice generation and management
  - PDF storage and status tracking
  
  ### 5. Subscription Tiers Table
  - Defines available subscription plans
  - Features and pricing per tier
  
  ### 6. User Subscriptions Table
  - Tracks user subscriptions
  - Auto-renewal and expiration
  
  ### 7. Enhanced Reviews
  - Add attachments support (images, files)
  - Response from provider
  
  ### 8. Marketing Banners Table
  - Banner campaigns
  - Impressions and clicks tracking
  
  ### 9. Audit Log Table
  - Track all important actions
  - User and entity tracking
  
  ## Security
  All tables have RLS enabled with appropriate policies for data access control.
*/

-- ============================================================================
-- 1. MEETINGS: Add Recurring Events Support
-- ============================================================================

DO $$
BEGIN
  -- Add recurrence columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'recurrence_frequency'
  ) THEN
    ALTER TABLE meetings
    ADD COLUMN recurrence_frequency text DEFAULT 'none',
    ADD COLUMN recurrence_end_date timestamptz,
    ADD COLUMN parent_meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE;
  END IF;

  -- Add status column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'status'
  ) THEN
    ALTER TABLE meetings
    ADD COLUMN status text DEFAULT 'scheduled';
  END IF;
END $$;

-- Add check constraints for recurrence
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meetings_recurrence_frequency_check'
  ) THEN
    ALTER TABLE meetings
    ADD CONSTRAINT meetings_recurrence_frequency_check
    CHECK (recurrence_frequency IN ('none', 'daily', 'weekly', 'monthly'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meetings_status_check'
  ) THEN
    ALTER TABLE meetings
    ADD CONSTRAINT meetings_status_check
    CHECK (status IN ('scheduled', 'completed', 'cancelled'));
  END IF;
END $$;

-- ============================================================================
-- 2. PAYMENT METHODS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('card', 'cash', 'bank_transfer', 'other')),
  name text NOT NULL,
  details jsonb,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can view org payment methods'
  ) THEN
    CREATE POLICY "Users can view org payment methods"
      ON payment_methods FOR SELECT
      TO authenticated
      USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Admins can manage payment methods'
  ) THEN
    CREATE POLICY "Admins can manage payment methods"
      ON payment_methods FOR ALL
      TO authenticated
      USING (
        org_id IN (
          SELECT org_id FROM users
          WHERE id = auth.uid()
          AND org_role IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'UAH',
  type text NOT NULL CHECK (type IN ('income', 'expense', 'refund')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description text,
  metadata jsonb,
  processed_at timestamptz,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view org transactions'
  ) THEN
    CREATE POLICY "Users can view org transactions"
      ON transactions FOR SELECT
      TO authenticated
      USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Staff can create transactions'
  ) THEN
    CREATE POLICY "Staff can create transactions"
      ON transactions FOR INSERT
      TO authenticated
      WITH CHECK (
        org_id IN (
          SELECT org_id FROM users WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 4. INVOICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  tax numeric DEFAULT 0 CHECK (tax >= 0),
  total numeric NOT NULL CHECK (total >= 0),
  currency text DEFAULT 'UAH',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled', 'overdue')),
  due_date timestamptz,
  paid_at timestamptz,
  pdf_url text,
  notes text,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, invoice_number)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Users can view org invoices'
  ) THEN
    CREATE POLICY "Users can view org invoices"
      ON invoices FOR SELECT
      TO authenticated
      USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Staff can manage invoices'
  ) THEN
    CREATE POLICY "Staff can manage invoices"
      ON invoices FOR ALL
      TO authenticated
      USING (
        org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
      );
  END IF;
END $$;

-- ============================================================================
-- 5. SUBSCRIPTION TIERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  price_monthly numeric NOT NULL CHECK (price_monthly >= 0),
  price_yearly numeric NOT NULL CHECK (price_yearly >= 0),
  features jsonb DEFAULT '[]'::jsonb,
  limits jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- RLS for subscription_tiers (public read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscription_tiers' AND policyname = 'Anyone can view subscription tiers'
  ) THEN
    CREATE POLICY "Anyone can view subscription tiers"
      ON subscription_tiers FOR SELECT
      TO authenticated
      USING (is_active = true);
  END IF;
END $$;

-- ============================================================================
-- 6. USER SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES subscription_tiers(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS for user_subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can view own subscriptions'
  ) THEN
    CREATE POLICY "Users can view own subscriptions"
      ON user_subscriptions FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- 7. ENHANCED REVIEWS - Add attachments
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'attachments'
  ) THEN
    ALTER TABLE reviews
    ADD COLUMN attachments text[],
    ADD COLUMN response text,
    ADD COLUMN responded_at timestamptz;
  END IF;
END $$;

-- ============================================================================
-- 8. MARKETING BANNERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketing_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  link_url text,
  type text DEFAULT 'promotion' CHECK (type IN ('promotion', 'announcement', 'event', 'offer')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date timestamptz,
  end_date timestamptz,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  target_audience jsonb,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_banners ENABLE ROW LEVEL SECURITY;

-- RLS for marketing_banners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'marketing_banners' AND policyname = 'Users can view org banners'
  ) THEN
    CREATE POLICY "Users can view org banners"
      ON marketing_banners FOR SELECT
      TO authenticated
      USING (
        org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
        OR status = 'active'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'marketing_banners' AND policyname = 'Staff can manage banners'
  ) THEN
    CREATE POLICY "Staff can manage banners"
      ON marketing_banners FOR ALL
      TO authenticated
      USING (
        org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
      );
  END IF;
END $$;

-- ============================================================================
-- 9. AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS for audit_log
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_log' AND policyname = 'Admins can view org audit log'
  ) THEN
    CREATE POLICY "Admins can view org audit log"
      ON audit_log FOR SELECT
      TO authenticated
      USING (
        org_id IN (
          SELECT org_id FROM users
          WHERE id = auth.uid()
          AND org_role IN ('owner', 'admin')
        )
      );
  END IF;
END $$;

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS audit_log_org_id_created_at_idx ON audit_log(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log(entity_type, entity_id);

-- ============================================================================
-- 10. STORAGE BUCKETS (Configuration)
-- ============================================================================

-- Note: Storage buckets are created via Supabase API/Dashboard
-- This section documents the required buckets:
-- 
-- Bucket: avatars
--   - Purpose: User and organization avatars
--   - Public: true
--   - Allowed MIME types: image/*
--   - Max file size: 2MB
--
-- Bucket: documents
--   - Purpose: Invoices, contracts, attachments
--   - Public: false
--   - Allowed MIME types: application/pdf, image/*, application/msword, etc.
--   - Max file size: 10MB
--
-- Bucket: marketing
--   - Purpose: Banner images, campaign assets
--   - Public: true
--   - Allowed MIME types: image/*, video/*
--   - Max file size: 5MB

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Meetings indexes
CREATE INDEX IF NOT EXISTS meetings_org_id_start_time_idx ON meetings(org_id, start_time);
CREATE INDEX IF NOT EXISTS meetings_parent_meeting_id_idx ON meetings(parent_meeting_id);
CREATE INDEX IF NOT EXISTS meetings_status_idx ON meetings(status);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS transactions_org_id_created_at_idx ON transactions(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_order_id_idx ON transactions(order_id);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS invoices_org_id_created_at_idx ON invoices(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);

-- Marketing banners indexes
CREATE INDEX IF NOT EXISTS marketing_banners_org_id_idx ON marketing_banners(org_id);
CREATE INDEX IF NOT EXISTS marketing_banners_status_idx ON marketing_banners(status);

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Tables Created/Updated:
-- ✅ meetings (+ recurring events support)
-- ✅ payment_methods
-- ✅ transactions  
-- ✅ invoices
-- ✅ subscription_tiers
-- ✅ user_subscriptions
-- ✅ reviews (+ attachments)
-- ✅ marketing_banners
-- ✅ audit_log
--
-- Security: All tables have RLS enabled with appropriate policies
-- Performance: Indexes added for common query patterns
-- Maintenance: Automatic updated_at triggers
