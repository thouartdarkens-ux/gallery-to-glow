-- Remove the rank column as it will be calculated dynamically based on points
ALTER TABLE public.users DROP COLUMN rank;