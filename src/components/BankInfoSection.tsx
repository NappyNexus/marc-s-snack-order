import { getBankAccounts } from "@/lib/menu-data";
import { ScrollReveal } from "./ScrollReveal";
import { Landmark, Copy, Building2 } from "lucide-react";
import { useState } from "react";

export function BankInfoSection() {
  const banks = getBankAccounts();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const fieldLabels = [
    { label: "Banco", key: "bankName" as const },
    { label: "Tipo de Cuenta", key: "accountType" as const },
    { label: "No. de Cuenta", key: "accountNumber" as const },
    { label: "Titular", key: "accountHolder" as const },
    { label: "Cédula / RNC", key: "idNumber" as const },
  ];

  return (
    <section className="py-12 bg-primary/5">
      <div className="container">
        <ScrollReveal>
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Datos para Transferencia</h2>
            </div>

            {banks.map((bank, idx) => (
              <div key={bank.id} className="bg-card rounded-xl border shadow-sm p-5 space-y-3">
                {banks.length > 1 && (
                  <div className="flex items-center gap-2 pb-2 border-b mb-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">{bank.bankName || `Cuenta ${idx + 1}`}</span>
                  </div>
                )}
                {fieldLabels.map((f) => {
                  const copyKey = `${bank.id}-${f.key}`;
                  return (
                    <div key={f.key} className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                        <p className="font-semibold text-sm">{bank[f.key]}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bank[f.key], copyKey)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground active:scale-95"
                        title="Copiar"
                      >
                        {copied === copyKey ? (
                          <span className="text-xs font-medium text-accent">✓</span>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
