"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  Utensils
} from "lucide-react";

const metrics = [
  { 
    title: "Pedidos Hoje", 
    value: "124", 
    change: "+18%", 
    trend: "up", 
    icon: ShoppingBag,
    color: "primary"
  },
  { 
    title: "Vendas (R$)", 
    value: "R$ 4.280", 
    change: "+12%", 
    trend: "up", 
    icon: DollarSign,
    color: "emerald"
  },
  { 
    title: "Ticket Médio", 
    value: "R$ 34,50", 
    change: "+5%", 
    trend: "up", 
    icon: TrendingUp,
    color: "blue"
  },
  { 
    title: "Itens Pausados", 
    value: "3", 
    change: "Cardápio", 
    trend: "neutral", 
    icon: AlertCircle,
    color: "red"
  },
];

const orders = [
  { id: "#4892", customer: "Ricardo Alvez", time: "Há 2 min", total: "R$ 84,90", status: "PREPARANDO" },
  { id: "#4891", customer: "Marina Sousa", time: "Há 12 min", total: "R$ 42,00", status: "NOVO" },
  { id: "#4890", customer: "Carlos Silveira", time: "Há 25 min", total: "R$ 112,50", status: "SAIU PARA ENTREGA" },
];

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-headline font-black text-white flex items-center gap-3">
              Olá, Villa Gourmet <span className="animate-bounce">🔥</span>
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm font-medium">
              Sua operação está <strong className="text-emerald-500">100% ativa</strong> e recebendo novos pedidos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Resumo Operacional</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div 
              key={m.title} 
              className="bg-card border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-[150px] transition-all duration-300 hover:scale-[1.02] cursor-default group"
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors`}>
                  <m.icon className={`w-4 h-4 ${m.color === "primary" ? "text-primary" : "text-white"}`} />
                </div>
                <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                  m.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-white/10 text-muted-foreground"
                }`}>
                  {m.change} {m.trend === "up" ? "↗" : ""}
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  {m.title}
                </p>
                <h3 className="text-2xl font-headline font-black text-white">{m.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Section */}
          <div className="lg:col-span-2 bg-card border border-white/5 rounded-2xl p-7">
            <div className="flex justify-between items-center mb-7">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-lg font-headline font-black text-white">Últimos Pedidos</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Tempo real</p>
              </div>
              <button className="text-[10px] font-black text-primary hover:underline underline-offset-4 uppercase tracking-widest transition-all">Ver todos</button>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-white text-xs">
                      {order.id}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white">{order.customer}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{order.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-white">{order.total}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded mt-1 ${
                        order.status === "NOVO" ? "bg-primary text-white" : 
                        order.status === "PREPARANDO" ? "bg-amber-500/10 text-amber-500" : 
                        "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Chart Placeholder */}
          <div className="bg-card border border-white/5 rounded-2xl p-7 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-headline font-black text-white">Desempenho de Vendas</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acompanhamento Semanal</span>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 group">
              <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                Gráfico de Vendas (Em breve)
              </span>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
