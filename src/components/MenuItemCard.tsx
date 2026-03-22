import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { MenuItem } from "@/lib/menu-data";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.id === item.id);

  return (
    <div className="group relative flex gap-3 p-3 rounded-xl bg-card border shadow-sm hover:shadow-md transition-[box-shadow] duration-200 overflow-hidden">
      {item.image && (
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm leading-tight truncate">
            {item.name}
          </h3>
          <p className="text-sm font-bold text-accent mt-1">RD${item.price}</p>
        </div>
        <button
          onClick={() => addItem(item)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {inCart ? inCart.quantity : "Añadir"}
        </button>
      </div>
    </div>
  );
}
