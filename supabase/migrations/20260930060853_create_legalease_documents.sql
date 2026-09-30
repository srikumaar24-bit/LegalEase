/*
# Create LegalEase document workspace storage

## Overview
Creates a single-tenant document library for the LegalEase web app. The app does not include sign-in, so drafts are intentionally shared within this provisioned workspace and available to the anon client.

## New table: legal_documents
- `id` (uuid, primary key) — stable document identifier.
- `title` (text, required) — human-readable document title.
- `document_type` (text, required) — selected template category.
- `parties` (text, required) — people or organizations in the document.
- `terms` (text, required) — requested terms and clauses.
- `effective_date` (text, nullable) — optional effective date entered by the user.
- `status` (text, required) — draft, review, or ready.
- `content` (text, required) — editable generated document body.
- `created_at` and `updated_at` (timestamptz) — lifecycle timestamps.

## Security
- Row level security is enabled.
- Separate SELECT, INSERT, UPDATE, and DELETE policies allow anon and authenticated roles because this is a no-auth single-tenant workspace.

## Important notes
1. The table stores editable drafts so a generated document survives a page refresh.
2. Deleting a draft is explicit and only removes that selected document.
3. No user identity columns are added because the app does not present a sign-in flow.
*/

CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  document_type text NOT NULL,
  parties text NOT NULL DEFAULT '',
  terms text NOT NULL DEFAULT '',
  effective_date text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'ready')),
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_legal_documents" ON legal_documents;
CREATE POLICY "anon_select_legal_documents" ON legal_documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_legal_documents" ON legal_documents;
CREATE POLICY "anon_insert_legal_documents" ON legal_documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_legal_documents" ON legal_documents;
CREATE POLICY "anon_update_legal_documents" ON legal_documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_legal_documents" ON legal_documents;
CREATE POLICY "anon_delete_legal_documents" ON legal_documents FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_legal_documents_updated_at ON legal_documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_documents_status ON legal_documents(status);
