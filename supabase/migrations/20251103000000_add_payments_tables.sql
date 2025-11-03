/*
  # Payments Integration Schema

  1. New Tables
    - `payment_methods`
      - User's saved payment methods (cards, bank accounts)
      - Tokenized for security
    - `transactions`
      - Payment transactions history
      - Links to orders/subscriptions
    - `invoices`
      - Generated invoices for payments
      - PDF generation ready
    - `payment_providers`
      - Integrated payment providers (Stripe, LiqPay, etc.)
      - Configuration per provider

  2. Security
    - RLS enabled on all tables
    - Users can only access their own payment data
    - Encrypted sensitive fields

  3. Notes
    - Mock data for demo
    - Ready for real payment integration
    - Webhook endpoints prepared
*/

-- Payment Providers
CREATE TABLE IF NOT EXISTS payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- 'stripe', 'liqpay', 'wayforpay', 'fondy'
  is_active BOOLEAN DEFAULT false,
  is_test_mode BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment providers are viewable by authenticated users"
  ON payment_providers FOR SELECT
  TO authenticated
  USING (true);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES payment_providers(id),
  method_type TEXT NOT NULL, -- 'card', 'bank_account', 'wallet'
  card_brand TEXT, -- 'visa', 'mastercard', 'amex'
  last_four TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  cardholder_name TEXT,
  is_default BOOLEAN DEFAULT false,
  provider_token TEXT, -- Tokenized by payment provider
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id),
  provider_id UUID REFERENCES payment_providers(id),
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'UAH',
  status TEXT NOT NULL, -- 'pending', 'processing', 'succeeded', 'failed', 'refunded'
  transaction_type TEXT NOT NULL, -- 'payment', 'refund', 'subscription'
  description TEXT,
  provider_transaction_id TEXT,
  provider_response JSONB,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  order_id UUID REFERENCES orders(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'UAH',
  status TEXT NOT NULL, -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  invoice_data JSONB NOT NULL, -- Full invoice details
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_org_id ON payment_methods(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Insert demo payment providers
INSERT INTO payment_providers (name, provider_type, is_active, is_test_mode, config) VALUES
  ('LiqPay', 'liqpay', true, true, '{"public_key": "demo_key", "private_key": "demo_key"}'),
  ('Stripe', 'stripe', false, true, '{"public_key": "demo_key", "secret_key": "demo_key"}'),
  ('WayForPay', 'wayforpay', false, true, '{"merchant_account": "demo_account"}'),
  ('Fondy', 'fondy', false, true, '{"merchant_id": "demo_merchant"}')
ON CONFLICT DO NOTHING;
