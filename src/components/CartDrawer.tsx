import { useState } from "react";
import { X, Minus, Plus, MessageCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { buildWhatsAppUrl } from "@/lib/menu-data";
import { getWhatsAppNumberFromDb } from "@/hooks/use-settings";
import { decrementStockInDb } from "@/hooks/use-menu";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onOrderPlaced?: () => void;
}

export function CartDrawer({ open, onClose, onOrderPlaced }: Props) {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [sending, setSending] = useState(false);

  const handleOrder = async () => {
    if (!customerName.trim() || sending) return;
    setSending(true);
    try {
      const phone = await getWhatsAppNumberFromDb();
      const url = buildWhatsAppUrl(phone, customerName.trim(), items);
      // Use location.href instead of window.open to avoid popup blockers in Safari/Firefox
      // Decrement stock first, then navigate
      await decrementStockInDb(items.map((i) => ({ id: i.id, quantity: i.quantity })));
      window.location.href = url;
      clearCart();
      setCustomerName("");
      onClose();
      onOrderPlaced?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card shadow-2xl transition-transform duration-300 ease-out flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-display text-lg font-bold">Tu Pedido</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-display text-lg">Tu carrito está vacío</p>
              <p className="text-sm mt-1">¡Añade algunos pastelitos deliciosos!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">RD${item.price} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-7 w-7 flex items-center justify-center rounded-md bg-card border hover:bg-muted transition-colors active:scale-95"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-7 w-7 flex items-center justify-center rounded-md bg-card border hover:bg-muted transition-colors active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-bold text-sm w-16 text-right tabular-nums">
                  RD${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-lg">Total</span>
              <span className="font-display font-bold text-xl text-accent tabular-nums">
                RD${totalPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full"
              disabled={!customerName.trim() || sending}
              onClick={handleOrder}
            >
              <MessageCircle className="h-5 w-5" />
              {sending ? "Enviando..." : "Pedir por WhatsApp"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
