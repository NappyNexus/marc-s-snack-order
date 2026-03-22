import type { MenuItem } from "@/lib/menu-data";
import { MenuItemCard } from "./MenuItemCard";
import { ScrollReveal } from "./ScrollReveal";

interface Props {
  menu: MenuItem[];
}

export function MenuSection({ menu }: Props) {
  const categories = Array.from(new Set(menu.map((i) => i.category)));

  return (
    <section className="py-12">
      <div className="container space-y-10">
        {categories.map((cat, ci) => {
          const catItems = menu.filter((i) => i.category === cat);
          const priceLabel = catItems.length > 0 ? `RD$${catItems[0].price}` : "";
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
