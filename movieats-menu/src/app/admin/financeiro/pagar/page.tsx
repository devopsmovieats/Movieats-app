"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  ArrowDownRight, 
  Calendar,
  MoreVertical,
  AlertTriangle,
  History
} from "lucide-react";

interface Pagamento {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: "PAGO" | "ABERTO" | "ATRASADO";
  categoria: string;
}

export default function PagarPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const pagamentos: Pagamento[] = [
    { id: "1", descricao: "FORNECEDOR AMBEV", valor: 2450.00, vencimento: "2026-04-12", status: "ABERTO", categoria: "Estoque" },
    { id: "2", descricao: "ALUGUEL SALA 102", valor: 3500.00, vencimento: "2026-04-10", status: "ATRASADO", categoria: "Fixas" },
    { id: "3", descricao: "ENERGIA ELÉTRICA", valor: 890.45, vencimento: "2026-04-05", status: "PAGO", categoria: "Fixas" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-5 pb-10">
        
        {/* Header Compacto */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white dark:bg-zinc-900 p-5 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-md">
              <DollarSign className="text-red-500 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">A Pagar</h2>
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase mt-1">Gestão de Saídas e Fornecedores</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-orange-600 text-white rounded-md px-5 py-2.5 hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 text-[10px] font-black uppercase tracking-widest cursor-pointer active:scale-95">
              <Plus className="w-4 h-4" /> Novo Pagamento
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase">Total em Aberto</span>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">R$ 5.950,00</h3>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase">Vencendo Hoje</span>
             <h3 className="text-2xl font-black text-orange-600 mt-2">R$ 0,00</h3>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase">Total Atrasado</span>
             <h3 className="text-2xl font-black text-red-500 mt-2">R$ 3.500,00</h3>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="BUSCAR FORNECEDOR OU DESCRIÇÃO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-md py-2.5 pl-10 pr-4 text-[10px] font-black text-slate-900 dark:text-white outline-none focus:border-orange-600 transition-all uppercase placeholder:text-slate-400"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-md px-4 py-2.5 text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:border-orange-600 transition-all">
            <Filter className="w-3.5 h-3.5" /> Filtrar Categoria
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Descrição / Fornecedor</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Vencimento</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                {pagamentos.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.descricao}</span>
                        <span className="text-[9px] text-slate-500 dark:text-zinc-600 font-bold uppercase mt-0.5">{item.categoria}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs font-black text-slate-900 dark:text-white">
                        <ArrowDownRight className="w-3 h-3 text-red-500" />
                        R$ {item.valor.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.vencimento).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border
                        ${item.status === "PAGO" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : item.status === "ATRASADO"
                          ? "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse"
                          : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        }
                      `}>
                         {item.status === "PAGO" ? <History className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                         {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button className="text-slate-300 hover:text-orange-600 transition-all p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800">
                         <MoreVertical className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
