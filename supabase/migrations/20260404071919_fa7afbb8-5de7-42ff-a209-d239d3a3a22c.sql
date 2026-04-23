
-- Phase 2 Schema Additions

-- 1. SMS Wallet
CREATE TABLE public.sms_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GHS',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Wallet Transactions
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'debit',
  amount NUMERIC(12,2) NOT NULL,
  balance_before NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_after NUMERIC(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Voice Broadcasts
CREATE TABLE public.voice_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  audio_url TEXT,
  target_type TEXT NOT NULL DEFAULT 'all',
  target_value TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  total_recipients INT DEFAULT 0,
  completed INT DEFAULT 0,
  failed INT DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Add segment column to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'general';

-- 5. Add scheduled_at to campaigns if not exists
-- (already exists from Phase 1)

-- Triggers
CREATE TRIGGER trg_voice_broadcasts_updated_at BEFORE UPDATE ON public.voice_broadcasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.sms_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to sms_wallet" ON public.sms_wallet FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to wallet_transactions" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to voice_broadcasts" ON public.voice_broadcasts FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_created ON public.wallet_transactions(created_at);
CREATE INDEX idx_voice_broadcasts_status ON public.voice_broadcasts(status);
CREATE INDEX idx_contacts_segment ON public.contacts(segment);

-- Seed initial wallet row
INSERT INTO public.sms_wallet (balance) VALUES (0);
