-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view profiles in their family" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their family" ON public.families;
DROP POLICY IF EXISTS "Users can update their family" ON public.families;
DROP POLICY IF EXISTS "Users can view tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their family" ON public.tasks;
DROP POLICY IF EXISTS "Users can view comments on their family tasks" ON public.task_comments;
DROP POLICY IF EXISTS "Users can create comments on their family tasks" ON public.task_comments;
DROP POLICY IF EXISTS "Users can view badges in their family" ON public.badges;
DROP POLICY IF EXISTS "Users can view activities in their family" ON public.activities;
DROP POLICY IF EXISTS "Users can create activities in their family" ON public.activities;

-- Create security definer function to get user's family_id
CREATE OR REPLACE FUNCTION public.get_user_family_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.profiles WHERE id = _user_id;
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view profiles in their family"
  ON public.profiles FOR SELECT
  USING (
    family_id = public.get_user_family_id(auth.uid())
    OR id = auth.uid()
  );

CREATE POLICY "Users can view their family"
  ON public.families FOR SELECT
  USING (id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can update their family"
  ON public.families FOR UPDATE
  USING (id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can view tasks in their family"
  ON public.tasks FOR SELECT
  USING (family_id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can create tasks in their family"
  ON public.tasks FOR INSERT
  WITH CHECK (family_id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can update tasks in their family"
  ON public.tasks FOR UPDATE
  USING (family_id = public.get_user_family_id(auth.uid()));

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

CREATE POLICY "Users can view badges in their family"
  ON public.badges FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE family_id = public.get_user_family_id(auth.uid())
    )
  );

CREATE POLICY "Users can view activities in their family"
  ON public.activities FOR SELECT
  USING (family_id = public.get_user_family_id(auth.uid()));

CREATE POLICY "Users can create activities in their family"
  ON public.activities FOR INSERT
  WITH CHECK (family_id = public.get_user_family_id(auth.uid()));