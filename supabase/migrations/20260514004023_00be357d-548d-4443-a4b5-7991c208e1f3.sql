
CREATE OR REPLACE FUNCTION public.set_daily_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  order_day date;
  next_num bigint;
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  order_day := (NEW.created_at AT TIME ZONE 'America/Santo_Domingo')::date;

  -- Lock per-day to avoid race conditions
  PERFORM pg_advisory_xact_lock(hashtext('orders_daily_' || order_day::text));

  SELECT COALESCE(MAX(order_number), 0) + 1
  INTO next_num
  FROM public.orders
  WHERE ((created_at AT TIME ZONE 'America/Santo_Domingo')::date) = order_day;

  NEW.order_number := next_num;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_daily_order_number_trigger ON public.orders;
CREATE TRIGGER set_daily_order_number_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_daily_order_number();
