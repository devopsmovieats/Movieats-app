"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  Calendar,
  ChevronRight,
  User,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function RelatorioVendasPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const stats = [
    { label: "Faturamento Total", value: "R$ 12.450,00", icon: DollarSign, trend: "+12%", color: "#f59e0b" },
    { label: "Ticket Médio", value: "R$ 62,25", icon: TrendingUp, trend: "+5%", color: "#ff6b00" },
    { label: "Total de Pedidos", value: "200", icon: ShoppingBag, trend: "+18%", color: "#3b82f6" },
    { label: "Pedidos Cancelados", value: "8", icon: AlertCircle, trend: "-2%", color: "#ef4444" },
  ];

  const topProducts = [
    { name: "Smash Burger Duo", sales: 145, percentage: 85 },
    { name: "Batata Rústica", sales: 98, percentage: 60 },
    { name: "Coca-Cola Zero", sales: 82, percentage: 50 },
    { name: "Pizza Calabresa", sales: 64, percentage: 40 },
    { name: "Suco de Laranja", sales: 42, percentage: 25 },
  ];

  const topClients = [
    { name: "João Silva", orders: 12, total: "R$ 850,00" },
    { name: "Maria Oliveira", orders: 9, total: "R$ 640,00" },
    { name: "Carlos Souza", orders: 7, total: "R$ 420,00" },
    { name: "Fernanda Costa", orders: 6, total: "R$ 380,00" },
    { name: "Ricardo Santos", orders: 5, total: "R$ 310,00" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header com Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase leading-none mb-1">
              Relatório de Vendas
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              Análise de desempenho e faturamento da sua operação.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 px-3 border-r border-white/10">
              <Calendar className="w-4 h-4 text-primary" />
              <input 
                type="date" 
                className="bg-transparent border-none text-[10px] text-white font-bold outline-none uppercase"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-3">
              <input 
                type="date" 
                className="bg-transparent border-none text-[10px] text-white font-bold outline-none uppercase"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-black/20 border border-white/10 p-5 rounded-2xl group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-primary/10 transition-colors" />
               <div className="flex flex-col gap-4 relative z-10">
                 <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                       {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                       {stat.trend}
                    </div>
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{stat.label}</span>
                    <h3 className="text-xl font-black text-white tracking-tight mt-1">{stat.value}</h3>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Seção de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Vendas (Mock Line Chart) */}
          <div className="bg-black/20 border border-white/10 p-6 rounded-2xl flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Vendas por Período</h3>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-[9px] font-black uppercase">Faturamento</div>
                </div>
             </div>
             
             <div className="h-64 w-full flex items-end justify-between gap-2 px-2 relative group">
                {/* Linhas de Grade de Fundo */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                   {[1,2,3,4,5].map(l => <div key={l} className="w-full border-t border-white" />)}
                </div>

                {/* Pontos/Barras do Gráfico de Linha Simulado */}
                {[45, 60, 40, 85, 70, 95, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group/point">
                     <div className="w-full relative h-48 flex items-end">
                        <div 
                          style={{ height: `${h}%` }} 
                          className="w-full bg-gradient-to-t from-primary/10 to-primary/40 rounded-t-lg transition-all duration-500 group-hover/point:to-primary group-hover/point:opacity-100"
                        />
                        <div 
                          style={{ bottom: `${h}%` }}
                          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(255,107,0,0.8)] opacity-0 group-hover/point:opacity-100 transition-opacity"
                        />
                     </div>
                     <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter">Jan {i + 1}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Gráfico de Produtos (Bar Chart) */}
          <div className="bg-black/20 border border-white/10 p-6 rounded-2xl flex flex-col gap-6">
             <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Produtos Mais Vendidos</h3>
             <div className="flex flex-col gap-5">
                {topProducts.map((product, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase">
                      <span className="text-white/70">{product.name}</span>
                      <span className="text-white">{product.sales} vendas</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 uppercase">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${product.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Tabela de Rank */}
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
           <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <User className="w-4 h-4 text-emerald-500" />
                 </div>
                 <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Top 5 Clientes</h3>
              </div>
              <button className="text-[10px] font-black text-primary hover:text-orange-400 transition-colors uppercase tracking-widest flex items-center gap-1 group">
                 Ver Todos <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
           </div>
           
           <div className="overflow-x-auto uppercase">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-white/[0.02]">
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Rank</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Cliente</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Pedidos</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Total Gasto</th>
                       <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Ações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {topClients.map((client, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                           <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black
                             ${i === 0 ? 'bg-primary text-white' : 'bg-white/5 text-white/40'}
                           `}>
                             {i + 1}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[11px] font-black text-white uppercase tracking-tight">{client.name}</span>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold text-white/60">
                           {client.orders} pedidos
                        </td>
                        <td className="px-6 py-4 text-[11px] font-black text-emerald-500">
                           {client.total}
                        </td>
                        <td className="px-6 py-4">
                           <button className="p-1 px-3 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-white/40 hover:text-white hover:border-white/20 transition-all uppercase">
                              Perfil
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
