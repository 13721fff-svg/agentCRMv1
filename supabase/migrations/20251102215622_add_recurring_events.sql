/*
  # Add Recurring Events Support

  1. Changes
    - Add `recurrence_frequency` column to meetings table (none, daily, weekly, monthly)
    - Add `recurrence_end_date` column to specify when recurring events should stop
    - Add `parent_meeting_id` column to track which event is the parent of recurring instances

  2. Notes
    - Recurring events will be generated dynamically or stored as separate records
    - Parent meeting acts as template for recurring instances
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'recurrence_frequency'
  ) THEN
    ALTER TABLE meetings
    ADD COLUMN recurrence_frequency text DEFAULT 'none',
    ADD COLUMN recurrence_end_date timestamptz,
    ADD COLUMN parent_meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE;
  END IF;
END $$;
