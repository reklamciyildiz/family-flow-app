-- Allow authenticated users to SELECT families (needed for return=representation after insert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'families' AND policyname = 'Authenticated can view families'
  ) THEN
    CREATE POLICY "Authenticated can view families"
      ON public.families FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;