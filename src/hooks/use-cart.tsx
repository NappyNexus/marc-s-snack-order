import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem, MenuItem } from "@/lib/menu-data";

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, qty: number) => Promise<void>;
  clearCart: (options?: { releaseReservations?: boolean }) => Promise<void>;
  completeReservations: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);
const CART_SESSION_KEY = "marcs-snackks-cart-session";

function getCartSessionKey() {
  const stored = localStorage.getItem(CART_SESSION_KEY);
  if (stored) return stored;
  const key = crypto.randomUUID();
  localStorage.setItem(CART_SESSION_KEY, key);
  return key;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sessionKey] = useState(getCartSessionKey);
  const itemsCountRef = useRef(0);

  const reserveQuantity = useCallback(async (id: string, quantity: number) => {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const { data, error } = await supabase.rpc("reserve_cart_item", {
      _session_key: sessionKey,
      _item_id: id,
      _quantity: quantity,
      _expires_at: expiresAt,
    });

    if (error || data === false) {
      toast.error("No hay suficiente inventario disponible");
      return false;
    }

    return true;
  }, [sessionKey]);

  const addItem = useCallback(async (item: MenuItem) => {
    const existing = items.find((i) => i.id === item.id);
    const nextQuantity = (existing?.quantity ?? 0) + 1;
    const reserved = await reserveQuantity(item.id, nextQuantity);
    if (!reserved) return;

    setItems((prev) => {
      const current = prev.find((i) => i.id === item.id);
      if (current) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1, stock: item.stock } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, [items, reserveQuantity]);

  const updateQuantity = useCallback(async (id: string, qty: number) => {
    const reserved = await reserveQuantity(id, Math.max(0, qty));
    if (!reserved) return;

    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
    }
  }, [reserveQuantity]);

  const removeItem = useCallback(async (id: string) => {
    await updateQuantity(id, 0);
  }, [updateQuantity]);

  const clearCart = useCallback(async (options?: { releaseReservations?: boolean }) => {
    if (options?.releaseReservations !== false) {
      await supabase.rpc("release_cart_reservations", { _session_key: sessionKey });
    }
    setItems([]);
  }, [sessionKey]);

  const completeReservations = useCallback(async () => {
    await supabase.rpc("complete_cart_reservations", { _session_key: sessionKey });
    localStorage.removeItem(CART_SESSION_KEY);
  }, [sessionKey]);

  useEffect(() => {
    itemsCountRef.current = items.length;
  }, [items.length]);

  useEffect(() => {
    const releaseOnExit = () => {
      if (itemsCountRef.current > 0) void supabase.rpc("release_cart_reservations", { _session_key: sessionKey });
    };

    window.addEventListener("pagehide", releaseOnExit);
    return () => {
      window.removeEventListener("pagehide", releaseOnExit);
      releaseOnExit();
    };
  }, [sessionKey]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, completeReservations, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
