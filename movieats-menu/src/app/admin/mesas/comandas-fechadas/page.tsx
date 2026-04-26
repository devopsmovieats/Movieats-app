"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ClipboardList, 
  Search, 
  User, 
  Calendar, 
  LayoutGrid, 
  Trash2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  Filter
} from "lucide-react";

interface ClosedBill {
  id: string;
  tableNumber: number;
  waiter: string;
  totalValue: number;
  closedAt: string;
  paymentMethod: string;
  customerCount: number;
}

export default function ComandasFechadasPage() {
  const [bills, setBills] = useState<ClosedBill[]>([]);
  const [filteredBills, setFilteredBills] = useState<ClosedBill[]>([]);
  
  // Filtros
  const [filterWaiter, setFilterWaiter] = useState("Todos");
  const [filterTable, setFilterTable] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("movieats_closed_bills");
    if (saved) {
      const parsed = JSON.parse(saved);
      setBills(parsed);
      setFilteredBills(parsed);
    }
  }, []);

  useEffect(() => {
    let result = [...bills];

    if (filterWaiter !== "Todos") {
      result = result.filter(b => b.waiter === filterWaiter);
    }

    if (filterTable) {
      result = result.filter(b => b.tableNumber.toString().includes(filterTable));
    }

    if (filterDateStart) {
      result = result.filter(b => b.closedAt >= filterDateStart);
    }

    if (filterDateEnd) {
      // Adicionar um dia para incluir a data final inteira se for apenas data sem hora
      result = result.filter(b => b.closedAt <= filterDateEnd + "T23:59:59");
    }

    setFilteredBills(result);
  }, [filterWaiter, filterTable, filterDateStart, filterDateEnd, bills]);

  const totalRevenue = filteredBills.reduce((acc, b) => acc + b.totalValue, 0);
  const totalBills = filteredBills.length;

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "Pix": return <Smartphone className="w-3 h-3" />;
      case "Cartão": return <CreditCard className="w-3 h-3" />;
      case "Dinheiro": return <Banknote className="w-3 h-3" />;
      default: return <DollarSign className="w-3 h-3" />;
    }
  };

  const uniqueWaiters = ["Todos", ...Array.from(new Set(bills.map(b => b.waiter)))];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardList className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none">
                Comandas Fechadas
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-medium text-white/50">Histórico de faturamento e atendimentos finalizados.</p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-black/20 border border-white/5 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div>
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Total de Comandas</span>
                 <h3 className="text-3xl font-black text-white">{totalBills}</h3>
              </div>
              <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                 <ClipboardList className="w-6 h-6 text-primary" />
              </div>
           </div>

           <div className="bg-black/20 border border-emerald-500/10 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
              <div>
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Faturamento Total</span>
                 <h3 className="text-3xl font-black text-emerald-500">{totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                 <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
           </div>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-black/20 border border-white/5 p-6 rounded-2xl space-y-6">
           <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Filtros de Busca</span>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Garçom</label>
                 <select 
                    value={filterWaiter} 
                    onChange={(e) => setFilterWaiter(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all cursor-pointer font-bold"
                 >
                    {uniqueWaiters.map(w => <option key={w} value={w} className="bg-[#0f0f0f]">{w}</option>)}
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Mesa</label>
                 <input 
                    type="number" 
                    placeholder="Ex: 05"
                    value={filterTable}
                    onChange={(e) => setFilterTable(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primary font-bold placeholder:text-white/10"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Data Início</label>
                 <input 
                    type="date" 
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primary font-bold"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Data Fim</label>
                 <input 
                    type="date" 
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-primary font-bold"
                 />
              </div>
           </div>
        </div>

        {/* Tabela de Comandas */}
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                       <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">ID Comanda</th>
                       <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Mesa</th>
                       <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Garçom</th>
                       <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">VALOR TOTAL</th>
                       <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">DATA/HORA</th>
                       <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">PAGAMENTO</th>
                    </tr>
                 </thead>
                 <tbody>
                    {filteredBills.map((bill) => (
                       <tr key={bill.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                             <span className="text-[10px] font-black text-white/40 font-mono tracking-wider group-hover:text-primary transition-colors">#{bill.id}</span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <span className="bg-white/5 p-1 rounded-md text-white/40"><LayoutGrid className="w-3 h-3" /></span>
                                <span className="text-sm font-black text-white">Mesa {bill.tableNumber.toString().padStart(2, '0')}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white/70">{bill.waiter}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm font-black text-emerald-500">
                                {bill.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-white/80">
                                   {new Date(bill.closedAt).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                   {new Date(bill.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg w-fit">
                                <span className="text-primary">{getPaymentIcon(bill.paymentMethod)}</span>
                                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">{bill.paymentMethod}</span>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {filteredBills.length === 0 && (
              <div className="p-20 flex flex-col items-center justify-center gap-4 opacity-20">
                 <ClipboardList className="w-12 h-12" />
                 <span className="text-xs font-black uppercase tracking-[0.3em]">Nenhuma comanda encontrada</span>
              </div>
           )}
        </div>

      </div>
    </DashboardLayout>
  );
}
