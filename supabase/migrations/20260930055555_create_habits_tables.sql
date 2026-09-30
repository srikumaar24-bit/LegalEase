/*
# Create habits and habit_completions tables (single-tenant, no auth)

## Overview
This migration creates the core tables for a habit tracker app called "Momentum".
The app does not require sign-in, so data is intentionally public/shared (single-tenant).
All policies allow both anon and authenticated roles to perform full CRUD.

## New Tables

### habits
- `id` (uuid, primary key)
- `name` (text, not null)
- `description` (text, nullable)
- `color` (text, not null, default 'emerald')
- `icon` (text, not null, default 'check')
- `target_days_per_week` (int, not null, default 7)
- `created_at` (timestamptz, default now())
- `archived` (boolean, not null, default false)

### habit_completions
- `id` (uuid, primary key)
- `habit_id` (uuid, foreign key → habits.id ON DELETE CASCADE)
- `completed_date` (date, not null)
- `created_at` (timestamptz, default now())
- Unique constraint on (habit_id, completed_date)

## Security
- RLS enabled on both tables.
- All CRUD policies use TO anon, authenticated with USING (true) / WITH CHECK (true) — single-tenant, no auth.

## Important Notes
1. Unique constraint on (habit_id, completed_date) ensures one completion per habit per day.
2. completed_date is DATE type (not timestamptz) so completions are keyed by calendar day.
3. CASCADE on habit_id foreign key means deleting a habit also deletes its completion history.
*/

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT 'emerald',
  icon text NOT NULL DEFAULT 'check',
  target_days_per_week int NOT NULL DEFAULT 7 CHECK (target_days_per_week >= 1 AND target_days_per_week <= 7),
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_habits" ON habits;
CREATE POLICY "anon_select_habits" ON habits FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_habits" ON habits;
CREATE POLICY "anon_insert_habits" ON habits FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_habits" ON habits;
CREATE POLICY "anon_update_habits" ON habits FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_habits" ON habits;
CREATE POLICY "anon_delete_habits" ON habits FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, completed_date)
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_completions" ON habit_completions;
CREATE POLICY "anon_select_completions" ON habit_completions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_completions" ON habit_completions;
CREATE POLICY "anon_insert_completions" ON habit_completions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_completions" ON habit_completions;
CREATE POLICY "anon_update_completions" ON habit_completions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_completions" ON habit_completions;
CREATE POLICY "anon_delete_completions" ON habit_completions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completed_date);
CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived);
