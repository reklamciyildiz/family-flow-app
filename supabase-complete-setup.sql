-- ============================================
-- FAMILIAL FLOW APP - COMPLETE DATABASE SETUP
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de tek seferde çalıştırabilirsiniz
-- Tüm migration'lar birleştirilmiş haldedir
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Families table
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  family_id UUID REFERENCES public.families ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'other',
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  repeat_type TEXT DEFAULT 'none',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  points INTEGER DEFAULT 10,
  assigned_to UUID[] NOT NULL DEFAULT '{}',
  completed_by UUID REFERENCES public.profiles ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (for logging)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  task_id UUID REFERENCES public.tasks ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Function to get user's family_id (used in RLS policies)
CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.profiles WHERE id = _user_id;
$$;

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for automatic profile creation on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS POLICIES - FAMILIES
-- ============================================

DROP POLICY IF EXISTS "Users can view their family" ON public.families;
DROP POLICY IF EXISTS "Users can create families" ON public.families;
DROP POLICY IF EXISTS "Anyone can create families" ON public.families;
DROP POLICY IF EXISTS "Users can update their family" ON public.families;
DROP POLICY IF EXISTS "Authenticated can view families" ON public.families;

CREATE POLICY "Users can view their family"
  ON public.families FOR SELECT
  USING (id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Anyone can create families"
  ON public.families FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their family"
  ON public.families FOR UPDATE
  USING (id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Authenticated can view families"
  ON public.families FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can view profiles in their family" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles in their family"
  ON public.profiles FOR SELECT
  USING (
    family_id = public.get_user_family_id(auth.uid())
    OR id = auth.uid()
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- RLS POLICIES - TASKS
-- ============================================

DROP POLICY IF EXISTS "Users can view tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view tasks in their family"
  ON public.tasks FOR SELECT
  USING (family_id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can create tasks in their family"
  ON public.tasks FOR INSERT
  WITH CHECK (family_id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can update tasks in their family"
  ON public.tasks FOR UPDATE
  USING (family_id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (created_by = auth.uid());

-- ============================================
-- RLS POLICIES - TASK_COMMENTS
-- ============================================

DROP POLICY IF EXISTS "Users can view comments on their family tasks" ON public.task_comments;
DROP POLICY IF EXISTS "Users can create comments on their family tasks" ON public.task_comments;

CREATE POLICY "Users can view comments on their family tasks"
  ON public.task_comments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE family_id = public.get_user_family_id(auth.uid())
    )
  );

CREATE POLICY "Users can create comments on their family tasks"
  ON public.task_comments FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE family_id = public.get_user_family_id(auth.uid())
    )
  );

-- ============================================
-- RLS POLICIES - BADGES
-- ============================================

DROP POLICY IF EXISTS "Users can view badges in their family" ON public.badges;
DROP POLICY IF EXISTS "System can insert badges" ON public.badges;

CREATE POLICY "Users can view badges in their family"
  ON public.badges FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE family_id = public.get_user_family_id(auth.uid())
    )
  );

CREATE POLICY "System can insert badges"
  ON public.badges FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES - ACTIVITIES
-- ============================================

DROP POLICY IF EXISTS "Users can view activities in their family" ON public.activities;
DROP POLICY IF EXISTS "Users can create activities in their family" ON public.activities;

CREATE POLICY "Users can view activities in their family"
  ON public.activities FOR SELECT
  USING (family_id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can create activities in their family"
  ON public.activities FOR INSERT
  WITH CHECK (family_id = public.get_user_family_id(auth.uid()));

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.families;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Şimdi Table Editor'de tabloları kontrol edin
-- families, profiles, tasks, task_comments, badges, activities
-- ============================================

