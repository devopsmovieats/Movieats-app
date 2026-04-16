"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Boxes, 
  Plus, 
  Minus, 
  Search, 
  Trash2, 
  Pencil, 
  AlertTriangle, 
  Calendar,
  Filter,
  ChevronRight,
  Package2,
  X,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Warehouse,
  ArrowRight,
  FileText
} from "lucide-react";
import Swal from "sweetalert2";

interface Insumo {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  expiryDate: string;
  category: string;
}

interface LogEntry {
  id: string;
  date: string;
  user: string;
  item: string;
  change: number;
  unit: string;
  reason: string;
  type: "ENTRADA" | "SAÍDA";
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

export default function AlmoxarifadoPage() {
  const [activeTab, setActiveTab] = useState<"current" | "logs">("current");
  const [inventory, setInventory] = useState<Insumo[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TODOS");
  const [userRole, setUserRole] = useState<string>("ADMIN");

  // Estados para Modais
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [adjustmentModal, setAdjustmentModal] = useState<{
    isOpen: boolean;
    item?: Insumo;
    reason: string;
  }>({
    isOpen: false,
    reason: "Consumo Interno"
  });

  const [newItem, setNewItem] = useState({
    name: "",
    brand: "",
    quantity: 0,
    unit: "un",
    minQuantity: 0,
    expiryDate: "",
    category: "Mercearia"
  });

  useEffect(() => {
    const savedInv = localStorage.getItem("movieats_inventory");
    const savedLogs = localStorage.getItem("movieats_inventory_logs");
    const userSaved = localStorage.getItem("movieats_user");
    
    if (savedInv) setInventory(JSON.parse(savedInv));
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    if (userSaved) {
      const user = JSON.parse(userSaved);
      if (user.role) setUserRole(user.role);
    }

    if (!savedInv) {
      const initial: Insumo[] = [
        { id: "1", name: "FARINHA DE TRIGO", brand: "PURIFICA", quantity: 25, unit: "kg", minQuantity: 30, expiryDate: "2026-05-20", category: "Mercearia" },
        { id: "2", name: "MOLHO DE TOMATE", brand: "POMAROLA", quantity: 15, unit: "un", minQuantity: 10, expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: "Molhos" },
        { id: "3", name: "ÓLEO DE SOJA", brand: "LIZA", quantity: 5, unit: "lt", minQuantity: 15, expiryDate: "2026-12-15", category: "Gorduras" }
      ];
      setInventory(initial);
      localStorage.setItem("movieats_inventory", JSON.stringify(initial));
    }
  }, []);

  const handleAddLog = (item: string, change: number, unit: string, reason: string, type: "ENTRADA" | "SAÍDA") => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString("pt-BR"),
      user: "Admin Lojista",
      item,
      change,
      unit,
      reason,
      type
    };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem("movieats_inventory_logs", JSON.stringify(newLogs));
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.brand) return;

    const item: Insumo = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem,
      name: newItem.name.toUpperCase(),
      brand: newItem.brand.toUpperCase()
    };

    const newList = [...inventory, item];
    setInventory(newList);
    localStorage.setItem("movieats_inventory", JSON.stringify(newList));
    
    handleAddLog(item.name, item.quantity, item.unit, "Entrada Inicial", "ENTRADA");
    
    setIsItemModalOpen(false);
    setNewItem({ name: "", brand: "", quantity: 0, unit: "un", minQuantity: 0, expiryDate: "", category: "Mercearia" });
    Toast.fire({ icon: "success", title: "Insumo cadastrado!", iconColor: "#ea580c" });
  };

  const incrementStock = (id: string) => {
    const newList = inventory.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + 1;
        handleAddLog(item.name, 1, item.unit, "Entrada de Mercadoria", "ENTRADA");
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setInventory(newList);
    localStorage.setItem("movieats_inventory", JSON.stringify(newList));
    Toast.fire({ icon: "success", title: "Entrada registrada!", iconColor: "#ea580c" });
  };

  const openAdjustmentModal = (item: Insumo) => {
    setAdjustmentModal({ isOpen: true, item, reason: "Consumo Interno" });
  };

  const confirmAdjustment = () => {
    if (!adjustmentModal.item) return;
    const { item, reason } = adjustmentModal;
    
    if (item.quantity <= 0) {
      Toast.fire({ icon: "error", title: "Estoque insuficiente!", iconColor: "#ef4444" });
      setAdjustmentModal({ ...adjustmentModal, isOpen: false });
      return;
    }

    const newList = inventory.map(i => {
      if (i.id === item.id) {
        const newQty = i.quantity - 1;
        handleAddLog(i.name, -1, i.unit, reason, "SAÍDA");
        return { ...i, quantity: newQty };
      }
      return i;
    });

    setInventory(newList);
    localStorage.setItem("movieats_inventory", JSON.stringify(newList));
    setAdjustmentModal({ ...adjustmentModal, isOpen: false });
    Toast.fire({ icon: "success", title: "Saída registrada!", iconColor: "#ef4444" });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Remover Insumo?",
      text: "Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        const newList = inventory.filter(item => item.id !== id);
        setInventory(newList);
        localStorage.setItem("movieats_inventory", JSON.stringify(newList));
        Toast.fire({ icon: "success", title: "Insumo removido!" });
      }
    });
  };

  const getExpiryStatus = (date: string) => {
    const today = new Date();
    const expiry = new Date(date);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: "Vencido", color: "text-red-600 bg-red-600/10 border-red-600/20" };
    if (diffDays <= 7) return { label: `Vence em ${diffDays}d`, color: "text-red-500 bg-red-500/10 border-red-500/20 animate-pulse" };
    return { label: new Date(date).toLocaleDateString("pt-BR"), color: "text-slate-500 dark:text-zinc-600" };
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "TODOS" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-5 pb-10 print:p-0">
        
        {/* Header Compacto - Oculto na Impressão */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white dark:bg-zinc-900 p-5 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600/10 rounded-md">
              <Boxes className="text-orange-600 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">Almoxarifado</h2>
              <div className="flex items-center gap-2 mt-1">
                 <button 
                  onClick={() => setActiveTab("current")}
                  className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md transition-all ${activeTab === 'current' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                 >
                   📦 Estoque Atual
                 </button>
                 <button 
                  onClick={() => setActiveTab("logs")}
                  className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md transition-all ${activeTab === 'logs' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                 >
                   📋 Logs de Atividade
                 </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-md px-4 py-2.5 hover:bg-orange-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
             >
                <FileText className="w-4 h-4" /> Relatório
             </button>
             <button 
              onClick={() => setIsItemModalOpen(true)}
              className="flex items-center gap-2 bg-orange-600 text-white rounded-md px-5 py-2.5 hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95"
             >
              <Plus className="w-4 h-4" /> Novo Item
            </button>
          </div>
        </div>

        {/* Filtros - Ocultos na Impressão */}
        {activeTab === 'current' && (
          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm print:hidden">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="BUSCAR INSUMO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-md py-2.5 pl-10 pr-4 text-[10px] font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase placeholder:text-slate-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-md py-2.5 pl-10 pr-8 text-[10px] font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 appearance-none cursor-pointer uppercase transition-all"
              >
                <option value="TODOS">TODAS CATEGORIAS</option>
                <option value="Mercearia">Mercearia</option>
                <option value="Molhos">Molhos</option>
                <option value="Gorduras">Gorduras</option>
                <option value="Proteínas">Proteínas</option>
              </select>
            </div>
          </div>
        )}

        {/* TABELAS E LOGS AQUI ... (Omitido para brevidade no diff, mas mantido na execução) */}
        {activeTab === 'current' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden shadow-sm print:hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Item / Marca</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estoque Atual</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Vencimento</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                  {filteredInventory.map((item) => {
                    const isLowStock = item.quantity <= item.minQuantity;
                    const expiryStatus = getExpiryStatus(item.expiryDate);
                    return (
                      <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</span>
                            <span className="text-[9px] text-slate-500 dark:text-zinc-600 font-bold uppercase mt-0.5">{item.brand} • {item.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                               <span className={`text-sm font-black ${isLowStock ? 'text-orange-600' : 'text-slate-900 dark:text-white'}`}>
                                  {item.quantity}{item.unit}
                               </span>
                               {isLowStock && (
                                 <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-md text-[8px] font-black uppercase tracking-widest">Reposição</span>
                               )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openAdjustmentModal(item)} className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-red-500 hover:text-white rounded-md transition-all cursor-pointer"><Minus className="w-3 h-3" /></button>
                              <button onClick={() => incrementStock(item.id)} className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:bg-emerald-600 hover:text-white rounded-md transition-all cursor-pointer"><Plus className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black"><span className={expiryStatus.color + " px-2 py-1 rounded-md"}>{expiryStatus.label}</span></td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex items-center justify-center gap-3">
                              <button className="text-slate-300 hover:text-blue-500 transition-all cursor-pointer"><Pencil className="w-4 h-4" /></button>
                              {userRole !== "GERENTE" && (
                                <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                              )}
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden shadow-sm animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print:text-black">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 print:bg-gray-100">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-black">Data/Hora</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-black">Operação</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-black">Item</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-black">Justificativa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-all print:border-b print:border-gray-200">
                      <td className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-600 print:text-black">{log.date}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase ${log.type === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                           {log.type === 'ENTRADA' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                           {log.change}{log.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-slate-800 dark:text-white print:text-black uppercase">{log.item}</td>
                      <td className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-zinc-500 print:text-black uppercase italic">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NOVO INSUMO */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md w-full max-w-lg p-6 shadow-2xl scale-in duration-300">
             <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Warehouse className="text-orange-600 w-4 h-4" />
                  Novo Cadastro de Insumo
                </h3>
                <button onClick={() => setIsItemModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
             </div>

             <form onSubmit={handleSaveItem} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome do Insumo</label>
                    <input 
                      type="text" required
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 uppercase transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Marca</label>
                    <input 
                      type="text" required
                      value={newItem.brand}
                      onChange={(e) => setNewItem({...newItem, brand: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 uppercase transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Categoria</label>
                    <select 
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 appearance-none cursor-pointer"
                    >
                      <option value="Mercearia">Mercearia</option>
                      <option value="Molhos">Molhos</option>
                      <option value="Gorduras">Gorduras</option>
                      <option value="Proteínas">Proteínas</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Unidade</label>
                    <select 
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 appearance-none cursor-pointer"
                    >
                      <option value="un">Unidade (un)</option>
                      <option value="kg">Quilo (kg)</option>
                      <option value="lt">Litro (lt)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Qtd Inicial</label>
                    <input 
                      type="number" required
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estoque Mínimo</label>
                    <input 
                      type="number" required
                      value={newItem.minQuantity}
                      onChange={(e) => setNewItem({...newItem, minQuantity: Number(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vencimento</label>
                    <input 
                      type="date" required
                      value={newItem.expiryDate}
                      onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-zinc-800 rounded-md hover:bg-slate-50 transition-all cursor-pointer"
                   >
                     Cancelar
                   </button>
                   <button 
                    type="submit"
                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-all shadow-lg shadow-orange-600/30 cursor-pointer flex items-center justify-center gap-2"
                   >
                     Salvar Insumo <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL DE JUSTIFICATIVA (SAÍDA) */}
      {adjustmentModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md w-full max-w-sm p-6 shadow-2xl scale-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="text-orange-600 w-4 h-4" />
                Justificar Saída
              </h3>
              <button onClick={() => setAdjustmentModal({ ...adjustmentModal, isOpen: false })} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-md border border-slate-100 dark:border-zinc-700">
                 <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest">Item Selecionado</p>
                 <p className="text-xs font-black text-slate-900 dark:text-white uppercase mt-1">{adjustmentModal.item?.name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Motivo da Saída</label>
                <select 
                  value={adjustmentModal.reason}
                  onChange={(e) => setAdjustmentModal({ ...adjustmentModal, reason: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-md py-3 px-4 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase appearance-none cursor-pointer"
                >
                  <option value="Perda/Vencimento">Perda / Vencimento</option>
                  <option value="Consumo Interno">Consumo Interno</option>
                  <option value="Erro de Inventário">Erro de Inventário</option>
                </select>
              </div>

              <div className="pt-2">
                <button 
                  onClick={confirmAdjustment}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 rounded-md transition-all shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  Confirmar Ajuste (-1 {adjustmentModal.item?.unit})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS PARA IMPRESSÃO */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; }
          aside, header, nav, .print-hidden { display: none !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
