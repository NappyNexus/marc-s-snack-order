import { useState } from "react";
import type { MenuItem } from "@/lib/menu-data";
import { MenuItemCard } from "./MenuItemCard";
import { ScrollReveal } from "./ScrollReveal";
import { Search, X } from "lucide-react";
import { hasAvailableStock } from "@/lib/inventory";

interface Props {
  menu: MenuItem[];
}

export function MenuSection({ menu }: Props) {
  const [search, setSearch] = useState("");

  const available = menu.filter(hasAvailableStock);
  const filtered = search.trim()
    ? available.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
      )
    : available;

  const categories = Array.from(new Set(filtered.map((i) => i.category)));

  return (
    <section className="py-12">
      <div className="container space-y-8">
        {/* Search bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en el menú..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border bg-card text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-sm transition-shadow hover:shadow-md"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-display text-lg">{search ? "No se encontraron resultados" : "No hay productos disponibles por el momento"}</p>
            {search && <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>}
          </div>
        )}

        {categories.map((cat, ci) => {
          const catItems = filtered.filter((i) => i.category === cat);
          const prices = Array.from(new Set(catItems.map((i) => i.price)));
          const priceLabel = prices.length === 1 ? `RD$${prices[0]}` : `RD$${Math.min(...prices)}–${Math.max(...prices)}`;
          return (
            <ScrollReveal key={cat} delay={ci * 80}>
              <div>
                <div className="flex items-baseline gap-3 mb-4">
                  <h2 className="font-display text-xl font-bold text-foreground">{cat}</h2>
                  <span className="text-sm font-semibold text-accent">{priceLabel} c/u</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {catItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
