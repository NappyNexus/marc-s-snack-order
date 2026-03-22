import { useState, useEffect } from "react";
import { getMenu, saveMenu, getBankInfo, saveBankInfo, getWhatsAppNumber, saveWhatsAppNumber } from "@/lib/menu-data";
import type { MenuItem, BankInfo } from "@/lib/menu-data";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function AdminPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [bank, setBank] = useState<BankInfo>(getBankInfo());
  const [whatsapp, setWhatsapp] = useState(getWhatsAppNumber());
  const [tab, setTab] = useState<"menu" | "bank">("menu");

  useEffect(() => {
    setMenu(getMenu());
  }, []);

  const addItem = () => {
    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: "",
      price: 0,
      category: "Otros Snacks",
    };
    setMenu([...menu, newItem]);
  };

  const updateItem = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenu(menu.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const deleteItem = (id: string) => {
    setMenu(menu.filter((i) => i.id !== id));
  };

  const handleSaveMenu = () => {
    saveMenu(menu);
    toast.success("Menú actualizado");
  };

  const handleSaveBank = () => {
    saveBankInfo(bank);
    saveWhatsAppNumber(whatsapp);
    toast.success("Datos actualizados");
  };

  const categories = Array.from(new Set(menu.map((i) => i.category)));

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => {}} />
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold">Panel de Administración</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
          <button
            onClick={() => setTab("menu")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${tab === "menu" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Menú y Precios
          </button>
          <button
            onClick={() => setTab("bank")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${tab === "bank" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Datos de Pago
          </button>
        </div>

        {tab === "menu" && (
          <div className="space-y-6">
            {categories.map((cat) => {
              const catItems = menu.filter((i) => i.category === cat);
              return (
                <div key={cat}>
                  <h2 className="font-display font-bold text-lg mb-3">{cat}</h2>
                  <div className="space-y-2">
                    {catItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-3 bg-card rounded-xl border">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          placeholder="Nombre del producto"
                          className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">RD$</span>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                            className="w-16 bg-muted rounded-md px-2 py-1 text-sm font-bold text-right focus:outline-none focus:ring-1 focus:ring-ring tabular-nums"
                          />
                        </div>
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, "category", e.target.value)}
                          className="bg-muted rounded-md px-2 py-1 text-xs focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="Nueva Categoría">+ Nueva</option>
                        </select>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex gap-3">
              <Button variant="outline" onClick={addItem} className="gap-2">
                <Plus className="h-4 w-4" /> Añadir Producto
              </Button>
              <Button onClick={handleSaveMenu} className="gap-2">
                <Save className="h-4 w-4" /> Guardar Menú
              </Button>
            </div>
          </div>
        )}

        {tab === "bank" && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border p-5 space-y-4">
              <h2 className="font-display font-bold">Datos Bancarios</h2>
              {[
                { label: "Nombre del Banco", key: "bankName" as const },
                { label: "Tipo de Cuenta", key: "accountType" as const },
                { label: "Número de Cuenta", key: "accountNumber" as const },
                { label: "Titular de la Cuenta", key: "accountHolder" as const },
                { label: "Cédula / RNC", key: "idNumber" as const },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                  <input
                    type="text"
                    value={bank[f.key]}
                    onChange={(e) => setBank({ ...bank, [f.key]: e.target.value })}
                    className="w-full mt-1 bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl border p-5 space-y-4">
              <h2 className="font-display font-bold">WhatsApp del Vendedor</h2>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Número (con código de país, sin +)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="18091234567"
                  className="w-full mt-1 bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <Button onClick={handleSaveBank} className="gap-2">
              <Save className="h-4 w-4" /> Guardar Datos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
