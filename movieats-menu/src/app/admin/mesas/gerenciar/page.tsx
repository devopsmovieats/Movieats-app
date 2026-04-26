"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  LayoutGrid, 
  Search, 
  Plus, 
  Timer, 
  Wallet, 
  CircleDot, 
  Coffee, 
  CheckCircle2, 
  AlertCircle,
  Users,
  ChevronRight,
  Utensils,
  X,
  User,
  LogOut,
  ArrowRightLeft,
  DollarSign,
  QrCode,
  Download,
  Eye,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react";
import Swal from "sweetalert2";

type TableStatus = "Livre" | "Ocupada" | "Conta";

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface Table {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  totalValue?: number;
  startTime?: string;
  customerCount?: number;
  waiter?: string;
  items?: OrderItem[];
  accesses: number;
}

// Interface para comandas fechadas
interface ClosedBill {
  id: string;
  tableNumber: number;
  waiter: string;
  totalValue: number;
  closedAt: string;
  paymentMethod: string;
  customerCount: number;
}

const mockWaiters = ["Ricardo", "Amanda", "Bruno", "Juliana"];
const BASE_MENU_URL = "https://menu.movieats.com.br"; 

export default function GerenciarMesasPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filter, setFilter] = useState<"Todas" | "Ocupadas" | "Livres">("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modais
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  // Forms
  const [openFormData, setOpenFormData] = useState({ occupants: 1, waiter: mockWaiters[0] });
  const [registerFormData, setRegisterFormData] = useState({ number: "", capacity: 2 });

  useEffect(() => {
    const saved = localStorage.getItem("movieats_tables");
    if (saved) {
      setTables(JSON.parse(saved));
    } else {
      const initial: Table[] = [
        { id: "1", number: 1, status: "Ocupada", capacity: 4, totalValue: 156.90, startTime: new Date().toISOString(), customerCount: 2, waiter: "Ricardo", accesses: 12, items: [{ id: "1", name: "Hambúrguer Art", qty: 2, price: 45.00 }, { id: "2", name: "Batata Frita", qty: 1, price: 25.00 }] },
        { id: "2", number: 2, status: "Livre", capacity: 2, accesses: 8 },
        { id: "3", number: 3, status: "Conta", capacity: 4, totalValue: 342.50, startTime: new Date().toISOString(), customerCount: 4, waiter: "Amanda", accesses: 45 },
      ];
      setTables(initial);
      localStorage.setItem("movieats_tables", JSON.stringify(initial));
    }
  }, []);

  const saveToStorage = (newTables: Table[]) => {
    setTables(newTables);
    localStorage.setItem("movieats_tables", JSON.stringify(newTables));
  };

  const getTimeElapsed = (startTime?: string) => {
    if (!startTime) return "0min";
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 1000 / 60);
    if (diff < 60) return `${diff}min`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  const getQrUrl = (number: number) => {
    const menuUrl = `${BASE_MENU_URL}?mesa=${number}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
  };

  // Handlers
  const handleOpenTableBtn = (e: React.MouseEvent, table: Table) => {
    e.stopPropagation(); 
    setSelectedTable(table);
    setOpenFormData({ occupants: table.capacity, waiter: mockWaiters[0] });
    setShowOpenModal(true);
  };

  const confirmOpenTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    const updated = tables.map(t => t.id === selectedTable.id ? {
      ...t,
      status: "Ocupada" as TableStatus,
      customerCount: openFormData.occupants,
      waiter: openFormData.waiter,
      startTime: new Date().toISOString(),
      totalValue: 0,
      items: []
    } : t);

    saveToStorage(updated);
    setShowOpenModal(false);
    Swal.fire({ title: "Mesa Aberta!", icon: "success", background: "#0f0f0f", color: "#fff", timer: 1500, showConfirmButton: false });
  };

  const handleManageTableBtn = (table: Table) => {
    setSelectedTable(table);
    setShowManageModal(true);
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerFormData.number) return;
    
    const newTable: Table = {
      id: Math.random().toString(36).substr(2, 9),
      number: parseInt(registerFormData.number),
      capacity: registerFormData.capacity,
      status: "Livre",
      accesses: 0
    };
    saveToStorage([...tables, newTable]);
    setShowRegisterModal(false);
    setRegisterFormData({ number: "", capacity: 2 });
  };

  const handleCloseBill = async () => {
    if (!selectedTable) return;

    const { value: paymentMethod } = await Swal.fire({
      title: "Confirmar Pagamento",
      text: `Total: ${selectedTable.totalValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      background: "#0f0f0f",
      color: "#fff",
      input: "select",
      inputOptions: {
        Pix: "Pix",
        Cartão: "Cartão",
        Dinheiro: "Dinheiro"
      },
      inputPlaceholder: "Selecione o método",
      confirmButtonColor: "#ff6b00"
    });

    if (paymentMethod) {
      // 1. Criar Comanda Fechada
      const newClosedBill: ClosedBill = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        tableNumber: selectedTable.number,
        waiter: selectedTable.waiter || "N/A",
        totalValue: selectedTable.totalValue || 0,
        closedAt: new Date().toISOString(),
        paymentMethod: paymentMethod,
        customerCount: selectedTable.customerCount || 1
      };

      // 2. Salvar no histórico
      const existingBills = JSON.parse(localStorage.getItem("movieats_closed_bills") || "[]");
      localStorage.setItem("movieats_closed_bills", JSON.stringify([newClosedBill, ...existingBills]));

      // 3. Resetar mesa
      const updated = tables.map(t => t.id === selectedTable.id ? {
        ...t,
        status: "Livre" as TableStatus,
        totalValue: 0,
        startTime: undefined,
        customerCount: undefined,
        waiter: undefined,
        items: []
      } : t);

      saveToStorage(updated);
      setShowManageModal(false);
      
      Swal.fire({
        title: "Sucesso!",
        text: "Mesa finalizada e arquivada.",
        icon: "success",
        background: "#0f0f0f",
        color: "#fff",
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const filteredTables = tables.filter(t => {
    const matchesSearch = t.number.toString().includes(searchTerm);
    if (filter === "Todas") return matchesSearch;
    if (filter === "Ocupadas") return matchesSearch && (t.status === "Ocupada" || t.status === "Conta");
    return matchesSearch && t.status === "Livre";
  });

  const getStatusConfig = (status: TableStatus) => {
    const configs = {
      Livre: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", badge: "bg-emerald-500", label: "Disponível" },
      Ocupada: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20", badge: "bg-orange-500", label: "Ocupada" },
      Conta: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", badge: "bg-red-500", label: "Conta Solicitada" },
    };
    return configs[status];
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutGrid className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none">
                Gerenciar Mesas
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium text-white/50">Mapa operacional e gerenciamento de ocupação.</p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
            {(["Todas", "Ocupadas", "Livres"] as const).map((opt) => (
              <button key={opt} onClick={() => setFilter(opt)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${filter === opt ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}>{opt}</button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative group w-full md:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="Buscar mesa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium" />
          </div>
          <button onClick={() => setShowRegisterModal(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20 cursor-pointer">
            <Plus className="w-4 h-4" />
            Cadastrar Nova Mesa
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const config = getStatusConfig(table.status);
            return (
              <div 
                key={table.id} 
                onClick={() => handleManageTableBtn(table)}
                className={`group relative bg-black/20 border ${config.border} rounded-3xl p-6 hover:bg-black/30 transition-all duration-300 shadow-xl overflow-hidden cursor-pointer ${table.status === 'Conta' ? 'ring-2 ring-red-500/40 animate-pulse' : ''}`}
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 ${config.badge}`} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Mesa</span>
                    <span className="text-4xl font-black text-white leading-none">{table.number.toString().padStart(2, '0')}</span>
                  </div>
                  <div className={`px-2.5 py-1 ${config.bg} ${config.text} rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border ${config.border}`}>{config.label}</div>
                </div>

                {/* Contador de Acessos */}
                <div className="flex items-center gap-2 mb-6 text-[9px] font-black text-white/30 uppercase tracking-widest">
                   <Eye className="w-3.5 h-3.5 text-primary" />
                   {table.accesses} acessos
                </div>

                {table.status !== "Livre" ? (
                  <div className="space-y-4">
                    <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-3">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] font-bold"><Timer className="w-3 h-3 text-primary" /> Tempo</div>
                          <span className="text-[11px] font-black text-white">{getTimeElapsed(table.startTime)}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] font-bold"><Wallet className="w-3 h-3 text-emerald-500" /> Total</div>
                          <span className="text-[11px] font-black text-emerald-500">{table.totalValue?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                       </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold text-white/20 px-1 uppercase tracking-widest leading-none">
                       <div className="flex items-center gap-2"><User className="w-3 h-3" /> {table.waiter}</div>
                       <div className="flex items-center gap-1.5 text-primary hover:text-white transition-colors group/link">
                          GERENCIAR <ChevronRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-between text-white/20 text-[10px] font-bold uppercase tracking-widest px-1">
                       <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> {table.capacity}</div>
                       <div className="text-white/70"><QrCode className="w-3.5 h-3.5" /></div>
                    </div>
                    <button onClick={(e) => handleOpenTableBtn(e, table)} className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                       <Plus className="w-4 h-4" /> Abrir Mesa
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal: Abrir Mesa */}
        {showOpenModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer" onClick={() => setShowOpenModal(false)} />
             <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Ação Operacional</span>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">Abrir Mesa {selectedTable?.number}</h3>
                   </div>
                   <button onClick={() => setShowOpenModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={confirmOpenTable} className="p-8 space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Número de Ocupantes</label>
                         <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setOpenFormData(p => ({...p, occupants: Math.max(1, p.occupants-1)}))} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white cursor-pointer hover:bg-white/10">-</button>
                            <input type="number" value={openFormData.occupants} className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl py-3 text-center font-black text-white text-lg focus:outline-none focus:border-primary" />
                            <button type="button" onClick={() => setOpenFormData(p => ({...p, occupants: p.occupants+1}))} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white cursor-pointer hover:bg-white/10">+</button>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Selecionar Garçom</label>
                         <select value={openFormData.waiter} onChange={(e) => setOpenFormData(p => ({...p, waiter: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary transition-all cursor-pointer font-bold">
                            {mockWaiters.map(w => <option key={w} value={w} className="bg-[#0f0f0f]">{w}</option>)}
                         </select>
                      </div>
                   </div>
                   <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-primary/80 transition-all shadow-xl shadow-primary/20 cursor-pointer">Iniciar Atendimento</button>
                </form>
             </div>
          </div>
        )}

        {/* Modal: Gerenciar Mesa */}
        {showManageModal && selectedTable && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer" onClick={() => setShowManageModal(false)} />
             <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
                <div className="flex flex-col md:flex-row h-full">
                   {/* Left side: Pedidos */}
                   <div className="flex-1 p-8 space-y-6 border-b md:border-b-0 md:border-r border-white/5">
                      <div className="flex flex-col">
                         <div className="flex items-center gap-3 mb-1">
                            <span className={`w-3 h-3 rounded-full ${selectedTable.status === 'Livre' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'} border-2 border-white/20`} />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{selectedTable.status} • Garçom: {selectedTable.waiter || "N/A"}</span>
                         </div>
                         <h3 className="text-3xl font-black text-white uppercase tracking-tight">Mesa {selectedTable.number}</h3>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Resumo do Pedido</h4>
                         <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                            {(selectedTable.items || []).length > 0 ? selectedTable.items?.map(item => (
                              <div key={item.id} className="flex items-center justify-between text-xs font-bold">
                                 <div className="flex items-center gap-3">
                                    <span className="text-primary">{item.qty}x</span>
                                    <span className="text-white/80 uppercase">{item.name}</span>
                                 </div>
                                 <span className="text-white">{(item.qty * item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                              </div>
                            )) : <div className="text-center py-4 text-white/20 text-[10px] font-black uppercase tracking-widest leading-relaxed">Nenhum item lançado<br/>nesta comanda</div>}
                         </div>

                         <div className="flex items-center justify-between px-2 pt-2">
                            <span className="text-xs font-black text-white/40 uppercase">Total da Mesa</span>
                            <span className="text-2xl font-black text-white">{(selectedTable.totalValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 pt-4">
                         <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            <Plus className="w-4 h-4 text-primary" /> Lançar Novo Item
                         </button>
                         {selectedTable.status !== "Livre" && (
                            <button onClick={handleCloseBill} className="flex items-center justify-center gap-2 bg-red-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 cursor-pointer">
                               <DollarSign className="w-4 h-4" /> Finalizar Pagamento
                            </button>
                         )}
                      </div>
                   </div>

                   {/* Right side: QR Code */}
                   <div className="w-full md:w-72 bg-white/[0.02] p-8 flex flex-col items-center justify-center gap-6 border-t md:border-t-0 md:border-l border-white/5">
                      <div className="flex flex-col items-center text-center gap-1">
                         <QrCode className="text-primary w-5 h-5 mb-2" />
                         <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Autoatendimento</span>
                         <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">QR Code Exclusivo<br/>da Mesa {selectedTable.number}</p>
                      </div>

                      <div className="p-4 bg-white rounded-xl shadow-2xl relative group/qr">
                         <img 
                           src={getQrUrl(selectedTable.number)} 
                           alt="QR Code" 
                           className="w-40 h-40"
                         />
                      </div>

                      <div className="flex flex-col gap-3 w-full">
                         <a 
                           href={getQrUrl(selectedTable.number)} 
                           download={`mesa-${selectedTable.number}-qr.png`}
                           target="_blank"
                           className="flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
                         >
                            <Download className="w-3.5 h-3.5" /> Baixar QR Code
                         </a>
                         <button onClick={() => setShowManageModal(false)} className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">Voltar ao Mapa</button>
                      </div>
                   </div>
                </div>
                <button onClick={() => setShowManageModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-white/40 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
             </div>
          </div>
        )}

        {/* Modal: Cadastrar Mesa */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-pointer" onClick={() => setShowRegisterModal(false)} />
             <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-lg font-black text-white uppercase tracking-tight">Nova Mesa</h3>
                   <button onClick={() => setShowRegisterModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreateNewTable} className="p-8 space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Número da Mesa</label>
                      <input required type="number" placeholder="Ex: 11" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary font-bold placeholder:text-white/10" value={registerFormData.number} onChange={(e) => setRegisterFormData({...registerFormData, number: e.target.value})} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Capacidade (Pessoas)</label>
                      <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary font-bold" value={registerFormData.capacity} onChange={(e) => setRegisterFormData({...registerFormData, capacity: parseInt(e.target.value)})} />
                   </div>
                   <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer mt-4">Salvar Mesa</button>
                </form>
             </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
