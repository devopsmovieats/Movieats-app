"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  ChevronRight,
  Plus,
  ArrowLeft,
  X,
  CreditCard,
  ChefHat,
  ShoppingBag,
  Trash2,
  ChevronDown
} from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";

// Configuração do Toast
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#141414",
  color: "#fff"
});

type TableStatus = "Livre" | "Ocupada" | "Conta";
type ViewState = "dashboard" | "table_select" | "menu";

interface Table {
  id: number;
  status: TableStatus;
  lastOrder?: string;
  total?: number;
  items: any[];
}

const PRODUCTS = [
  { id: 1, name: "Burger Elite Smash", price: 38.00, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200" },
  { id: 2, name: "Picanha Movieats", price: 42.00, category: "Burgers", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=200" },
  { id: 3, name: "Batata Rústica Individual", price: 18.00, category: "Acompanhamentos", image: "https://images.unsplash.com/photo-1573015084245-7da883204507?q=80&w=200" },
  { id: 4, name: "Coca-Cola Zero", price: 7.50, category: "Bebidas", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200" },
];

export default function GarcomDashboard() {
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      status: i % 4 === 1 ? "Ocupada" : i % 5 === 2 ? "Conta" : "Livre",
      lastOrder: "15 min ago",
      total: i % 4 === 1 ? 56.00 : 0,
      items: i % 4 === 1 ? [
        { name: "Burger Elite Smash", price: 38.00, quantity: 1 },
        { name: "Batata Rústica", price: 18.00, quantity: 1 },
      ] : []
    }))
  );

  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeTableId, setActiveTableId] = useState<number | null>(null);
  const [orderCart, setOrderCart] = useState<any[]>([]);

  // Real-time listener para novos pedidos (Sininho)
  useEffect(() => {
    const channel = supabase
      .channel('garcom-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setHasNewAlert(true);
        if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        Toast.fire({ icon: 'info', title: '🛎️ Novo Pedido do Cliente!', text: `Mesa ${payload.new.mesa || '?'}` });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleTableClick = (table: Table) => {
    if (table.status === "Livre") {
      setActiveTableId(table.id);
      setCurrentView("menu");
    } else {
      setSelectedTable(table);
    }
  };

  const addToOrder = (product: any) => {
    setOrderCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    Toast.fire({ icon: 'success', title: 'Item Adicionado' });
  };

  const finalizeGarcomOrder = () => {
    if (!activeTableId) return;
    
    setTables(prev => prev.map(t => {
      if (t.id === activeTableId) {
        const cartTotal = orderCart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        return {
          ...t,
          status: "Ocupada",
          total: (t.total || 0) + cartTotal,
          items: [...t.items, ...orderCart]
        };
      }
      return t;
    }));

    setOrderCart([]);
    setActiveTableId(null);
    setCurrentView("dashboard");
    
    Swal.fire({
      title: "Pedido Enviado!",
      text: "Os itens já foram registrados para esta mesa.",
      icon: "success",
      background: "#141414",
      color: "#fff",
      confirmButtonColor: "#10b981",
      timer: 2000
    });
  };

  if (currentView === "menu") {
    return (
      <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col">
        {/* Header Menu */}
        <header className="p-6 border-b border-white/5 flex items-center gap-4 bg-[#0a0a0a]">
          <button onClick={() => setCurrentView("dashboard")} className="p-2 bg-white/5 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">Lançar Pedido</h2>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">Mesa {activeTableId?.toString().padStart(2, '0')}</h1>
          </div>
        </header>

        {/* Categories Horizontal */}
        <div className="flex gap-2 p-6 overflow-x-auto no-scrollbar">
           {["Todos", "Burgers", "Bebidas", "Fritas"].map(cat => (
             <button key={cat} className="whitespace-nowrap px-6 py-2.5 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 active:bg-primary active:text-black">
               {cat}
             </button>
           ))}
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-32">
          {PRODUCTS.map(prod => (
            <div key={prod.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-4 items-center">
              <img src={prod.image} className="w-16 h-16 rounded-xl object-cover" alt="" />
              <div className="flex-1">
                <h4 className="text-sm font-bold uppercase tracking-tight">{prod.name}</h4>
                <p className="text-primary font-black text-sm italic">R$ {prod.price.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => addToOrder(prod)}
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Cart Action */}
        {orderCart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
             <button 
               onClick={finalizeGarcomOrder}
               className="w-full h-16 bg-emerald-600 rounded-2xl flex items-center justify-between px-8 shadow-2xl shadow-emerald-900/40"
             >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase opacity-60 leading-none">Confirmar Itens</p>
                      <p className="text-sm font-black uppercase italic">{orderCart.length} Itens Selecionados</p>
                   </div>
                </div>
                <ChevronRight className="w-6 h-6" />
             </button>
          </div>
        )}
      </div>
    );
  }

  if (currentView === "table_select") {
     return (
        <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col">
           <header className="p-6 border-b border-white/5 flex items-center gap-4 bg-[#0a0a0a]">
              <button onClick={() => setCurrentView("dashboard")} className="p-2 bg-white/5 rounded-xl">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-black uppercase tracking-tighter italic">Selecione a Mesa</h1>
           </header>
           <div className="grid grid-cols-3 gap-4 p-6">
              {tables.map(t => (
                 <button 
                   key={t.id} 
                   onClick={() => { setActiveTableId(t.id); setCurrentView("menu"); }}
                   className={`h-24 rounded-2xl border flex flex-col items-center justify-center gap-1
                      ${t.status === 'Livre' ? 'bg-white/5 border-white/10' : 'bg-rose-500/20 border-rose-500/30 opacity-60'}
                   `}
                 >
                    <span className="text-[10px] font-black uppercase opacity-40">Mesa</span>
                    <span className="text-2xl font-black italic">{t.id.toString().padStart(2, '0')}</span>
                 </button>
              ))}
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans pb-20">
      
      {/* 🔔 Header Professional */}
      <header className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-sm font-black uppercase tracking-tight italic">Garçom <span className="text-primary">Elite</span></h1>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setHasNewAlert(false)}
            className={`p-2 rounded-xl transition-all duration-500 
              ${hasNewAlert ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.6)] animate-pulse' : 'bg-white/5 text-white/40'}
            `}
          >
            <Bell className={`w-5 h-5 ${hasNewAlert ? 'fill-current' : ''}`} />
          </button>
          {hasNewAlert && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-black animate-bounce" />
          )}
        </div>
      </header>

      <main className="px-6 py-8 md:max-w-4xl md:mx-auto">
        
        <div className="flex items-center justify-between mb-8">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status do Salão</p>
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Gestão de Mesas</h2>
           </div>
           <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">
                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                 <span className="text-[9px] font-black uppercase text-white/40">Livre</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
                 <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                 <span className="text-[9px] font-black uppercase text-rose-500">Ocupada</span>
              </div>
           </div>
        </div>

        {/* 🪑 Mesas Grid (Large Buttons) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 active:opacity-70 group relative overflow-hidden
                ${table.status === "Livre" ? "bg-white/[0.02] border-white/5 hover:border-white/20" : ""}
                ${table.status === "Ocupada" ? "bg-rose-500/10 border-rose-500/20" : ""}
                ${table.status === "Conta" ? "bg-amber-500/10 border-amber-500/20 animate-pulse" : ""}
              `}
            >
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Mesa</span>
              <span className={`text-2xl font-black leading-none italic ${table.status === 'Livre' ? 'text-white/40' : 'text-white'}`}>
                {table.id.toString().padStart(2, '0')}
              </span>
              
              {table.status !== "Livre" && (
                <div className="flex flex-col items-center gap-0.5 mt-1">
                   <p className="text-[8px] font-black uppercase tracking-tighter opacity-50">R$ {table.total?.toFixed(0)}</p>
                   {table.status === "Conta" && (
                     <CreditCard className="w-3 h-3 text-amber-500" />
                   )}
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* 📱 Mobile Quick Actions (Bottom Bar) */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent pointer-events-none">
         <div className="max-w-md mx-auto pointer-events-auto">
            <button 
               onClick={() => setCurrentView("table_select")}
               className="w-full h-14 bg-primary text-black rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 group transform transition-transform active:scale-95"
            >
               <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
               <span className="font-black uppercase tracking-widest text-[12px] italic">Lançar Novo Pedido</span>
            </button>
         </div>
      </footer>

      {/* 🧾 Modal de Mesa Ocupada (Detailed Order Summary) */}
      {selectedTable && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedTable(null)} />
          <div className="relative w-full max-w-lg bg-[#0d0d0d] border-t border-white/10 rounded-t-[32px] p-8 animate-in slide-in-from-bottom-full duration-500">
             <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
             
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic">Mesa {selectedTable.id.toString().padStart(2, '0')}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${selectedTable.status === 'Conta' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status: {selectedTable.status}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedTable(null)}
                  className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
             </div>

             <div className="space-y-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Extrato Detalhado</p>
                   <div className="space-y-5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedTable.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start pb-4 border-b border-white/[0.03] last:border-0 last:pb-0">
                           <div className="flex-1">
                              <h5 className="text-white font-black uppercase text-xs italic tracking-tight">{item.quantity}x {item.name}</h5>
                              <p className="text-[10px] text-muted-foreground font-bold mt-1 tracking-widest uppercase italic">MESA {selectedTable.id}</p>
                           </div>
                           <span className="font-black text-primary text-sm italic">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Acumulado</p>
                      <h4 className="text-2xl font-black text-white italic tracking-tighter">R$ {selectedTable.total?.toFixed(2)}</h4>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => { setActiveTableId(selectedTable.id); setCurrentView("menu"); setSelectedTable(null); }}
                     className="h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transform transition-transform active:scale-95"
                   >
                      <Plus className="w-4 h-4" />
                      Add Item
                   </button>
                   <button 
                      className={`h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] transform transition-transform active:scale-95 ${selectedTable.status === 'Conta' ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-500'}`}
                      onClick={() => {
                         Swal.fire({
                            title: "Fechar Conta?",
                            text: "Deseja finalizar o atendimento e liberar a mesa?",
                            icon: "question",
                            background: "#141414",
                            color: "#fff",
                            confirmButtonColor: "#10b981",
                            showCancelButton: true,
                            confirmButtonText: "Sim, Finalizar",
                            cancelButtonText: "Agora Não"
                         }).then(r => {
                            if (r.isConfirmed) {
                               setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'Livre', total: 0, items: [] } : t));
                               setSelectedTable(null);
                               Toast.fire({ icon: 'success', title: 'Mesa Liberada' });
                            }
                         });
                      }}
                   >
                      <CreditCard className="w-4 h-4" />
                      {selectedTable.status === 'Conta' ? 'Receber' : 'Fechar'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
