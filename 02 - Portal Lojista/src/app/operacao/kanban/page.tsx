"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  MoreHorizontal,
  User,
  ShoppingBag,
  Calendar
} from "lucide-react";
import Swal from "sweetalert2";

// Configuração do Toast
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#141414",
  color: "#fff",
  customClass: {
    popup: "rounded-xl border border-white/5 shadow-2xl shadow-black/50"
  }
});

type OrderStatus = "Pendente" | "Preparo" | "Entrega" | "Finalizado";

interface Order {
  id: string;
  clientName: string;
  itemsSummary: string;
  status: OrderStatus;
  createdAt: number; // timestamp
}

const initialOrders: Order[] = [
  { id: "1024", clientName: "João Silva", itemsSummary: "2x Smash Duo, 1x Coca", status: "Pendente", createdAt: Date.now() - 1000 * 60 * 5 },
  { id: "1025", clientName: "Maria Oliveira", itemsSummary: "1x Batata Rústica", status: "Preparo", createdAt: Date.now() - 1000 * 60 * 15 },
  { id: "1026", clientName: "Carlos Souza", itemsSummary: "3x Pizza Calabresa", status: "Entrega", createdAt: Date.now() - 1000 * 60 * 30 },
  { id: "1027", clientName: "Fernanda Costa", itemsSummary: "1x Suco Laranja", status: "Pendente", createdAt: Date.now() - 1000 * 60 * 2 },
];

const COLUMNS: { id: OrderStatus; label: string; color: string; icon: any }[] = [
  { id: "Pendente", label: "Pendentes", color: "#f59e0b", icon: Clock },
  { id: "Preparo", label: "Em Preparo", color: "#ff6b00", icon: Package },
  { id: "Entrega", label: "Para Entrega", color: "#3b82f6", icon: Truck },
  { id: "Finalizado", label: "Finalizados", color: "#10b981", icon: CheckCircle2 },
];

export default function KanbanPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

  // Carregar do LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("movieats_orders");
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      localStorage.setItem("movieats_orders", JSON.stringify(initialOrders));
    }
  }, []);

  // Timer para atualização dos cronômetros
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000); // atualiza a cada minuto
    return () => clearInterval(timer);
  }, []);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.setData("orderId", orderId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: OrderStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId") || draggedOrderId;
    
    if (!orderId) return;

    setOrders(prev => {
      const updated = prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      localStorage.setItem("movieats_orders", JSON.stringify(updated));
      return updated;
    });

    setDraggedOrderId(null);
    Toast.fire({
      icon: "success",
      title: `Pedido #${orderId} movido para ${newStatus}`
    });
  };

  const getElapsedTime = (createdAt: number) => {
    const diffInMinutes = Math.floor((Date.now() - createdAt) / 60000);
    if (diffInMinutes < 1) return "Agora";
    return `${diffInMinutes} min`;
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Kanban */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none">
                Quadro de Operação
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Gestão visual do fluxo de produção e entrega.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase text-muted-foreground tracking-widest">
               Total: {orders.length} Pedidos
             </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar-h no-scrollbar">
          {COLUMNS.map((col) => (
            <div 
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex-1 min-w-[300px] flex flex-col bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden group/column"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-white/5 bg-white/[0.02] relative">
                <div 
                  className="absolute bottom-0 left-0 h-[2px] w-full" 
                  style={{ backgroundColor: `${col.color}40` }}
                />
                <div 
                  className="absolute bottom-0 left-0 h-[2px] w-12 transition-all group-hover/column:w-full duration-500" 
                  style={{ backgroundColor: col.color }}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${col.color}15`, color: col.color }}>
                      <col.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.15em]">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-white/20 bg-white/5 px-2 py-0.5 rounded-full">
                    {orders.filter(o => o.status === col.id).length}
                  </span>
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {orders
                  .filter(o => o.status === col.id)
                  .map((order) => (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order.id)}
                      className="bg-[#141414] border border-white/5 p-4 rounded-xl shadow-lg cursor-grab active:cursor-grabbing hover:border-white/20 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-white/20 hover:text-white" />
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">#{order.id}</span>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                            <Clock className="w-3 h-3 text-white/10" />
                            {getElapsedTime(order.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                            <User className="w-3.5 h-3.5 text-white/20" />
                          </div>
                          <span className="text-[11px] font-black text-white uppercase tracking-tight truncate">{order.clientName}</span>
                        </div>

                        <div className="pl-9 relative">
                          <div className="absolute left-3.5 top-0 bottom-0 w-[1px] bg-white/5" />
                          <p className="text-[10px] text-white/40 font-medium line-clamp-2 uppercase tracking-tighter leading-relaxed">
                            {order.itemsSummary}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                }
                
                {/* Empty State */}
                {orders.filter(o => o.status === col.id).length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl opacity-20 gap-3">
                    <ShoppingBag className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Sem pedidos</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </DashboardLayout>
  );
}
