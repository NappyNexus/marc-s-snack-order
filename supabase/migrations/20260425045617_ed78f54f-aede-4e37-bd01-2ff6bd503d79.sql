CREATE POLICY "No direct cart reservation access"
ON public.cart_reservations
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);