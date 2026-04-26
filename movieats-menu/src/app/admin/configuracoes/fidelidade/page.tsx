"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Trophy, 
  Save, 
  Settings, 
  Gift, 
  Users, 
  Star,
  TrendingUp,
  Search,
  Calendar,
  AlertTriangle
} from "lucide-react";
import Swal from "sweetalert2";

interface LoyaltySettings {
  enabled: boolean;
  ordersToRedeem: number;
  prizeProductId: string;
  validityDays: number;
}

interface LoyaltyCustomer {
  id: string;
  name: string;
  phone: string;
  points: number;
  lastOrderDate: string; // Guardado como string ISO
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

export default function FidelidadePage() {
  const [settings, setSettings] = useState<LoyaltySettings>({
    enabled: true,
    ordersToRedeem: 10,
    prizeProductId: "1",
    validityDays: 30
  });

  // Dados Mock
  const [customers] = useState<LoyaltyCustomer[]>([
    { id: "1", name: "João Silva", phone: "(11) 98765-4321", points: 8, lastOrderDate: new Date().toISOString() },
    { 
      id: "2", 
      name: "Maria Oliveira", 
      phone: "(11) 91234-5678", 
      points: 4, 
      lastOrderDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() 
    },
    { 
      id: "3", 
      name: "Pedro Santos", 
      phone: "(11) 95555-4444", 
      points: 10, 
      lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
    },
    { 
      id: "4", 
      name: "Ana Costa", 
      phone: "(11) 93333-2222", 
      points: 2, 
      lastOrderDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString() 
    },
  ]);

  const [products] = useState([
    { id: "1", name: "Hambúrguer Gourmet", price: "R$ 35,00" },
    { id: "2", name: "Batata Frita G", price: "R$ 18,00" },
    { id: "3", name: "Milkshake 500ml", price: "R$ 22,00" },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("movieats_loyalty_settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("movieats_loyalty_settings", JSON.stringify(settings));
    Toast.fire({
      icon: "success",
      title: "Configurações salvas!",
      iconColor: "#ea580c"
    });
  };

  const getExpirationInfo = (isoDate: string) => {
    const lastDate = new Date(isoDate);
    const expirationDate = new Date(lastDate);
    expirationDate.setDate(lastDate.getDate() + settings.validityDays);
    
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isClose = daysLeft <= 5;
    
    const formattedDate = expirationDate.toLocaleDateString('pt-BR');
    
    return {
      date: formattedDate,
      isClose,
      daysLeft
    };
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
                  <Trophy className="text-orange-600 w-5 h-5" />
                </div>
                <h2 className="text-2xl font-headline font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                  Sistema de Fidelidade
                </h2>
              </div>
              <p className="text-slate-500 dark:text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Retenção & Recompensas</p>
            </div>
            <button 
              onClick={handleSave}
              className="group flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 cursor-pointer outline-none active:scale-95"
            >
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Salvar Alterações
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          
          {/* 1. Configuração Geral */}
          <div className="bg-white dark:bg-card border border-border rounded-md p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-4 h-4 text-orange-600" />
              <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Regras do Programa</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-muted border border-border rounded-md md:col-span-1">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-900 dark:text-foreground uppercase tracking-tight">Status</span>
                  <span className="text-[9px] text-slate-500 dark:text-muted-foreground uppercase font-bold">Programa Ativo</span>
                </div>
                <button 
                  onClick={() => setSettings({...settings, enabled: !settings.enabled})}
                  className={`relative w-14 h-7 rounded-full transition-colors flex items-center px-1 ${settings.enabled ? 'bg-orange-600' : 'bg-slate-300 dark:bg-muted-foreground/20'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Pedidos para Resgate</label>
                <div className="relative group">
                   <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted-foreground/20 group-focus-within:text-orange-600 transition-colors" />
                   <input 
                      type="number" 
                      min="1"
                      value={settings.ordersToRedeem}
                      onChange={(e) => setSettings({...settings, ordersToRedeem: parseInt(e.target.value) || 1})}
                      className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold"
                   />
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Validade dos Pontos (Dias)</label>
                <div className="relative group">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted-foreground/20 group-focus-within:text-orange-600 transition-colors" />
                   <input 
                      type="number" 
                      min="1"
                      value={settings.validityDays}
                      onChange={(e) => setSettings({...settings, validityDays: parseInt(e.target.value) || 1})}
                      className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Premiação */}
          <div className="bg-white dark:bg-card border border-border rounded-md p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="w-4 h-4 text-orange-600" />
              <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Definição do Prêmio</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-10 gap-8">
              <div className="md:col-span-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest ml-1">Escolher Produto do Cardápio</label>
                  <select 
                    value={settings.prizeProductId}
                    onChange={(e) => setSettings({...settings, prizeProductId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-muted border border-border rounded-md py-4 px-4 text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 transition-all font-bold appearance-none cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-card">{p.name} ({p.price})</option>
                    ))}
                  </select>
                </div>
                <div className="p-4 bg-orange-600/5 border border-orange-600/10 rounded-md">
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest leading-relaxed">
                      Este produto será entregue gratuitamente ao cliente que atingir {settings.ordersToRedeem} pedidos realizados dentro do prazo de validade.
                    </p>
                </div>
              </div>

              <div className="md:col-span-6">
                 <div className="bg-slate-50 dark:bg-muted/50 rounded-md border border-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-100 dark:bg-muted/50 border-b border-border">
                             <th className="px-6 py-4 text-[9px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-widest">Produto Vigente</th>
                             <th className="px-6 py-4 text-[9px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-widest text-right">Valor Original</th>
                          </tr>
                       </thead>
                       <tbody>
                          {products.filter(p => p.id === settings.prizeProductId).map(p => (
                            <tr key={p.id} className="group transition-colors">
                               <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-md bg-orange-600/10 flex items-center justify-center text-orange-600 border border-orange-600/20">
                                        <Star className="w-4 h-4 fill-orange-600/20" />
                                     </div>
                                     <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{p.name}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-5 text-right font-black text-slate-400 dark:text-foreground/40 text-sm tracking-tight">{p.price}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          </div>

          {/* 3. Acompanhamento de Clientes */}
          <div className="bg-white dark:bg-card border border-border rounded-md overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-slate-50 dark:bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-[10px] font-black text-slate-950 dark:text-foreground uppercase tracking-widest">Dashboard de Pontuação</span>
              </div>
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 dark:text-muted-foreground/30" />
                 <input type="text" placeholder="BUSCAR CLIENTE..." className="bg-white dark:bg-muted border border-border rounded-md py-2 pl-9 pr-4 text-[9px] font-black text-slate-900 dark:text-foreground focus:outline-none focus:border-orange-600 w-48 transition-all" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50 dark:bg-muted/20">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em]">Cliente</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em]">Pontos</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em]">Progresso</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.25em] text-center">Expira em</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const progress = (c.points / settings.ordersToRedeem) * 100;
                    const isRedeemable = c.points >= settings.ordersToRedeem;
                    const exp = getExpirationInfo(c.lastOrderDate);
                    
                    return (
                      <tr key={c.id} className="border-b border-border group hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{c.name}</span>
                             <span className="text-[10px] text-slate-500 dark:text-muted-foreground font-bold tracking-tight">{c.phone}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-[11px] font-black ${isRedeemable ? 'bg-orange-600 text-white border-orange-600/20 shadow-lg shadow-orange-600/20 animate-pulse' : 'bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground border-border'}`}>
                            {c.points} / {settings.ordersToRedeem}
                          </div>
                        </td>
                        <td className="px-8 py-6 min-w-[200px]">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[9px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-widest leading-none">
                               <span>{Math.min(100, Math.round(progress))}%</span>
                               {isRedeemable && <span className="text-orange-600 italic animate-bounce mt-1">Ready!</span>}
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-muted rounded-full overflow-hidden border border-border/50 shadow-inner">
                              <div 
                                className={`h-full transition-all duration-1000 ${isRedeemable ? 'bg-orange-600' : 'bg-orange-500/60'}`} 
                                style={{ width: `${Math.min(100, progress)}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className={`flex flex-col items-center justify-center gap-1 ${exp.isClose ? 'text-orange-600' : 'text-slate-500 dark:text-muted-foreground/60'}`}>
                             <div className="flex items-center gap-1.5">
                                {exp.isClose && <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />}
                                <span className="text-xs font-black tracking-tight uppercase leading-none">{exp.date}</span>
                             </div>
                             {exp.isClose && <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">Vence em {exp.daysLeft} d!</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
