"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    ordersCount: 0,
    totalSales: 0,
    avgTicket: 0,
    pausedItems: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setEstablishmentId(session.user.id);
      }
    };
    getSession();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!establishmentId) return;
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Pedidos hoje
        const { count: ordersCount } = await supabase
          .from('bd_pedidos')
          .select('*', { count: 'exact', head: true })
          .eq('establishment_id', establishmentId)
          .gte('created_at', today.toISOString());

        // 2. Total de vendas hoje
        const { data: salesData } = await supabase
          .from('bd_pedidos')
          .select('total')
          .eq('establishment_id', establishmentId)
          .gte('created_at', today.toISOString())
          .not('status', 'eq', 'CANCELADO');

        const totalSales = salesData?.reduce((acc: number, curr: any) => acc + Number(curr.total), 0) || 0;
        const avgTicket = (ordersCount && ordersCount > 0) ? totalSales / ordersCount : 0;

        // 3. Itens pausados
        const { count: pausedCount } = await supabase
          .from('bd_produtos')
          .select('*', { count: 'exact', head: true })
          .eq('establishment_id', establishmentId)
          .eq('status', 'inativo');

        // 4. Últimos pedidos
        const { data: recent } = await supabase
          .from('bd_pedidos')
          .select('*')
          .eq('establishment_id', establishmentId)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          ordersCount: ordersCount || 0,
          totalSales,
          avgTicket,
          pausedItems: pausedCount || 0
        });
        setRecentOrders(recent || []);

      } catch (error) {
        console.error('ERRO DETALHADO NO DASHBOARD:', error);
        setStats({
          ordersCount: 0,
          totalSales: 0,
          avgTicket: 0,
          pausedItems: 0
        });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (establishmentId) {
      fetchDashboardData();
    }

    // Inscrição Realtime para novos pedidos - Envolvido em try/catch para não quebrar a UI
    try {
      if (establishmentId) {
        const channel = supabase
          .channel('schema-db-changes')
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'bd_pedidos',
              filter: `establishment_id=eq.${establishmentId}`
            }, 
            () => {
              fetchDashboardData();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    } catch (realtimeError) {
      console.warn('Realtime indisponível:', realtimeError);
    }

  }, [establishmentId]);

  const metrics = [
    { 
      title: "PEDIDOS HOJE", 
      value: stats.ordersCount.toString(), 
      change: "Hoje", 
      trend: "neutral", 
      icon: ShoppingBag,
      color: "primary"
    },
    { 
      title: "VENDAS (R$)", 
      value: `R$ ${stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      change: "Hoje", 
      trend: "neutral", 
      icon: DollarSign,
      color: "emerald"
    },
    { 
      title: "TICKET MÉDIO", 
      value: `R$ ${stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      change: "Média", 
      trend: "neutral", 
      icon: TrendingUp,
      color: "blue"
    },
    { 
      title: "ITENS PAUSADOS", 
      value: stats.pausedItems.toString(), 
      change: "Cardápio", 
      trend: "neutral", 
      icon: AlertCircle,
      color: "red"
    },
  ];
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <h2 className="text-4xl font-headline font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
              Olá, Villa Gourmet <span className="animate-bounce">🔥</span>
            </h2>
            <p className="text-slate-600 dark:text-muted-foreground mt-2 text-sm font-bold uppercase tracking-widest opacity-80">
              Sua operação está <strong className="text-emerald-500">100% ativa</strong> e recebendo novos pedidos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.4em] opacity-50">Resumo Operacional</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((m) => (
            <div 
              key={m.title} 
              className="bg-white dark:bg-[#111111] border-none rounded-3xl p-8 flex flex-col justify-between h-[180px] transition-all duration-300 hover:shadow-premium hover:scale-[1.02] dark:hover:bg-[#161616] cursor-pointer group shadow-premium active:scale-95"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-orange-600/10 dark:bg-orange-600/5 group-hover:bg-orange-600/20 transition-colors`}>
                  <m.icon className={`w-5 h-5 ${m.color === "primary" ? "text-orange-600" : "text-muted-foreground"}`} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${
                  m.trend === "up" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-muted-foreground"
                }`}>
                  {m.change} {m.trend === "up" ? "↗" : ""}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.2em] mb-2">
                  {m.title}
                </p>
                <h3 className="text-3xl font-headline font-black text-slate-900 dark:text-white tracking-tight leading-none">{m.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Section */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111111] border-none rounded-3xl p-8 shadow-premium">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-2xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">Últimos Pedidos</h4>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                   <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-black uppercase tracking-[0.2em]">Tempo real</p>
                </div>
              </div>
              <button className="text-[11px] font-black text-orange-600 hover:text-orange-700 hover:underline underline-offset-4 uppercase tracking-[0.2em] transition-all">Ver todos</button>
            </div>

            <div className="space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-white/5 border-none rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all group cursor-pointer shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-[#161616] border-none flex items-center justify-center font-black text-slate-900 dark:text-white text-[11px] shadow-premium group-hover:bg-orange-600 group-hover:text-white transition-all uppercase">
                      #{order.id.toString().slice(0, 4)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-orange-600 transition-colors">{order.customer_name}</span>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-slate-400 dark:text-muted-foreground" />
                        <span className="text-[11px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-tight">
                          {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        R$ {Number(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-md mt-2 border ${
                        order.status === "PENDENTE" ? "bg-orange-600 text-white border-orange-600 shadow-sm" : 
                        order.status === "PREPARO" ? "bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-500 border-amber-500/20" : 
                        "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-500 border-emerald-500/20"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-md">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nenhum pedido recente</p>
                </div>
              )}
            </div>
          </div>

          {/* Sales Chart Placeholder */}
          <div className="bg-white dark:bg-[#111111] border-none rounded-3xl p-8 flex flex-col min-h-[450px] shadow-premium">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-2xl font-headline font-black text-slate-900 dark:text-white uppercase tracking-tight">Vendas</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
                  <span className="text-[11px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.3em]">Performance Semanal</span>
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>

            <div className="flex-1 flex items-center justify-center rounded-md bg-slate-50/50 dark:bg-zinc-800/10 border border-dashed border-slate-200 dark:border-zinc-700 group hover:border-orange-600/30 transition-all cursor-default shadow-inner">
              <span className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.4em] group-hover:text-orange-600 transition-colors text-center px-12 leading-loose">
                Análise de Vendas<br/>(Em breve)
              </span>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
