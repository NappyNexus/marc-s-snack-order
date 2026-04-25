import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { MenuItem } from "@/lib/menu-data";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.id === item.id);
  const isSoldOut = item.stock !== undefined && item.stock <= 0;
  const canAdd = item.stock === undefined || item.stock > 0;

  return (
    <div className={`group relative flex gap-3 p-3 rounded-xl bg-card border shadow-sm transition-[box-shadow,opacity] duration-200 overflow-hidden ${isSoldOut ? "opacity-60 grayscale" : "hover:shadow-md"}`}>
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
          {item.stock !== undefined && (
            <p className={`text-xs mt-0.5 font-medium ${isSoldOut ? "text-destructive" : "text-muted-foreground"}`}>
              {isSoldOut ? "Agotado" : `${item.stock} disponibles`}
            </p>
          )}
        </div>
        {isSoldOut ? (
          <span className="shrink-0 px-3 py-2 rounded-lg bg-destructive/10 text-destructive font-semibold text-sm">
            Agotado
          </span>
        ) : (
          <button
            onClick={() => canAdd && addItem(item)}
            disabled={!canAdd}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {inCart ? inCart.quantity : "Añadir"}
          </button>
        )}
      </div>
    </div>
  );
}
