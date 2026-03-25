import { useState, useEffect } from "react";
import type { MenuItem } from "@/lib/menu-data";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { BankInfoSection } from "@/components/BankInfoSection";
import { CartDrawer } from "@/components/CartDrawer";
import { useMenu } from "@/hooks/use-menu";

const Index = () => {
  const { menu, loading, refetch } = useMenu();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />
      <Hero />
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Cargando menú...</div>
      ) : (
        <MenuSection menu={menu} />
      )}
      <BankInfoSection />
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p className="font-display font-semibold">Desarrollado por NappyNexus © {new Date().getFullYear()}</p>
      </footer>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onOrderPlaced={refetch} />
    </div>
  );
};

export default Index;
