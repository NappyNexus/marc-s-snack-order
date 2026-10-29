import pastelitoBasico from "@/assets/pastelito-basico.jpg";
import pastelitoCasa from "@/assets/pastelito-casa.jpg";
import pastelitoEspecial from "@/assets/pastelito-especial.jpg";
import croquetasImg from "@/assets/croquetas.jpg";
import quipeImg from "@/assets/quipe.jpg";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
   stock?: number; // undefined = unavailable until inventory is configured
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export const DEFAULT_MENU: MenuItem[] = [
  { id: "pb-1", name: "Pastelito de Pollo", price: 60, category: "Pastelitos Básicos", image: pastelitoBasico },
  { id: "pb-2", name: "Pastelito de Res", price: 60, category: "Pastelitos Básicos", image: pastelitoBasico },
  { id: "pb-3", name: "Pastelito de Queso Amarillo", price: 60, category: "Pastelitos Básicos", image: pastelitoBasico },
  { id: "pb-4", name: "Pastelito de Queso Crema", price: 60, category: "Pastelitos Básicos", image: pastelitoBasico },
  { id: "pc-1", name: "Pastelito Parrillero", price: 60, category: "Pastelitos de la Casa", image: pastelitoCasa },
  { id: "pc-2", name: "Pastelito 4 Quesos", price: 60, category: "Pastelitos de la Casa", image: pastelitoCasa },
  { id: "pc-3", name: "Pastelito Pollo, Queso y Maíz", price: 60, category: "Pastelitos de la Casa", image: pastelitoCasa },
  { id: "pc-4", name: "Pastelito Queso y Salsa Pizza", price: 60, category: "Pastelitos de la Casa", image: pastelitoCasa },
  { id: "pe-1", name: "Pastelito Pechuga Horneada", price: 65, category: "Pastelitos Especiales", image: pastelitoEspecial },
  { id: "pe-2", name: "Pastelito Croque", price: 65, category: "Pastelitos Especiales", image: pastelitoEspecial },
  { id: "ps-1", name: "Pastelito Pollo Italiano", price: 70, category: "Pastelitos Super Especiales", image: pastelitoEspecial },
  { id: "ps-2", name: "Pastelito El Dorado", price: 70, category: "Pastelitos Super Especiales", image: pastelitoEspecial },
  { id: "o-1", name: "Croquetas", price: 60, category: "Otros Snacks", image: croquetasImg },
  { id: "o-2", name: "Quipe de Res", price: 70, category: "Otros Snacks", image: quipeImg },
  { id: "o-3", name: "Quipe de Pollo", price: 70, category: "Otros Snacks", image: quipeImg },
];

const MENU_STORAGE_KEY = "marcs-snackks-menu";
const BANK_STORAGE_KEY = "marcs-snackks-banks";
const WHATSAPP_STORAGE_KEY = "marcs-snackks-whatsapp";
const ADMIN_PASS_KEY = "marcs-snackks-admin-pass";

// ── Menu ──
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

// ── Bank accounts (multiple) ──
export interface BankInfo {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  idNumber: string;
  accountType: string;
}

const DEFAULT_BANKS: BankInfo[] = [
  {
    id: "bank-1",
    bankName: "Banco Popular",
    accountNumber: "837421346",
    accountHolder: "Marc's Snackks",
    idNumber: "402-2122012-8",
    accountType: "Cuenta Corriente",
  },
  {
    id: "bank-2",
    bankName: "BHD",
    accountNumber: "14010380017",
    accountHolder: "Marc's Snackks",
    idNumber: "402-2122012-8",
    accountType: "Cuenta de Ahorros",
  },
  {
    id: "bank-3",
    bankName: "Qik",
    accountNumber: "1000097515",
    accountHolder: "Marc's Snackks",
    idNumber: "402-2122012-8",
    accountType: "Cuenta de Ahorros",
  },
  {
    id: "bank-4",
    bankName: "Banco de Reservas",
    accountNumber: "9604465311",
    accountHolder: "Marc's Snackks",
    idNumber: "402-2122012-8",
    accountType: "Cuenta de Ahorros",
  },
];

export function getBankAccounts(): BankInfo[] {
  const stored = localStorage.getItem(BANK_STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  return DEFAULT_BANKS;
}

export function saveBankAccounts(banks: BankInfo[]): void {
  localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(banks));
}

// Legacy compat
export function getBankInfo(): BankInfo {
  return getBankAccounts()[0] || DEFAULT_BANKS[0];
}

export function saveBankInfo(info: BankInfo): void {
  const banks = getBankAccounts();
  const idx = banks.findIndex((b) => b.id === info.id);
  if (idx >= 0) banks[idx] = info;
  else banks.push(info);
  saveBankAccounts(banks);
}

// ── WhatsApp ──
export function getWhatsAppNumber(): string {
  return localStorage.getItem(WHATSAPP_STORAGE_KEY) || "18293331281";
}

export function saveWhatsAppNumber(num: string): void {
  localStorage.setItem(WHATSAPP_STORAGE_KEY, num);
}

// ── Admin password ──
const DEFAULT_ADMIN_PASS = "admin123";

export function getAdminPassword(): string {
  return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_ADMIN_PASS;
}

export function saveAdminPassword(pass: string): void {
  localStorage.setItem(ADMIN_PASS_KEY, pass);
}

export function verifyAdminPassword(input: string): boolean {
  return input === getAdminPassword();
}

// ── Stock management ──
export function decrementStock(items: { id: string; quantity: number }[]): void {
  const menu = getMenu();
  const updated = menu.map((item) => {
    const ordered = items.find((i) => i.id === item.id);
    if (ordered && item.stock !== undefined) {
      return { ...item, stock: Math.max(0, item.stock - ordered.quantity) };
    }
    return item;
  });
  saveMenu(updated);
}

// ── WhatsApp URL builder ──
export function buildWhatsAppUrl(
  phone: string,
  customerName: string,
  items: CartItem[],
  orderNumber?: number,
  paymentMethod?: string
): string {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let msg = `🛒 *Pedido de Marc's Snackks*\n\n`;
  if (orderNumber !== undefined) msg += `🔢 *Pedido #${orderNumber}*\n`;
  msg += `👤 *Cliente:* ${customerName}\n\n`;
  if (paymentMethod) msg += `💳 *Método de pago:* ${paymentMethod}\n\n`;
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
