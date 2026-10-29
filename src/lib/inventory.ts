import type { MenuItem } from "./menu-data";

export function hasAvailableStock(item: Pick<MenuItem, "stock">): boolean {
  return typeof item.stock === "number" && Number.isFinite(item.stock) && item.stock > 0;
}

export function changedStockIds(menu: MenuItem[], baseline: MenuItem[]): string[] {
  return menu.filter((item) => {
    const previous = baseline.find((row) => row.id === item.id);
    return !previous || (item.stock ?? null) !== (previous.stock ?? null);
  }).map((item) => item.id);
}