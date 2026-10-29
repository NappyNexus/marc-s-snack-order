import { describe, expect, it } from "vitest";
import { PAYMENT_METHODS } from "@/lib/payment-methods";
import { buildWhatsAppUrl } from "@/lib/menu-data";

describe("checkout payment", () => {
  it("offers the five requested payment methods", () => {
    expect(PAYMENT_METHODS).toEqual(["Popular", "BHD", "Qik", "Reservas", "Efectivo"]);
  });
  it.each(PAYMENT_METHODS)("includes %s in the WhatsApp order summary", (method) => {
    const url = new URL(buildWhatsAppUrl("18293331281", "Prueba", [{ id: "a", name: "Pollo", price: 60, category: "Snacks", quantity: 2 }], 1, method));
    expect(url.searchParams.get("text")).toContain(`Método de pago:* ${method}`);
    expect(url.searchParams.get("text")).toContain("Pedido #1");
    expect(url.pathname).toBe("/18293331281");
  });
});