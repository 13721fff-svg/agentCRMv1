/*
  # Enhance Reviews System

  1. Changes
    - Add order_id to reviews (review can be for order)
    - Add reply functionality
    - Add helpful votes

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS replied_at timestamptz;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]';

CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS reviews_provider_id_idx ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS reviews_order_id_idx ON reviews(order_id);

CREATE POLICY "Users can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    (
      order_id IN (
        SELECT id FROM orders WHERE client_id IN (
          SELECT id FROM clients WHERE org_id IN (
            SELECT org_id FROM users WHERE id = auth.uid()
          )
        )
      )
      OR
      EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'citizen'
      )
    )
  );

CREATE POLICY "Providers can reply to their reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT org_id FROM users WHERE id = auth.uid()
    )
  );
