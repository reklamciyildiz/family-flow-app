-- Drop and recreate the families INSERT policy to allow any authenticated user to create a family
DROP POLICY IF EXISTS "Users can create families" ON public.families;

CREATE POLICY "Users can create families"
  ON public.families FOR INSERT
  TO authenticated
  WITH CHECK (true);