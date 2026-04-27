"use client";

import { useState, useEffect } from "react";
import { 
  Bike, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  History, 
  User, 
  Plus,
  ChevronRight,
  Clock,
  DollarSign,
  Wallet,
  Bell,
  ArrowRight,
  X
} from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";

type DeliveryStatus = "Pronto para Entrega" | "Em Rota" | "Entregue";

interface Delivery {
  id: string;
  customer_name: string;
  address: string;
  bairro: string;
  total: number;
  payment_method: string;
  status: DeliveryStatus;
  distance?: string;
}

export default function EntregadorDashboard() {
  const [activeTab, setActiveTab] = useState("entregas");
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    { 
      id: "105", 
      customer_name: "Marcos Oliveira", 
      address: "Rua das Palmeiras, 120", 
      bairro: "Centro", 
      total: 82.50, 
      payment_method: "Cartão (Máquina)", 
      status: "Pronto para Entrega",
      distance: "1.2 km"
    },
    { 
      id: "102", 
      customer_name: "Julia Santos", 
      address: "Av. Brasil, 450", 
      bairro: "Jardim América", 
      total: 45.00, 
      payment_method: "PIX", 
      status: "Em Rota",
      distance: "3.5 km"
    }
  ]);

  const stats = {
    deliveries_count: 8,
    earnings: 48.00 // R$ 6,00 por entrega
  };

  const handleStatusChange = (id: string, newStatus: DeliveryStatus) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    
    if (newStatus === "Entregue") {
      Swal.fire({
        title: "Sucesso!",
        text: "Entrega finalizada com sucesso.",
        icon: "success",
        background: "#141414",
        color: "#fff",
        timer: 1500
      });
    }
  };

  const openGPS = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans pb-24">
      
      {/* 🛵 Header Entregador */}
      <header className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transform rotate-12">
            <Bike className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight italic">Movieats <span className="text-primary italic">Logística</span></h1>
            <div className="flex items-center gap-1 mt-0.5">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Online e Disponível</span>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black" />
        </button>
      </header>

      <main className="px-6 py-8 md:max-w-2xl md:mx-auto">
        
        {/* View Switcher based on Footer Tabs */}
        {activeTab === "entregas" && (
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-2">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Logística Local</p>
                   <h2 className="text-2xl font-black uppercase tracking-tighter italic">Entregas Pendentes</h2>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                   <p className="text-[10px] font-black uppercase text-white/40">Ganhos Hoje</p>
                   <p className="text-lg font-black text-primary italic leading-none mt-1">R$ {stats.earnings.toFixed(2)}</p>
                </div>
             </div>

             {/* 📦 Delivery Cards */}
             <div className="space-y-4">
                {deliveries.filter(d => d.status !== "Entregue").map((delivery) => (
                  <div key={delivery.id} className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:border-primary/20 transition-all group overflow-hidden relative">
                    {/* Status Badge */}
                    <div className="absolute top-0 right-0 p-3 pt-4 pr-6">
                       <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border 
                         ${delivery.status === 'Pronto para Entrega' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}
                       `}>
                         {delivery.status}
                       </span>
                    </div>

                    <div className="flex gap-4 items-start mb-6">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                       </div>
                       <div>
                          <h4 className="text-lg font-black uppercase tracking-tight italic leading-tight mb-1">{delivery.customer_name}</h4>
                          <p className="text-[11px] font-bold text-white/40 uppercase tracking-wide">{delivery.address} • <span className="text-white/60">{delivery.bairro}</span></p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">A Receber</p>
                          <p className="text-lg font-black text-primary italic">R$ {delivery.total.toFixed(2)}</p>
                       </div>
                       <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Pagamento</p>
                          <p className="text-[10px] font-black uppercase text-white tracking-widest">{delivery.payment_method}</p>
                       </div>
                    </div>

                    <div className={`grid gap-3 ${delivery.status === 'Em Rota' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                       {delivery.status === 'Pronto para Entrega' ? (
                          <button 
                            onClick={() => handleStatusChange(delivery.id, "Em Rota")}
                            className="h-14 bg-primary text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[12px] italic shadow-xl shadow-primary/20 transform active:scale-95 transition-all"
                          >
                             Começar Entrega
                             <ArrowRight className="w-5 h-5" />
                          </button>
                       ) : (
                          <>
                             <button 
                               onClick={() => openGPS(delivery.address)}
                               className="h-14 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] transform active:scale-95 transition-all"
                             >
                                <Navigation className="w-4 h-4" />
                                Abrir GPS
                             </button>
                             <button 
                               onClick={() => handleStatusChange(delivery.id, "Entregue")}
                               className="h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-900/40 transform active:scale-95 transition-all"
                             >
                                <CheckCircle2 className="w-4 h-4" />
                                Finalizar
                             </button>
                          </>
                       )}
                    </div>
                  </div>
                ))}

                {deliveries.filter(d => d.status !== "Entregue").length === 0 && (
                   <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center opacity-40">
                      <Clock className="w-12 h-12 mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">Nenhum pedido pronto no momento</p>
                      <p className="text-[10px] uppercase font-bold mt-2">Aguarde a cozinha finalizar novos pedidos...</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {activeTab === "historico" && (
           <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Suas Entregas <span className="text-primary italic">Hoje</span></h2>
              <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center justify-between opacity-60">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                             <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="text-xs font-black uppercase italic">Pedido #09{i}</h4>
                             <p className="text-[9px] font-bold uppercase text-white/40">Entregue às 18:4{i}</p>
                          </div>
                       </div>
                       <p className="text-sm font-black text-primary italic">+ R$ 6,00</p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === "perfil" && (
           <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
              <div className="bg-gradient-to-br from-primary to-orange-600 rounded-[32px] p-8 text-black relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">Ganhos Acumulados</p>
                    <h3 className="text-5xl font-black italic tracking-tighter mt-2">R$ 1.240,50</h3>
                    <div className="mt-8 flex gap-4">
                       <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                          <p className="text-[9px] font-bold uppercase opacity-60">Mesas atendidas</p>
                          <p className="text-xl font-black italic">--</p>
                       </div>
                       <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                          <p className="text-[9px] font-bold uppercase opacity-60">Entregas</p>
                          <p className="text-xl font-black italic">206</p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute -right-10 -bottom-10 opacity-10">
                    <Bike className="w-64 h-64" />
                 </div>
              </div>

              <div className="space-y-3">
                 <button className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between px-6 group active:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                       <Wallet className="w-5 h-5 text-primary" />
                       <span className="text-[11px] font-black uppercase tracking-widest italic pt-0.5">Meus Dados Bancários</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                 </button>
                 <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 active:bg-red-500/20 transition-all"
                 >
                    <span className="text-[11px] font-black uppercase tracking-widest text-red-500 italic pt-0.5">Encerrar Turno</span>
                 </button>
              </div>
           </div>
        )}
      </main>

      {/* 📱 Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-[#000000]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4">
         <button 
           onClick={() => setActiveTab("entregas")}
           className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'entregas' ? 'text-primary' : 'text-white/20 hover:text-white/50'}`}
         >
            <Bike className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Entregas</span>
         </button>
         <button 
            onClick={() => setActiveTab("historico")}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'historico' ? 'text-primary' : 'text-white/20 hover:text-white/50'}`}
         >
            <History className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Histórico</span>
         </button>
         <button 
            onClick={() => setActiveTab("perfil")}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'perfil' ? 'text-primary' : 'text-white/20 hover:text-white/50'}`}
         >
            <User className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Meus Ganhos</span>
         </button>
      </footer>

      <style jsx global>{`
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
