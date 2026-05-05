/*
  # Create Waitlist Table

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key) - Unique identifier for each waitlist entry
      - `email` (text, unique) - User's email address
      - `created_at` (timestamp) - When the user joined the waitlist
      - `status` (text) - Waitlist status (pending, verified, rejected)
      - `referral_code` (text) - Unique referral code for user
      - `referred_count` (integer) - Number of referrals made
      
  2. Security
    - Enable RLS on `waitlist` table
    - Add policy for public inserts (anyone can join waitlist)
    - Add policy for users to read their own data
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  referral_code text UNIQUE DEFAULT gen_random_uuid()::text,
  referred_count integer DEFAULT 0
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert into waitlist"
  ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own waitlist data"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Public can read waitlist"
  ON waitlist
  FOR SELECT
  TO anon, authenticated
  USING (true);