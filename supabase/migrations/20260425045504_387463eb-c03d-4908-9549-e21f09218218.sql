CREATE TABLE public.cart_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_key text NOT NULL,
  item_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone NOT NULL,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cart_reservations_quantity_positive CHECK (quantity > 0),
  CONSTRAINT cart_reservations_unique_active_item UNIQUE (session_key, item_id)
);

ALTER TABLE public.cart_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage cart reservations"
ON public.cart_reservations
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX idx_cart_reservations_session_key ON public.cart_reservations(session_key);
CREATE INDEX idx_cart_reservations_expiry ON public.cart_reservations(expires_at) WHERE completed_at IS NULL;

CREATE OR REPLACE FUNCTION public.touch_cart_reservations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_cart_reservations_updated_at
BEFORE UPDATE ON public.cart_reservations
FOR EACH ROW
EXECUTE FUNCTION public.touch_cart_reservations_updated_at();

CREATE OR REPLACE FUNCTION public.cleanup_expired_cart_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reservation record;
BEGIN
  FOR reservation IN
    SELECT id, item_id, quantity
    FROM public.cart_reservations
    WHERE completed_at IS NULL
      AND expires_at <= now()
    FOR UPDATE
  LOOP
    UPDATE public.menu_items
    SET stock = stock + reservation.quantity
    WHERE id = reservation.item_id
      AND stock IS NOT NULL;

    DELETE FROM public.cart_reservations
    WHERE id = reservation.id;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.reserve_cart_item(
  _session_key text,
  _item_id text,
  _quantity integer,
  _expires_at timestamp with time zone DEFAULT now() + interval '30 minutes'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_reserved integer := 0;
  delta integer := 0;
  current_stock integer;
BEGIN
  PERFORM public.cleanup_expired_cart_reservations();

  SELECT quantity INTO current_reserved
  FROM public.cart_reservations
  WHERE session_key = _session_key
    AND item_id = _item_id
    AND completed_at IS NULL
  FOR UPDATE;

  current_reserved := COALESCE(current_reserved, 0);
  delta := _quantity - current_reserved;

  IF _quantity <= 0 THEN
    IF current_reserved > 0 THEN
      UPDATE public.menu_items
      SET stock = stock + current_reserved
      WHERE id = _item_id
        AND stock IS NOT NULL;

      DELETE FROM public.cart_reservations
      WHERE session_key = _session_key
        AND item_id = _item_id
        AND completed_at IS NULL;
    END IF;
    RETURN true;
  END IF;

  SELECT stock INTO current_stock
  FROM public.menu_items
  WHERE id = _item_id
  FOR UPDATE;

  IF current_stock IS NULL THEN
    INSERT INTO public.cart_reservations (session_key, item_id, quantity, expires_at)
    VALUES (_session_key, _item_id, _quantity, _expires_at)
    ON CONFLICT (session_key, item_id)
    DO UPDATE SET quantity = EXCLUDED.quantity, expires_at = EXCLUDED.expires_at, completed_at = NULL;
    RETURN true;
  END IF;

  IF delta > 0 AND current_stock < delta THEN
    RETURN false;
  END IF;

  IF delta <> 0 THEN
    UPDATE public.menu_items
    SET stock = stock - delta
    WHERE id = _item_id;
  END IF;

  INSERT INTO public.cart_reservations (session_key, item_id, quantity, expires_at)
  VALUES (_session_key, _item_id, _quantity, _expires_at)
  ON CONFLICT (session_key, item_id)
  DO UPDATE SET quantity = EXCLUDED.quantity, expires_at = EXCLUDED.expires_at, completed_at = NULL;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_cart_reservations(_session_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reservation record;
BEGIN
  FOR reservation IN
    SELECT id, item_id, quantity
    FROM public.cart_reservations
    WHERE session_key = _session_key
      AND completed_at IS NULL
    FOR UPDATE
  LOOP
    UPDATE public.menu_items
    SET stock = stock + reservation.quantity
    WHERE id = reservation.item_id
      AND stock IS NOT NULL;

    DELETE FROM public.cart_reservations
    WHERE id = reservation.id;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_cart_reservations(_session_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.cart_reservations
  SET completed_at = now()
  WHERE session_key = _session_key
    AND completed_at IS NULL;
END;
$$;