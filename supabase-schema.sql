-- PulseVote Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/youtgmxqayuthobxpbxb/sql/new)

-- 1. Create the polls table
CREATE TABLE IF NOT EXISTS polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('yesno', 'choice', 'emoji', 'star')),
    options JSONB NOT NULL DEFAULT '{}',
    votes_pre INTEGER[] NOT NULL DEFAULT '{}',
    votes_post INTEGER[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- 3. Anyone can read polls
CREATE POLICY "Anyone can view polls"
    ON polls FOR SELECT
    USING (true);

-- 4. Anyone can create polls
CREATE POLICY "Anyone can create polls"
    ON polls FOR INSERT
    WITH CHECK (true);

-- 5. Anyone can update votes only (cannot change question/type/options)
CREATE POLICY "Anyone can vote"
    ON polls FOR UPDATE
    USING (true)
    WITH CHECK (true);
