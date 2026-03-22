import { getBankInfo } from "@/lib/menu-data";
import { ScrollReveal } from "./ScrollReveal";
import { Landmark, Copy } from "lucide-react";
import { useState } from "react";

export function BankInfoSection() {
  const bank = getBankInfo();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const fields = [
    { label: "Banco", value: bank.bankName },
    { label: "Tipo de Cuenta", value: bank.accountType },
    { label: "No. de Cuenta", value: bank.accountNumber },
    { label: "Titular", value: bank.accountHolder },
    { label: "Cédula / RNC", value: bank.idNumber },
  ];

  return (
    <section className="py-12 bg-primary/5">
      <div className="container">
        <ScrollReveal>
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Datos para Transferencia</h2>
            </div>
            <div className="bg-card rounded-xl border shadow-sm p-5 space-y-3">
              {fields.map((f) => (
                <div key={f.label} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-semibold text-sm">{f.value}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(f.value, f.label)}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground active:scale-95"
                    title="Copiar"
                  >
                    {copied === f.label ? (
                      <span className="text-xs font-medium text-accent">✓</span>
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
