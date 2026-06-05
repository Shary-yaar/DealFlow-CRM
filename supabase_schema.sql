-- DealFlow CRM Database Schema
-- Paste and run this SQL script in your Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create the "contacts" table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Create the "deals" table
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    value NUMERIC(12, 2) NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('Lead', 'Qualified', 'Proposal', 'Won', 'Lost')),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Configure Row Level Security (RLS) for Public/No-Auth Access
-- To make this prototype easy to run without Auth, we explicitly disable RLS.
-- This allows direct public client-side CRUD access without JWT tokens.
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;

-- If you prefer keeping RLS enabled, run the following commands to allow anonymous access instead:
/*
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update contacts" ON contacts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete contacts" ON contacts FOR DELETE USING (true);

CREATE POLICY "Allow public read deals" ON deals FOR SELECT USING (true);
CREATE POLICY "Allow public insert deals" ON deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update deals" ON deals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete deals" ON deals FOR DELETE USING (true);
*/
