-- ============ STUDENTS extensions ============
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS residency text NOT NULL DEFAULT 'Day' CHECK (residency IN ('Day','Boarding')),
  ADD COLUMN IF NOT EXISTS is_scholarship boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_free_shs boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_class_level text,
  ADD COLUMN IF NOT EXISTS academic_year text DEFAULT '2025/2026';

-- ============ PARENTS: primary / secondary phones ============
ALTER TABLE public.parents
  ADD COLUMN IF NOT EXISTS phone_primary text,
  ADD COLUMN IF NOT EXISTS phone_secondary_2 text;

-- migrate existing phone -> phone_primary if null
UPDATE public.parents SET phone_primary = phone WHERE phone_primary IS NULL;

-- ============ FEE RECORDS ============
CREATE TABLE IF NOT EXISTS public.fee_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT '2025/2026',
  term text NOT NULL DEFAULT 'Term 1',
  total_fee numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  balance numeric GENERATED ALWAYS AS (total_fee - amount_paid) STORED,
  status text NOT NULL DEFAULT 'owing' CHECK (status IN ('paid','owing','partial','scholarship','free_shs')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year, term)
);

ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view fee records" ON public.fee_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Finance staff can insert fee records" ON public.fee_records
  FOR INSERT TO authenticated WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['bursar','accounts','headmaster','school_admin','school_secretary']::app_role[])
  );

CREATE POLICY "Finance staff can update fee records" ON public.fee_records
  FOR UPDATE TO authenticated USING (
    public.has_any_role(auth.uid(), ARRAY['bursar','accounts','headmaster','school_admin']::app_role[])
  );

CREATE POLICY "Finance staff can delete fee records" ON public.fee_records
  FOR DELETE TO authenticated USING (
    public.has_any_role(auth.uid(), ARRAY['bursar','headmaster','school_admin']::app_role[])
  );

CREATE TRIGGER trg_fee_records_updated
  BEFORE UPDATE ON public.fee_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-mark scholarship / free SHS as paid
CREATE OR REPLACE FUNCTION public.auto_mark_fee_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  _is_scholarship boolean;
  _is_free_shs boolean;
BEGIN
  SELECT is_scholarship, is_free_shs INTO _is_scholarship, _is_free_shs
  FROM public.students WHERE id = NEW.student_id;

  IF _is_scholarship THEN
    NEW.status := 'scholarship';
    NEW.amount_paid := NEW.total_fee;
  ELSIF _is_free_shs THEN
    NEW.status := 'free_shs';
    NEW.amount_paid := NEW.total_fee;
  ELSIF NEW.amount_paid >= NEW.total_fee AND NEW.total_fee > 0 THEN
    NEW.status := 'paid';
  ELSIF NEW.amount_paid > 0 THEN
    NEW.status := 'partial';
  ELSE
    NEW.status := 'owing';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_fee_status
  BEFORE INSERT OR UPDATE ON public.fee_records
  FOR EACH ROW EXECUTE FUNCTION public.auto_mark_fee_status();

-- ============ PAYMENT EVENTS (for SMS triggers on payment) ============
CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_record_id uuid REFERENCES public.fee_records(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  reference text,
  recorded_by uuid,
  sms_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view payment events" ON public.payment_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Finance can insert payment events" ON public.payment_events
  FOR INSERT TO authenticated WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['bursar','accounts','headmaster','school_admin']::app_role[])
  );

CREATE POLICY "Finance can update payment events" ON public.payment_events
  FOR UPDATE TO authenticated USING (
    public.has_any_role(auth.uid(), ARRAY['bursar','accounts','headmaster','school_admin']::app_role[])
  );

-- ============ CONTACT GROUPS ============
CREATE TABLE IF NOT EXISTS public.contact_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'custom' CHECK (type IN ('class','programme','custom','debtors','alumni','pta','staff','boarding','day')),
  is_dynamic boolean NOT NULL DEFAULT false,
  filter_rules jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view groups" ON public.contact_groups
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Marketing/Admin manage groups" ON public.contact_groups
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['marketing','headmaster','school_admin','school_secretary']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['marketing','headmaster','school_admin','school_secretary']::app_role[]));

CREATE TRIGGER trg_contact_groups_updated
  BEFORE UPDATE ON public.contact_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ GROUP MEMBERS ============
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.contact_groups(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  CHECK (student_id IS NOT NULL OR contact_id IS NOT NULL)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view group members" ON public.group_members
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Marketing/Admin manage group members" ON public.group_members
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['marketing','headmaster','school_admin','school_secretary']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['marketing','headmaster','school_admin','school_secretary']::app_role[]));

-- ============ SCHEDULED MESSAGES ============
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message_body text NOT NULL,
  target_type text NOT NULL DEFAULT 'all',
  target_filter jsonb DEFAULT '{}'::jsonb,
  send_at timestamptz NOT NULL,
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none','daily','weekly','biweekly','monthly')),
  next_run_at timestamptz,
  last_run_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','recurring','cancelled','failed')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view scheduled" ON public.scheduled_messages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Marketing/Admin manage scheduled" ON public.scheduled_messages
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['marketing','headmaster','school_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['marketing','headmaster','school_admin']::app_role[]));

CREATE TRIGGER trg_scheduled_messages_updated
  BEFORE UPDATE ON public.scheduled_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ AUTOMATION RULES ============
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('fee_unpaid','payment_received','exam_alert','absentee','result_release')),
  conditions jsonb DEFAULT '{}'::jsonb,
  message_template text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  frequency_days integer DEFAULT 14,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view automations" ON public.automation_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage automations" ON public.automation_rules
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['headmaster','school_admin','marketing']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['headmaster','school_admin','marketing']::app_role[]));

CREATE TRIGGER trg_automation_rules_updated
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed default fee-reminder automation
INSERT INTO public.automation_rules (name, trigger_type, message_template, frequency_days, conditions)
VALUES (
  'Fee Reminder (Bi-weekly)',
  'fee_unpaid',
  'Dear {ParentName}, your ward {StudentName} ({Class}) owes GHS {Balance}. Kindly settle before exams.',
  14,
  '{"min_balance": 1}'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO public.automation_rules (name, trigger_type, message_template, frequency_days, conditions)
VALUES (
  'Payment Confirmation',
  'payment_received',
  'Dear {ParentName}, we confirm receipt of GHS {Amount} for {StudentName}. Outstanding balance: GHS {Balance}. Thank you.',
  0,
  '{}'::jsonb
)
ON CONFLICT DO NOTHING;