"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Plus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Wallet,
  Smartphone,
  Save,
  Search,
  Settings,
  ShieldCheck
} from "lucide-react";
import Swal from "sweetalert2";

interface PaymentMethod {
  id: string;
  name: string;
  type: "CARTAO" | "DINHEIRO" | "PIX" | "VALE";
  active: boolean;
}

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "var(--card)",
  color: "var(--foreground)",
  customClass: {
    popup: "rounded-md border border-border shadow-2xl"
  }
});

export default function PagamentosPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<PaymentMethod["type"]>("CARTAO");

  useEffect(() => {
    const saved = localStorage.getItem("movieats_payment_methods");
    if (saved) {
      setMethods(JSON.parse(saved));
    } else {
      const initial: PaymentMethod[] = [
        { id: "1", name: "Dinheiro", type: "DINHEIRO", active: true },
        { id: "2", name: "Pix", type: "PIX", active: true },
        { id: "3", name: "Cartão de Crédito", type: "CARTAO", active: true },
      ];
      setMethods(initial);
      localStorage.setItem("movieats_payment_methods", JSON.stringify(initial));
    }
  }, []);

  const addMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newMethod: PaymentMethod = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      type: newType,
      active: true
    };

    const newList = [...methods, newMethod];
    setMethods(newList);
    localStorage.setItem("movieats_payment_methods", JSON.stringify(newList));
    setNewName("");
    Toast.fire({ icon: "success", title: "Método adicionado!", iconColor: "#ea580c" });
  };

  const deleteMethod = (id: string) => {
    const newList = methods.filter(m => m.id !== id);
    setMethods(newList);
    localStorage.setItem("movieats_payment_methods", JSON.stringify(newList));
    Toast.fire({ icon: "success", title: "Método removido!", iconColor: "#ef4444" });
  };

  const toggleStatus = (id: string) => {
    const newList = methods.map(m => m.id === id ? { ...m, active: !m.active } : m);
    setMethods(newList);
    localStorage.setItem("movieats_payment_methods", JSON.stringify(newList));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "CARTAO": return <CreditCard className="w-4 h-4" />;
      case "DINHEIRO": return <Banknote className="w-4 h-4" />;
      case "PIX": return <Smartphone className="w-4 h-4" />;
      case "VALE": return <Wallet className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto min-h-full pb-20">
        
        {/* Header Sticky */}
        <div className="sticky -top-8 z-50 py-8 bg-slate-50 dark:bg-background border-b border-border -mx-8 px-8 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-orange-600/10 rounded-md shadow-sm">
                  <CreditCard className="text-orange-600 w-5 h-5" />
                </div>
                <h2 className="text-2xl font-headline font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                  Formas de Pagamento
                </h2>
              </div>
              <p className="text-slate-500 dark:text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Financeiro & Recebimento</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulário de Adição */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-card border border-border rounded-md p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Novo Método</span>
              </div>
              
              <form onSubmit={addMethod} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Nome do Método</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Cartão Elo, VR, etc"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3.5 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-muted-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Tipo de Transação</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-3.5 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="CARTAO">CARTÃO (MAQUININHA)</option>
                    <option value="DINHEIRO">DINHEIRO ESPÉCIE</option>
                    <option value="PIX">PIX DINÂMICO/FIXO</option>
                    <option value="VALE">VALE REFEIÇÃO/ALIM.</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-orange-600 text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 mt-4 active:scale-95"
                >
                  Confirmar Cadastro
                </button>
              </form>

              <div className="mt-8 p-4 bg-orange-600/5 rounded-md border border-orange-600/10">
                 <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-3 h-3 text-orange-600" />
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Segurança</span>
                 </div>
                 <p className="text-[10px] text-slate-500 dark:text-muted-foreground/60 font-bold leading-relaxed uppercase">Os métodos configurados aqui aparecerão como opções para o cliente no fechamento do pedido.</p>
              </div>
            </div>
          </div>

          {/* Listagem de Métodos */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-card border border-border rounded-md overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-slate-50 dark:bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-orange-600" />
                  <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Métodos Ativos</span>
                </div>
                <div className="relative group">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-muted-foreground/30" />
                   <input type="text" placeholder="BUSCAR..." className="bg-white dark:bg-muted border border-border rounded-md py-2 pl-9 pr-4 text-[9px] font-black text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 w-40 transition-all" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-slate-50 dark:bg-muted/20">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em]">Tipo</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em]">Descrição</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em] text-center">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {methods.map((method) => (
                      <tr key={method.id} className="border-b border-border group hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors">
                        <td className="px-8 py-5">
                          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-muted border border-border flex items-center justify-center text-slate-500 dark:text-muted-foreground group-hover:text-orange-600 transition-colors">
                            {getIcon(method.type)}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{method.name}</span>
                             <span className="text-[10px] text-slate-500 dark:text-muted-foreground font-bold tracking-tight uppercase opacity-60">{method.type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button 
                            onClick={() => toggleStatus(method.id)}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                              method.active 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}
                          >
                            {method.active ? 'Ativo' : 'Pausado'}
                          </button>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => deleteMethod(method.id)}
                            className="p-2 text-slate-300 dark:text-muted-foreground/20 hover:text-red-500 transition-colors outline-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
