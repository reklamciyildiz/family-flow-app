-- Add permissive insert policy for both anon and authenticated to unblock creation
DROP POLICY IF EXISTS "Users can create families" ON public.families;
CREATE POLICY "Anyone can create families"
  ON public.families FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);