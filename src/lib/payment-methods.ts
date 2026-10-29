export const PAYMENT_METHODS = ["Popular", "BHD", "Qik", "Reservas", "Efectivo"] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];