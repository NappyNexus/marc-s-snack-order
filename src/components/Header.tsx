import logo from "@/assets/logo.png";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "react-router-dom";

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const { totalItems } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b shadow-sm">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Marc's Snackks" className="h-11 w-11 rounded-full" />
          <span className="font-display text-xl font-bold text-foreground tracking-tight">Marc's Snackks</span>
        </Link>
        <nav className="flex items-center gap-3">
          {!isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver Menú
            </Link>
          )}
          {!isAdmin && (
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
