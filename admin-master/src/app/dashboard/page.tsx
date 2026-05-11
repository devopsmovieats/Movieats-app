"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, 
  Store, 
  ShoppingBag, 
  TrendingUp 
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Total de Lojistas", value: "1,284", icon: Store, color: "text-primary" },
    { label: "Usuários Ativos", value: "8,432", icon: Users, color: "text-blue-500" },
    { label: "Pedidos Hoje", value: "452", icon: ShoppingBag, color: "text-emerald-500" },
    { label: "Crescimento Mensal", value: "+12.5%", icon: TrendingUp, color: "text-orange-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-headline font-black text-white uppercase tracking-tighter">
            Dashboard Central
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
            Visão geral operacional do sistema <strong className="text-white">MOVIEATS</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-white/5 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stats</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-white/5 rounded-3xl p-12 text-center">
          <h3 className="text-xl font-black text-white mb-2">Bem-vindo ao Painel Administrativo</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Utilize o menu lateral para gerenciar lojistas, analíticos e configurações do sistema.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
