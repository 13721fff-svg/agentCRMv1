/*
  # Initial AgentCRM Database Schema
  
  ## Overview
  This migration creates the foundational database structure for the AgentCRM platform,
  which serves as a unified CRM + Connector system for individual entrepreneurs,
  small and medium businesses, and end users.

  ## 1. New Tables

  ### users (extends auth.users)
    - `id` (uuid, primary key, references auth.users)
    - `email` (text, unique, not null)
    - `phone` (text)
    - `full_name` (text, not null)
    - `role` (text, not null) - citizen/individual/small/medium/admin
    - `avatar_url` (text)
    - `rating` (numeric) - average rating from reviews
    - `org_id` (uuid) - current organization
    - `org_role` (text) - owner/admin/manager/staff/viewer
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### organizations
    - `id` (uuid, primary key)
    - `name` (text, not null)
    - `description` (text)
    - `logo_url` (text)
    - `business_type` (text, not null) - individual/small/medium
    - `owner_id` (uuid, references users)
    - `rating` (numeric)
    - `verified` (boolean, default false)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### clients
    - `id` (uuid, primary key)
    - `org_id` (uuid, references organizations)
    - `full_name` (text, not null)
    - `email` (text)
    - `phone` (text)
    - `address` (text)
    - `notes` (text)
    - `tags` (text[])
    - `rating` (numeric)
    - `created_by` (uuid, references users)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### orders
    - `id` (uuid, primary key)
    - `org_id` (uuid, references organizations)
    - `client_id` (uuid, references clients)
    - `title` (text, not null)
    - `description` (text)
    - `status` (text, not null) - draft/pending/confirmed/in_progress/completed/cancelled
    - `amount` (numeric)
    - `currency` (text, default 'UAH')
    - `assigned_to` (uuid, references users)
    - `due_date` (timestamptz)
    - `completed_at` (timestamptz)
    - `created_by` (uuid, references users)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### categories
    - `id` (uuid, primary key)
    - `name` (text, not null)
    - `name_uk` (text, not null)
    - `icon` (text)
    - `parent_id` (uuid, references categories)
    - `created_at` (timestamptz)

  ### requests
    - `id` (uuid, primary key)
    - `user_id` (uuid, references users)
    - `category_id` (uuid, references categories)
    - `title` (text, not null)
    - `description` (text, not null)
    - `budget_min` (numeric)
    - `budget_max` (numeric)
    - `location` (text)
    - `status` (text, not null) - open/quoted/accepted/rejected/expired
    - `expires_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### quotes
    - `id` (uuid, primary key)
    - `request_id` (uuid, references requests)
    - `provider_id` (uuid, references users)
    - `amount` (numeric, not null)
    - `currency` (text, default 'UAH')
    - `description` (text, not null)
    - `status` (text, not null) - pending/accepted/rejected
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### campaigns
    - `id` (uuid, primary key)
    - `org_id` (uuid, references organizations)
    - `title` (text, not null)
    - `description` (text)
    - `type` (text, not null) - push/email/sms/banner
    - `status` (text, not null) - draft/scheduled/active/paused/completed
    - `target_audience` (jsonb)
    - `start_date` (timestamptz)
    - `end_date` (timestamptz)
    - `metrics` (jsonb)
    - `created_by` (uuid, references users)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### tasks
    - `id` (uuid, primary key)
    - `org_id` (uuid, references organizations)
    - `title` (text, not null)
    - `description` (text)
    - `status` (text, not null) - pending/in_progress/completed/cancelled
    - `priority` (text, not null) - low/medium/high/urgent
    - `assigned_to` (uuid, references users)
    - `due_date` (timestamptz)
    - `completed_at` (timestamptz)
    - `created_by` (uuid, references users)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### meetings
    - `id` (uuid, primary key)
    - `org_id` (uuid, references organizations)
    - `title` (text, not null)
    - `description` (text)
    - `client_id` (uuid, references clients)
    - `location` (text)
    - `start_time` (timestamptz, not null)
    - `end_time` (timestamptz, not null)
    - `participants` (uuid[])
    - `notes` (text)
    - `created_by` (uuid, references users)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### kpis
    - `id` (uuid, primary key)
    - `org_id` (uuid, references organizations)
    - `name` (text, not null)
    - `description` (text)
    - `metric_type` (text, not null) - count/amount/percentage
    - `target_value` (numeric, not null)
    - `current_value` (numeric, default 0)
    - `period` (text, not null) - daily/weekly/monthly/yearly
    - `assigned_to` (uuid, references users)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### reviews
    - `id` (uuid, primary key)
    - `order_id` (uuid, references orders)
    - `from_user_id` (uuid, references users)
    - `to_user_id` (uuid, references users)
    - `rating` (integer, not null, check between 1-5)
    - `comment` (text)
    - `created_at` (timestamptz)

  ## 2. Security
    - Enable RLS on all tables
    - Add authentication-based policies
    - Ensure users can only access data they own or are authorized to see
    - Organization-based access control for business features

  ## 3. Important Notes
    - All tables use UUID primary keys
    - Timestamps use `timestamptz` for timezone awareness
    - Default values set where appropriate
    - Foreign key constraints ensure referential integrity
    - RLS policies enforce data access security
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone text,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'individual', 'small', 'medium', 'admin')),
  avatar_url text,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  org_id uuid,
  org_role text CHECK (org_role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  logo_url text,
  business_type text NOT NULL CHECK (business_type IN ('individual', 'small', 'medium')),
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for org_id in users
ALTER TABLE users ADD CONSTRAINT users_org_id_fkey 
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_uk text NOT NULL,
  icon text,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  notes text,
  tags text[],
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  amount numeric CHECK (amount >= 0),
  currency text DEFAULT 'UAH',
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  due_date timestamptz,
  completed_at timestamptz,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id),
  title text NOT NULL,
  description text NOT NULL,
  budget_min numeric CHECK (budget_min >= 0),
  budget_max numeric CHECK (budget_max >= 0),
  location text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'quoted', 'accepted', 'rejected', 'expired')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'UAH',
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('push', 'email', 'sms', 'banner')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  target_audience jsonb,
  start_date timestamptz,
  end_date timestamptz,
  metrics jsonb,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  due_date timestamptz,
  completed_at timestamptz,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  location text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  participants uuid[],
  notes text,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- KPIs table
CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  metric_type text NOT NULL CHECK (metric_type IN ('count', 'amount', 'percentage')),
  target_value numeric NOT NULL,
  current_value numeric DEFAULT 0,
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for organizations
CREATE POLICY "Organization members can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT org_id FROM users WHERE id = auth.uid())
    OR owner_id = auth.uid()
  );

CREATE POLICY "Organization owners can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for clients
CREATE POLICY "Organization members can view their clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Organization members can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for orders
CREATE POLICY "Organization members can view their orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Organization members can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for requests
CREATE POLICY "Users can view all open requests"
  ON requests FOR SELECT
  TO authenticated
  USING (status = 'open' OR user_id = auth.uid());

CREATE POLICY "Users can create their own requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for quotes
CREATE POLICY "Users can view quotes for their requests"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    request_id IN (SELECT id FROM requests WHERE user_id = auth.uid())
    OR provider_id = auth.uid()
  );

CREATE POLICY "Providers can create quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

-- RLS Policies for campaigns
CREATE POLICY "Organization members can view their campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Organization members can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for tasks
CREATE POLICY "Organization members can view their tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Organization members can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for meetings
CREATE POLICY "Organization members can view their meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Organization members can update meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for KPIs
CREATE POLICY "Organization members can view their KPIs"
  ON kpis FOR SELECT
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can create KPIs"
  ON kpis FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Organization members can update KPIs"
  ON kpis FOR UPDATE
  TO authenticated
  USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

-- RLS Policies for reviews
CREATE POLICY "Users can view reviews about them"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    to_user_id = auth.uid() OR from_user_id = auth.uid()
  );

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_org_id ON orders(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_quotes_request_id ON quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_meetings_org_id ON meetings(org_id);
CREATE INDEX IF NOT EXISTS idx_kpis_org_id ON kpis(org_id);
CREATE INDEX IF NOT EXISTS idx_reviews_to_user_id ON reviews(to_user_id);
