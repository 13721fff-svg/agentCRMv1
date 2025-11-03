/*
  # Add Subscription System

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text) - Plan name (Individual, Small, Medium)
      - `price_monthly` (numeric) - Monthly price
      - `price_yearly` (numeric) - Yearly price
      - `max_clients` (integer) - Max number of clients
      - `max_team_members` (integer) - Max team size
      - `max_orders_per_month` (integer) - Max orders
      - `features` (jsonb) - Feature flags
      - `created_at` (timestamp)

    - `subscriptions`
      - `id` (uuid, primary key)
      - `org_id` (uuid, foreign key)
      - `plan_id` (uuid, foreign key)
      - `status` (text) - active, cancelled, expired, trial
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `trial_end` (timestamp)
      - `cancelled_at` (timestamp)
      - `created_at` (timestamp)

    - `subscription_usage`
      - `id` (uuid, primary key)
      - `org_id` (uuid, foreign key)
      - `period_start` (timestamp)
      - `period_end` (timestamp)
      - `clients_count` (integer)
      - `team_members_count` (integer)
      - `orders_count` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price_monthly numeric(10, 2) NOT NULL DEFAULT 0,
  price_yearly numeric(10, 2) NOT NULL DEFAULT 0,
  max_clients integer NOT NULL DEFAULT 0,
  max_team_members integer NOT NULL DEFAULT 1,
  max_orders_per_month integer NOT NULL DEFAULT 0,
  features jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  trial_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  clients_count integer DEFAULT 0,
  team_members_count integer DEFAULT 0,
  orders_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own org subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view own org usage"
  ON subscription_usage FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );

INSERT INTO subscription_plans (name, price_monthly, price_yearly, max_clients, max_team_members, max_orders_per_month, features) VALUES
  ('Individual', 299, 2990, 50, 1, 100, '{"analytics": true, "campaigns": false, "team": false, "api": false}'),
  ('Small', 799, 7990, 200, 10, 500, '{"analytics": true, "campaigns": true, "team": true, "api": false}'),
  ('Medium', 1999, 19990, 1000, 50, 2000, '{"analytics": true, "campaigns": true, "team": true, "api": true}');
