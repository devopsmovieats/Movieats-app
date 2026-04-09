"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, 
  Eye, 
  Printer, 
  ChevronDown, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2,
  Filter,
  ChevronRight,
  User,
  ShoppingBag,
  X,
  MessageSquare,
  DollarSign,
  AlertCircle
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

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  additions?: string[];
  obs?: string;
}

interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  timestamp: string;
  paymentMethod: string;
}

const initialOrders: Order[] = [
  { 
    id: "1024", 
    clientName: "João Silva", 
    clientPhone: "5511999999999",
    items: [
      { name: "Smash Burger Duo", price: 38.90, quantity: 2, additions: ["Bacon Crocante", "Queijo Cheddar"], obs: "Sem cebola, por favor." },
      { name: "Coca-Cola Zero", price: 7.50, quantity: 1 }
    ],
    total: 85.30, 
    status: "Pendente", 
    timestamp: "15:30",
    paymentMethod: "Cartão de Crédito"
  },
  { 
    id: "1025", 
    clientName: "Maria Oliveira", 
    clientPhone: "5511888888888",
    items: [
      { name: "Batata Rústica", price: 18.00, quantity: 1, additions: ["Maionese Verde"] }
    ],
    total: 18.00, 
    status: "Preparo", 
    timestamp: "15:45",
    paymentMethod: "Pix"
  },
  { 
    id: "1026", 
    clientName: "Carlos Souza", 
    clientPhone: "5511777777777",
    items: [
      { name: "Pizza Calabresa", price: 45.90, quantity: 3, obs: "Bem passada." }
    ],
    total: 137.70, 
    status: "Entrega", 
    timestamp: "15:20",
    paymentMethod: "Dinheiro"
  },
];

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos">("Todos");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  
  // Detalhes do Pedido (Modal)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Sincronização de Status da Loja
  useEffect(() => {
    const checkStoreStatus = () => {
      const saved = localStorage.getItem("movieats_store_open");
      if (saved !== null) setIsStoreOpen(saved === "true");
    };

    checkStoreStatus();
    // Opcional: listener para mudanças em outras abas
    window.addEventListener('storage', checkStoreStatus);
    return () => window.removeEventListener('storage', checkStoreStatus);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    if (viewingOrder?.id === orderId) {
      setViewingOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    Toast.fire({
      icon: "success",
      title: `Pedido #${orderId} movido para ${newStatus}`
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id.includes(searchQuery);
    const matchesStatus = statusFilter === "Todos" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case "Pendente": return "bg-white/5 border-white/10 text-white/60";
      case "Preparo": return "bg-orange-500/10 border-orange-500/20 text-orange-500";
      case "Entrega": return "bg-blue-500/10 border-blue-500/20 text-blue-500";
      case "Finalizado": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Pendente": return <Clock className="w-3 h-3" />;
      case "Preparo": return <Package className="w-3 h-3 text-orange-500" />;
      case "Entrega": return <Truck className="w-3 h-3 text-blue-500" />;
      case "Finalizado": return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none">
                Gestão de Pedidos
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Controle total da operação em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Loja Online</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px] ${
                  isStoreOpen 
                    ? 'bg-emerald-500 animate-pulse shadow-emerald-500/50' 
                    : 'bg-red-500 shadow-red-500/50'
                }`} />
                <span className={`text-sm font-black uppercase tracking-tighter transition-colors ${isStoreOpen ? 'text-white' : 'text-red-500'}`}>
                  {isStoreOpen ? 'Aberta' : 'Fechada'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="glass border border-white/5 rounded-[8px] p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full max-w-xs group cursor-text">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg py-3 pl-11 pr-4 text-xs text-white placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>

          <div className="relative group/dropdown">
            <button 
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center bg-white/[0.03] border border-white/5 rounded-lg py-3 px-10 text-xs text-white font-bold focus:outline-none focus:border-primary/50 transition-all cursor-pointer uppercase tracking-tight relative min-w-[180px] text-left"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 border-r border-white/10 pr-3">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              {statusFilter}
              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-transform ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusFilterOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setIsStatusFilterOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-[8px] shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col py-1">
                    {["Todos", "Pendente", "Preparo", "Entrega", "Finalizado"].map((s) => (
                      <button 
                        key={s}
                        onClick={() => { setStatusFilter(s as any); setIsStatusFilterOpen(false); }}
                        className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-wider transition-colors
                          ${statusFilter === s ? 'bg-primary/10 text-primary' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                        `}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Monitorando: <span className="text-white ml-1">{orders.length}</span>
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass border border-white/5 rounded-[8px] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">ID/Hora</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Cliente</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Resumo</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Total</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white group-hover:text-primary transition-colors">#{order.id}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5 tracking-widest">{order.timestamp}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                          <User className="w-3.5 h-3.5 text-white/30 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-[11px] font-bold text-white uppercase tracking-tight">{order.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] text-white/50 font-medium line-clamp-1 max-w-[250px] uppercase tracking-tighter">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[13px] font-black text-primary tracking-tighter">
                        R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.15em]
                            ${getStatusStyle(order.status)}
                          `}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setViewingOrder(order); setIsDetailsModalOpen(true); }}
                          className="p-2.5 rounded-lg bg-white/5 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-white/5 hover:border-primary/20 transition-all cursor-pointer group/btn" 
                          title="Ver Detalhes"
                        >
                          <Eye className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => window.print()}
                          className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5 transition-all cursor-pointer group/btn" 
                          title="Imprimir Cupom"
                        >
                          <Printer className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Pedido - Elite DNA */}
      {isDetailsModalOpen && viewingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsDetailsModalOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-[#141414] border border-white/10 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-500 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Pedido #{viewingOrder.id}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{viewingOrder.timestamp}</span>
                    <span className="text-[10px] font-black text-white/20">•</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{viewingOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Cliente Section */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                     <User className="w-5 h-5 text-primary" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[12px] font-black text-white uppercase tracking-tight">{viewingOrder.clientName}</span>
                     <span className="text-[10px] text-muted-foreground font-medium">{viewingOrder.clientPhone}</span>
                   </div>
                </div>
                <a 
                  href={`https://wa.me/${viewingOrder.clientPhone}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>

              {/* Itens do Pedido */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Itens do Pedido</h4>
                </div>
                
                <div className="space-y-3">
                  {viewingOrder.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-primary text-white text-[11px] font-black rounded-lg">{item.quantity}x</span>
                          <span className="text-xs font-black text-white uppercase tracking-tight mt-0.5">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-primary">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      {/* Adicionais & Obs */}
                      {(item.additions || item.obs) && (
                        <div className="pl-9 space-y-2 border-l border-white/10 ml-3">
                          {item.additions?.map((add, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <PlusCircle className="w-2.5 h-2.5 text-primary/50" />
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{add}</span>
                            </div>
                          ))}
                          {item.obs && (
                            <div className="flex items-start gap-2 pt-1">
                               <AlertCircle className="w-3 h-3 text-orange-500/50 mt-0.5" />
                               <span className="text-[10px] font-medium text-orange-400 italic">"{item.obs}"</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>R$ {(viewingOrder.total - 5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span>Taxa de Entrega</span>
                  <span>R$ 5,00</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-black text-white uppercase">Total</span>
                  <span className="text-lg font-black text-primary">R$ {viewingOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Footer / Ações de Status */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
              <div className="grid grid-cols-3 gap-3">
                <button 
                  disabled={viewingOrder.status === "Preparo"}
                  onClick={() => updateOrderStatus(viewingOrder.id, "Preparo")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${viewingOrder.status === "Preparo" 
                      ? 'bg-orange-500 text-white cursor-not-allowed opacity-50 shadow-none' 
                      : 'bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white shadow-xl shadow-orange-500/5 hover:shadow-orange-500/20'}
                  `}
                >
                  <Package className="w-4 h-4" />
                  Iniciar Preparo
                </button>
                <button 
                  disabled={viewingOrder.status === "Entrega"}
                  onClick={() => updateOrderStatus(viewingOrder.id, "Entrega")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${viewingOrder.status === "Entrega" 
                      ? 'bg-blue-500 text-white cursor-not-allowed opacity-50 shadow-none' 
                      : 'bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white shadow-xl shadow-blue-500/5 hover:shadow-blue-500/20'}
                  `}
                >
                  <Truck className="w-4 h-4" />
                  Despachar
                </button>
                <button 
                  disabled={viewingOrder.status === "Finalizado"}
                  onClick={() => updateOrderStatus(viewingOrder.id, "Finalizado")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${viewingOrder.status === "Finalizado" 
                      ? 'bg-emerald-500 text-white cursor-not-allowed opacity-50 shadow-none' 
                      : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white shadow-xl shadow-emerald-500/5 hover:shadow-emerald-500/20'}
                  `}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finalizar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

// Pequeno componente interno para manter o código limpo
function PlusCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
