
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'school_admin', 'accounts', 'marketing');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  school_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. user_roles RLS
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 6. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Timestamp trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. Tighten RLS on all existing tables (drop old permissive policies, add auth-based)

-- campaigns
DROP POLICY IF EXISTS "Allow all access to campaigns" ON public.campaigns;
CREATE POLICY "Authenticated users can access campaigns"
  ON public.campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- classes
DROP POLICY IF EXISTS "Allow all access to classes" ON public.classes;
CREATE POLICY "Authenticated users can access classes"
  ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- contacts
DROP POLICY IF EXISTS "Allow all access to contacts" ON public.contacts;
CREATE POLICY "Authenticated users can access contacts"
  ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- messages
DROP POLICY IF EXISTS "Allow all access to messages" ON public.messages;
CREATE POLICY "Authenticated users can access messages"
  ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- parents
DROP POLICY IF EXISTS "Allow all access to parents" ON public.parents;
CREATE POLICY "Authenticated users can access parents"
  ON public.parents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- sms_templates
DROP POLICY IF EXISTS "Allow all access to sms_templates" ON public.sms_templates;
CREATE POLICY "Authenticated users can access sms_templates"
  ON public.sms_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- sms_wallet
DROP POLICY IF EXISTS "Allow all access to sms_wallet" ON public.sms_wallet;
CREATE POLICY "Authenticated users can access sms_wallet"
  ON public.sms_wallet FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- student_tags
DROP POLICY IF EXISTS "Allow all access to student_tags" ON public.student_tags;
CREATE POLICY "Authenticated users can access student_tags"
  ON public.student_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- students
DROP POLICY IF EXISTS "Allow all access to students" ON public.students;
CREATE POLICY "Authenticated users can access students"
  ON public.students FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- voice_broadcasts
DROP POLICY IF EXISTS "Allow all access to voice_broadcasts" ON public.voice_broadcasts;
CREATE POLICY "Authenticated users can access voice_broadcasts"
  ON public.voice_broadcasts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- wallet_transactions
DROP POLICY IF EXISTS "Allow all access to wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Authenticated users can access wallet_transactions"
  ON public.wallet_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
