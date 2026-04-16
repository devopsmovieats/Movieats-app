"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Filter,
  ArrowRight,
  Download
} from "lucide-react";

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("ABRIL 2026");

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6 pb-10">
        
        {/* Header Compacto */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white dark:bg-zinc-900 p-5 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-md">
              <BarChart3 className="text-blue-500 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">Relatório Financeiro</h2>
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase mt-1">Análise de Performance e Lucratividade</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-md px-4 py-2.5 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Filtro de Período */}
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
           <Calendar className="w-4 h-4 text-slate-400" />
           <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{periodo}</span>
           <button className="ml-auto text-[9px] font-black text-orange-600 uppercase tracking-widest hover:underline flex items-center gap-1">
             Alterar Período <Filter className="w-3 h-3" />
           </button>
        </div>

        {/* Grid de Indicadores Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-12 h-12 text-emerald-500" />
             </div>
             <span className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase">Receita Bruta</span>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">R$ 42.580,00</h3>
             <div className="flex items-center gap-1 mt-2">
                <span className="text-[9px] font-black text-emerald-500">+12.5%</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-600 uppercase">vs mês ant.</span>
             </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingDown className="w-12 h-12 text-red-500" />
             </div>
             <span className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase">Despesas Totais</span>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">R$ 18.240,00</h3>
             <div className="flex items-center gap-1 mt-2">
                <span className="text-[9px] font-black text-red-500">+5.2%</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-600 uppercase">vs mês ant.</span>
             </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-12 h-12 text-blue-500" />
             </div>
             <span className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase">Lucro Líquido</span>
             <h3 className="text-2xl font-black text-blue-500 mt-2">R$ 24.340,00</h3>
             <div className="flex items-center gap-1 mt-2">
                <span className="text-[9px] font-black text-blue-500">57.1%</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-600 uppercase">Margem</span>
             </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowRight className="w-12 h-12 text-orange-600" />
             </div>
             <span className="text-[9px] font-black text-slate-400 dark:text-zinc-700 tracking-[0.2em] uppercase">Ticket Médio</span>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">R$ 84,20</h3>
             <div className="flex items-center gap-1 mt-2">
                <span className="text-[9px] font-black text-emerald-500">+2.30</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-600 uppercase">Período</span>
             </div>
          </div>
        </div>

        {/* Placeholder de Gráfico e Listas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Top Categorias de Gasto</h4>
              <div className="space-y-4">
                 {[
                   { label: "INSUMOS E ESTOQUE", valor: 65, color: "bg-orange-600" },
                   { label: "PESSOAL E SALÁRIOS", valor: 25, color: "bg-blue-500" },
                   { label: "ALUGUEL E TAXAS", valor: 10, color: "bg-slate-400" },
                 ].map((cat) => (
                   <div key={cat.label} className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                         <span className="text-slate-500">{cat.label}</span>
                         <span className="text-slate-900 dark:text-white">{cat.valor}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                         <div className={`h-full ${cat.color} transition-all duration-1000`} style={{ width: `${cat.valor}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white dark:bg-zinc-900 p-6 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Resumo de Meios de Pagamento</h4>
              <div className="space-y-4">
                 {[
                   { label: "PIX", valor: 18450.00, perc: 43 },
                   { label: "CARTÃO DE CRÉDITO", valor: 12500.00, perc: 29 },
                   { label: "DINHEIRO", valor: 11630.00, perc: 28 },
                 ].map((metodo) => (
                   <div key={metodo.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-md border border-slate-100 dark:border-zinc-800">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{metodo.label}</span>
                         <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{metodo.perc}% das vendas</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">R$ {metodo.valor.toFixed(2)}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
