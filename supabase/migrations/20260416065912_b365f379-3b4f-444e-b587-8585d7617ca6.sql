
-- Assign headmaster role to existing user
INSERT INTO public.user_roles (user_id, role)
VALUES ('6e97e71d-c2ed-4245-8ce6-2bff2ebb7487', 'headmaster')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update profile display name
UPDATE public.profiles
SET display_name = 'Dr. Kwame Asante', school_name = 'Achimota School'
WHERE user_id = '6e97e71d-c2ed-4245-8ce6-2bff2ebb7487';
