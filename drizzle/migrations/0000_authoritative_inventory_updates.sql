CREATE OR REPLACE FUNCTION public.save_menu_inventory(_menu jsonb, _stock_ids text[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE item jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('inventory-reservations'));
  DELETE FROM public.cart_reservations WHERE item_id = ANY(_stock_ids) OR item_id NOT IN (SELECT value->>'id' FROM jsonb_array_elements(_menu));
  DELETE FROM public.menu_items WHERE id NOT IN (SELECT value->>'id' FROM jsonb_array_elements(_menu));
  FOR item IN SELECT value FROM jsonb_array_elements(_menu) LOOP
    INSERT INTO public.menu_items(id,name,price,category,image,stock,sort_order)
    VALUES(item->>'id',item->>'name',(item->>'price')::integer,item->>'category',item->>'image',GREATEST(COALESCE((item->>'stock')::integer,0),0),(item->>'sort_order')::integer)
    ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name, price=EXCLUDED.price, category=EXCLUDED.category, image=EXCLUDED.image, sort_order=EXCLUDED.sort_order,
      stock=CASE WHEN EXCLUDED.id=ANY(_stock_ids) THEN EXCLUDED.stock ELSE menu_items.stock END;
  END LOOP;
END; $$;
GRANT EXECUTE ON FUNCTION public.save_menu_inventory(jsonb,text[]) TO anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.cleanup_expired_cart_reservations()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE reservation record;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('inventory-reservations'));
  FOR reservation IN SELECT id,item_id,quantity FROM public.cart_reservations WHERE completed_at IS NULL AND expires_at<=now() FOR UPDATE LOOP
    UPDATE public.menu_items SET stock=stock+reservation.quantity WHERE id=reservation.item_id AND stock IS NOT NULL;
    DELETE FROM public.cart_reservations WHERE id=reservation.id;
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.release_cart_reservations(_session_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE reservation record;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('inventory-reservations'));
  FOR reservation IN SELECT id,item_id,quantity FROM public.cart_reservations WHERE session_key=_session_key AND completed_at IS NULL FOR UPDATE LOOP
    UPDATE public.menu_items SET stock=stock+reservation.quantity WHERE id=reservation.item_id AND stock IS NOT NULL;
    DELETE FROM public.cart_reservations WHERE id=reservation.id;
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.complete_cart_reservations(_session_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('inventory-reservations'));
  DELETE FROM public.cart_reservations WHERE session_key=_session_key AND completed_at IS NULL;
END; $$;

CREATE OR REPLACE FUNCTION public.reserve_cart_item(_session_key text,_item_id text,_quantity integer,_expires_at timestamptz DEFAULT now()+interval '30 minutes')
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_reserved integer:=0; delta integer; current_stock integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('inventory-reservations'));
  PERFORM public.cleanup_expired_cart_reservations();
  SELECT stock INTO current_stock FROM public.menu_items WHERE id=_item_id FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  SELECT quantity INTO current_reserved FROM public.cart_reservations WHERE session_key=_session_key AND item_id=_item_id AND completed_at IS NULL FOR UPDATE;
  current_reserved:=COALESCE(current_reserved,0);
  IF _quantity<=0 THEN
    UPDATE public.menu_items SET stock=stock+current_reserved WHERE id=_item_id AND stock IS NOT NULL;
    DELETE FROM public.cart_reservations WHERE session_key=_session_key AND item_id=_item_id AND completed_at IS NULL;
    RETURN true;
  END IF;
  IF current_stock IS NULL THEN RETURN false; END IF;
  delta:=_quantity-current_reserved;
  IF delta>0 AND current_stock<delta THEN RETURN false; END IF;
  UPDATE public.menu_items SET stock=stock-delta WHERE id=_item_id;
  INSERT INTO public.cart_reservations(session_key,item_id,quantity,expires_at)
  VALUES(_session_key,_item_id,_quantity,LEAST(_expires_at,now()+interval '30 minutes'))
  ON CONFLICT(session_key,item_id) DO UPDATE SET quantity=EXCLUDED.quantity,expires_at=EXCLUDED.expires_at,completed_at=NULL;
  RETURN true;
END; $$;