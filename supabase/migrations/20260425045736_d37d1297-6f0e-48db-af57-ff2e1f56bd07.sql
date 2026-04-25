CREATE OR REPLACE FUNCTION public.complete_cart_reservations(_session_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.cart_reservations
  WHERE session_key = _session_key
    AND completed_at IS NULL;
END;
$$;