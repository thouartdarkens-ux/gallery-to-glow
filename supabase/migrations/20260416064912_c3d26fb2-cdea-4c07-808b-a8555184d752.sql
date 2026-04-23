
-- Update audit_logs policy to use headmaster
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'headmaster'::app_role));

-- Update user_roles admin policy to use headmaster
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'headmaster'::app_role))
WITH CHECK (has_role(auth.uid(), 'headmaster'::app_role));
