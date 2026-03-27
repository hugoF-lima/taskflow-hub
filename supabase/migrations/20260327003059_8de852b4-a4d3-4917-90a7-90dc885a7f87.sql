CREATE POLICY "Anon can view departments"
ON public.departments
FOR SELECT
TO anon
USING (true);