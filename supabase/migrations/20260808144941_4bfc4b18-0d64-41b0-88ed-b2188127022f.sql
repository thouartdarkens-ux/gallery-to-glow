ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS reopening_date date;

ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS jhs_attended text,
  ADD COLUMN IF NOT EXISTS programme_code text;