import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BankInfo } from "@/lib/menu-data";
import { DEFAULT_MENU } from "@/lib/menu-data";

const DEFAULT_BANKS: BankInfo[] = [
  { id: "bank-1", bankName: "Banco Popular", accountNumber: "837421346", accountHolder: "Marc's Snackks", idNumber: "402-2122012-8", accountType: "Cuenta Corriente" },
  { id: "bank-2", bankName: "BHD", accountNumber: "14010380017", accountHolder: "Marc's Snackks", idNumber: "402-2122012-8", accountType: "Cuenta de Ahorros" },
  { id: "bank-3", bankName: "Qik", accountNumber: "1000097515", accountHolder: "Marc's Snackks", idNumber: "402-2122012-8", accountType: "Cuenta de Ahorros" },
  { id: "bank-4", bankName: "Banco de Reservas", accountNumber: "9604465311", accountHolder: "Marc's Snackks", idNumber: "402-2122012-8", accountType: "Cuenta de Ahorros" },
];

const DEFAULT_WHATSAPP = "18293331281";
const DEFAULT_ADMIN_PASS = "admin123";

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return fallback;
  return data.value as T;
}

async function saveSetting(key: string, value: any): Promise<boolean> {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  return !error;
}

export function useBankAccounts() {
  const [banks, setBanks] = useState<BankInfo[]>(DEFAULT_BANKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSetting<BankInfo[]>("bank_accounts", DEFAULT_BANKS).then((b) => {
      setBanks(b);
      setLoading(false);
    });
  }, []);

  const save = useCallback(async (newBanks: BankInfo[]) => {
    setBanks(newBanks);
    return saveSetting("bank_accounts", newBanks);
  }, []);

  return { banks, setBanks, loading, save };
}

export function useWhatsApp() {
  const [number, setNumber] = useState(DEFAULT_WHATSAPP);

  useEffect(() => {
    getSetting<string>("whatsapp_number", DEFAULT_WHATSAPP).then(setNumber);
  }, []);

  const save = useCallback(async (num: string) => {
    setNumber(num);
    return saveSetting("whatsapp_number", num);
  }, []);

  return { number, setNumber, save };
}

export function useAdminPassword() {
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASS);

  useEffect(() => {
    getSetting<string>("admin_password", DEFAULT_ADMIN_PASS).then(setPassword);
  }, []);

  const save = useCallback(async (pass: string) => {
    setPassword(pass);
    return saveSetting("admin_password", pass);
  }, []);

  const verify = useCallback(async (input: string) => {
    const stored = await getSetting<string>("admin_password", DEFAULT_ADMIN_PASS);
    return input === stored;
  }, []);

  return { password, setPassword, save, verify };
}

export async function getWhatsAppNumberFromDb(): Promise<string> {
  return getSetting<string>("whatsapp_number", DEFAULT_WHATSAPP);
}
