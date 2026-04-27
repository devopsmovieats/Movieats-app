"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { 
  ShoppingBag, 
  DollarSign, 
  Tag,
  Box,
  CheckCircle,
  Activity,
  User,
  Clock
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Home() {
  const [stats, setStats] = useState({
    ordersCount: 0,
    totalSales: 0,
    categoriesCount: 0,
    productsCount: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
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

        // 3. Total de Categorias
        const { count: categoriesCount } = await supabase
          .from('bd_categorias')
          .select('*', { count: 'exact', head: true })
          .eq('establishment_id', establishmentId);

        // 4. Total de Produtos
        const { count: productsCount } = await supabase
          .from('bd_produtos')
          .select('*', { count: 'exact', head: true })
          .eq('establishment_id', establishmentId);

        setStats({
          ordersCount: ordersCount || 0,
          totalSales,
          categoriesCount: categoriesCount || 0,
          productsCount: productsCount || 0
        });

        // 5. Dados para o Gráfico (Últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: weekSales } = await supabase
          .from('bd_pedidos')
          .select('total, created_at')
          .eq('establishment_id', establishmentId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .not('status', 'eq', 'CANCELADO');

        const chartMap = new Map();
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'short' });
          chartMap.set(dateStr, 0);
        }

        weekSales?.forEach((sale: any) => {
          const dateStr = new Date(sale.created_at).toLocaleDateString('pt-BR', { weekday: 'short' });
          if (chartMap.has(dateStr)) {
            chartMap.set(dateStr, chartMap.get(dateStr) + Number(sale.total));
          }
        });

        const formattedChartData = Array.from(chartMap.entries()).map(([name, total]) => ({ name, total })).reverse();
        setChartData(formattedChartData);

        // 6. Logs de Atividade
        const { data: logsData } = await supabase
          .from('bd_logs')
          .select('*')
          .eq('establishment_id', establishmentId)
          .order('created_at', { ascending: false })
          .limit(6);
        
        setLogs(logsData || []);

      } catch (error) {
        console.error('ERRO DASHBOARD:', error);
      } finally {
        setLoading(false);
      }
    };

    if (establishmentId) {
      fetchDashboardData();
    }
  }, [establishmentId]);

  const metrics = [
    { 
      title: "PEDIDOS HOJE", 
      value: stats.ordersCount.toString(), 
      change: "Hoje", 
      icon: ShoppingBag,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    { 
      title: "VENDAS HOJE", 
      value: `R$ ${stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      change: "Hoje", 
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    { 
      title: "CATEGORIAS", 
      value: stats.categoriesCount.toString(), 
      change: "Total", 
      icon: Tag,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      title: "PRODUTOS", 
      value: stats.productsCount.toString(), 
      change: "Total", 
      icon: Box,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <h2 className="text-4xl font-headline font-bold text-white flex items-center gap-3 tracking-tighter">
              Olá, Villa Gourmet <span className="animate-bounce">🔥</span>
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-white opacity-80 text-sm font-semibold tracking-wider">
                Sua operação está 100% ativa.
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Cardápio Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all active:scale-95">
                Configurações
             </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((m) => (
            <div 
              key={m.title} 
              className="bg-[#1f2937]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-8 flex flex-col justify-between h-[180px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-[#1f2937] cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${m.bg} group-hover:scale-110 transition-transform`}>
                  <m.icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <div className="bg-white/5 text-[9px] font-black px-3 py-1 rounded-full text-white/40 uppercase tracking-widest">
                  {m.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">
                  {m.title}
                </p>
                <h3 className="text-3xl font-headline font-bold text-white tracking-tight leading-none">{m.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Chart Section */}
          <div className="lg:col-span-2 bg-[#1f2937]/80 backdrop-blur-sm border border-white/5 rounded-[32px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-2xl font-headline font-bold text-white tracking-tight">Desempenho de Vendas</h4>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-orange-500" />
                   <p className="text-[11px] text-white opacity-30 font-bold tracking-wider">Últimos 7 dias</p>
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-2xl">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    hide 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#f97316', fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#f97316" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Logs Section */}
          <div className="bg-[#1f2937]/80 backdrop-blur-sm border border-white/5 rounded-[32px] p-8 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col gap-1.5">
                <h4 className="text-2xl font-headline font-bold text-white tracking-tight">Logs de Atividade</h4>
                <p className="text-[11px] text-white opacity-30 font-bold tracking-wider uppercase">Auditoria do Sistema</p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-bold text-white truncate uppercase tracking-tighter">{log.funcionario}</span>
                    <span className="text-[10px] text-white/40 font-medium truncate">{log.acao}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-orange-500 uppercase block">
                      {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[8px] text-white/20 font-bold block uppercase">
                      {new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-12">
                   <Activity className="w-12 h-12 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem atividades registradas</p>
                </div>
              )}
            </div>
            
            <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black text-white/40 uppercase tracking-widest transition-all">
               Ver todos os logs
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
