import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MenuItem } from "@/lib/menu-data";
import { changedStockIds } from "@/lib/inventory";

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMenu = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });

    setError(Boolean(fetchError));
    if (fetchError || !data) {
      setMenu([]);
    } else {
      setMenu(
        data.map((row: any) => ({
          id: row.id,
          name: row.name,
          price: row.price,
          category: row.category,
          image: row.image ?? undefined,
          stock: row.stock ?? undefined,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    const channel = supabase
      .channel("live-menu-stock")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => fetchMenu()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMenu]);

  return { menu, loading, error, refetch: fetchMenu };
}

export async function saveMenuToDb(menu: MenuItem[], baseline: MenuItem[]): Promise<boolean> {
  const rows = menu.map((item, idx) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    category: item.category,
    image: item.image ?? null,
    stock: item.stock ?? null,
    sort_order: idx,
  }));

  const { error } = await supabase.rpc("save_menu_inventory", {
    _menu: rows,
    _stock_ids: changedStockIds(menu, baseline),
  });
  return !error;
}

export async function decrementStockInDb(
  items: { id: string; quantity: number }[]
): Promise<boolean> {
  // Fetch current stock, decrement, update
  const ids = items.map((i) => i.id);
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, stock")
    .in("id", ids);

  if (error || !data) return false;

  const updates = data
    .filter((row: any) => row.stock !== null)
    .map((row: any) => {
      const ordered = items.find((i) => i.id === row.id);
      const newStock = Math.max(0, (row.stock as number) - (ordered?.quantity ?? 0));
      return supabase
        .from("menu_items")
        .update({ stock: newStock })
        .eq("id", row.id);
    });

  await Promise.all(updates);
  return true;
}
