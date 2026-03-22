export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export const DEFAULT_MENU: MenuItem[] = [
  // Pastelitos Básicos
  { id: "pb-1", name: "Pastelito de Pollo", price: 60, category: "Pastelitos Básicos" },
  { id: "pb-2", name: "Pastelito de Res", price: 60, category: "Pastelitos Básicos" },
  { id: "pb-3", name: "Pastelito de Queso Amarillo", price: 60, category: "Pastelitos Básicos" },
  { id: "pb-4", name: "Pastelito de Queso Crema", price: 60, category: "Pastelitos Básicos" },

  // Pastelitos de la Casa
  { id: "pc-1", name: "Pastelito Parrillero", price: 60, category: "Pastelitos de la Casa" },
  { id: "pc-2", name: "Pastelito 4 Quesos", price: 60, category: "Pastelitos de la Casa" },
  { id: "pc-3", name: "Pastelito Pollo, Queso y Maíz", price: 60, category: "Pastelitos de la Casa" },
  { id: "pc-4", name: "Pastelito Queso y Salsa Pizza", price: 60, category: "Pastelitos de la Casa" },

  // Pastelitos Especiales
  { id: "pe-1", name: "Pastelito Pechuga Horneada", price: 65, category: "Pastelitos Especiales" },
  { id: "pe-2", name: "Pastelito Croque", price: 65, category: "Pastelitos Especiales" },

  // Pastelitos Super Especiales
  { id: "ps-1", name: "Pastelito Pollo Italiano", price: 70, category: "Pastelitos Super Especiales" },
  { id: "ps-2", name: "Pastelito El Dorado", price: 70, category: "Pastelitos Super Especiales" },

  // Otros
  { id: "o-1", name: "Croquetas", price: 60, category: "Otros Snacks" },
  { id: "o-2", name: "Quipe de Res", price: 70, category: "Otros Snacks" },
  { id: "o-3", name: "Quipe de Pollo", price: 70, category: "Otros Snacks" },
];

const MENU_STORAGE_KEY = "marcs-snackks-menu";
const BANK_STORAGE_KEY = "marcs-snackks-bank";
const WHATSAPP_STORAGE_KEY = "marcs-snackks-whatsapp";

export function getMenu(): MenuItem[] {
  const stored = localStorage.getItem(MENU_STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return DEFAULT_MENU;
}

export function saveMenu(menu: MenuItem[]): void {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  idNumber: string;
  accountType: string;
}

const DEFAULT_BANK: BankInfo = {
  bankName: "Banco Popular",
  accountNumber: "000-0000000-0",
  accountHolder: "Marc's Snackks",
  idNumber: "000-0000000-0",
  accountType: "Cuenta de Ahorros",
};

export function getBankInfo(): BankInfo {
  const stored = localStorage.getItem(BANK_STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return DEFAULT_BANK;
}

export function saveBankInfo(info: BankInfo): void {
  localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(info));
}

export function getWhatsAppNumber(): string {
  return localStorage.getItem(WHATSAPP_STORAGE_KEY) || "18091234567";
}

export function saveWhatsAppNumber(num: string): void {
  localStorage.setItem(WHATSAPP_STORAGE_KEY, num);
}

export function buildWhatsAppUrl(
  phone: string,
  customerName: string,
  items: CartItem[]
): string {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let msg = `🛒 *Pedido de Marc's Snackks*\n\n`;
  msg += `👤 *Cliente:* ${customerName}\n\n`;
  msg += `📋 *Detalle del pedido:*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  items.forEach((item) => {
    msg += `• ${item.name} x${item.quantity} — RD$${(item.price * item.quantity).toLocaleString()}\n`;
  });
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Total: RD$${total.toLocaleString()}*\n\n`;
  msg += `¡Gracias por tu pedido! 🙏`;

  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
