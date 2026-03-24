import { useState, useEffect, useRef } from "react";
import {
  getMenu, saveMenu,
  getBankAccounts, saveBankAccounts,
  getWhatsAppNumber, saveWhatsAppNumber,
  getAdminPassword, saveAdminPassword, verifyAdminPassword,
} from "@/lib/menu-data";
import type { MenuItem, BankInfo } from "@/lib/menu-data";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Plus, Trash2, Save, ArrowLeft, Lock, Image, Eye, EyeOff, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(pass)) {
      sessionStorage.setItem("marcs-admin-auth", "1");
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Panel Admin</h1>
          <p className="text-sm text-muted-foreground">Ingresa la contraseña para acceder</p>
        </div>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${error ? "border-destructive ring-2 ring-destructive/30" : ""}`}
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-destructive text-center">Contraseña incorrecta</p>}
        <Button type="submit" className="w-full" size="lg">Entrar</Button>
        <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Volver al menú
        </Link>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("marcs-admin-auth") === "1");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [whatsapp, setWhatsapp] = useState(getWhatsAppNumber());
  const [adminPass, setAdminPass] = useState(getAdminPassword());
  const [tab, setTab] = useState<"menu" | "bank" | "settings">("menu");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  useEffect(() => {
    setMenu(getMenu());
    setBanks(getBankAccounts());
  }, []);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const addItem = () => {
    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: "",
      price: 0,
      category: "Otros Snacks",
    };
    setMenu([...menu, newItem]);
  };

  const updateItem = (id: string, field: keyof MenuItem, value: string | number | undefined) => {
    setMenu(menu.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const deleteItem = (id: string) => {
    setMenu(menu.filter((i) => i.id !== id));
  };

  const handleImageUpload = (id: string) => {
    setUploadTargetId(id);
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetId) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setMenu((prev) => prev.map((i) => (i.id === uploadTargetId ? { ...i, image: dataUrl } : i)));
      setUploadTargetId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveMenu = () => {
    saveMenu(menu);
    toast.success("Menú actualizado");
  };

  // ── Bank accounts ──
  const addBank = () => {
    setBanks([...banks, {
      id: `bank-${Date.now()}`,
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      idNumber: "",
      accountType: "Cuenta de Ahorros",
    }]);
  };

  const updateBank = (id: string, field: keyof BankInfo, value: string) => {
    setBanks(banks.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const deleteBank = (id: string) => {
    if (banks.length <= 1) { toast.error("Debes tener al menos una cuenta"); return; }
    setBanks(banks.filter((b) => b.id !== id));
  };

  const handleSaveBank = () => {
    saveBankAccounts(banks);
    saveWhatsAppNumber(whatsapp);
    toast.success("Datos actualizados");
  };

  const handleSaveSettings = () => {
    if (adminPass.length < 4) { toast.error("La contraseña debe tener al menos 4 caracteres"); return; }
    saveAdminPassword(adminPass);
    toast.success("Contraseña actualizada");
  };

  const categories = Array.from(new Set(menu.map((i) => i.category)));

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => {}} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />

      <div className="container py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold">Panel de Administración</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
          {[
            { key: "menu" as const, label: "Menú y Precios" },
            { key: "bank" as const, label: "Datos de Pago" },
            { key: "settings" as const, label: "Ajustes" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all ${tab === t.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── MENU TAB ── */}
        {tab === "menu" && (
          <div className="space-y-6">
            {categories.map((cat) => {
              const catItems = menu.filter((i) => i.category === cat);
              return (
                <div key={cat}>
                  <h2 className="font-display font-bold text-lg mb-3">{cat}</h2>
                  <div className="space-y-2">
                    {catItems.map((item) => (
                      <div key={item.id} className="bg-card rounded-xl border p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          {/* Image thumbnail / upload */}
                          <button
                            onClick={() => handleImageUpload(item.id)}
                            className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center hover:ring-2 hover:ring-ring transition-all"
                            title="Cambiar imagen"
                          >
                            {item.image ? (
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Image className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            placeholder="Nombre del producto"
                            className="flex-1 bg-transparent text-sm font-medium focus:outline-none min-w-0"
                          />
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">RD$</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                              className="w-16 bg-muted rounded-md px-2 py-1 text-sm font-bold text-right focus:outline-none focus:ring-1 focus:ring-ring tabular-nums"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Stock</span>
                            <input
                              type="number"
                              value={item.stock ?? ""}
                              onChange={(e) => updateItem(item.id, "stock", e.target.value === "" ? undefined : Number(e.target.value))}
                              placeholder="∞"
                              className={`w-14 bg-muted rounded-md px-2 py-1 text-sm font-bold text-right focus:outline-none focus:ring-1 focus:ring-ring tabular-nums ${item.stock !== undefined && item.stock <= 0 ? "text-destructive" : ""}`}
                              min={0}
                            />
                          </div>
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(item.id, "category", e.target.value)}
                            className="bg-muted rounded-md px-2 py-1 text-xs focus:outline-none flex-1 min-w-0"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                            <option value="Nueva Categoría">+ Nueva</option>
                          </select>
                        </div>
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

        {/* ── BANK TAB ── */}
        {tab === "bank" && (
          <div className="space-y-4">
            {banks.map((bank, idx) => (
              <div key={bank.id} className="bg-card rounded-xl border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="font-display font-bold">Cuenta {idx + 1}</h2>
                  </div>
                  {banks.length > 1 && (
                    <button onClick={() => deleteBank(bank.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {(
                  [
                    { label: "Nombre del Banco", key: "bankName" as const },
                    { label: "Tipo de Cuenta", key: "accountType" as const },
                    { label: "Número de Cuenta", key: "accountNumber" as const },
                    { label: "Titular de la Cuenta", key: "accountHolder" as const },
                    { label: "Cédula / RNC", key: "idNumber" as const },
                  ] as const
                ).map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                    <input
                      type="text"
                      value={bank[f.key]}
                      onChange={(e) => updateBank(bank.id, f.key, e.target.value)}
                      className="w-full mt-1 bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            ))}

            <Button variant="outline" onClick={addBank} className="gap-2">
              <Plus className="h-4 w-4" /> Añadir Cuenta Bancaria
            </Button>

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

        {/* ── SETTINGS TAB ── */}
        {tab === "settings" && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold">Contraseña de Admin</h2>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nueva contraseña</label>
                <input
                  type="text"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full mt-1 bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button onClick={handleSaveSettings} className="gap-2">
                <Save className="h-4 w-4" /> Guardar Contraseña
              </Button>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
              <p>La contraseña por defecto es <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-xs">admin123</code>. Cámbiala por una más segura.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
