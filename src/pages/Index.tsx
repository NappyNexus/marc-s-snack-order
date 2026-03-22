import { useState, useEffect } from "react";
import { getMenu } from "@/lib/menu-data";
import type { MenuItem } from "@/lib/menu-data";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { BankInfoSection } from "@/components/BankInfoSection";
import { CartDrawer } from "@/components/CartDrawer";

const Index = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setMenu(getMenu());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />
      <Hero />
      <MenuSection menu={menu} />
      <BankInfoSection />
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p className="font-display font-semibold">Marc's Snackks © {new Date().getFullYear()}</p>
        <p className="mt-1">Pastelitos dominicanos y más 🇩🇴</p>
      </footer>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default Index;
