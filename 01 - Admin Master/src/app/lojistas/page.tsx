"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  ChevronRight, 
  Settings2,
  Filter,
  ArrowUpDown,
  Download
} from "lucide-react";
import { useState } from "react";

const lojistasData = [
  { 
    id: 1,
    name: "Pizzaria Del Grano", 
    logo: "DG",
    owner: "Marco Antônio",
    city: "São Paulo, SP", 
    plan: "PRO", 
    status: "ATIVO",
    joined: "12 Out 2025",
    orders: 452
  },
  { 
    id: 2,
    name: "Burger King Dom", 
    logo: "BK",
    owner: "Carlos Silveira",
    city: "Rio de Janeiro, RJ", 
    plan: "ENTERPRISE", 
    status: "ATIVO",
    joined: "05 Nov 2025",
    orders: 1280
  },
  { 
    id: 3,
    name: "Sushi Master LTDA", 
    logo: "SM",
    owner: "Hana Tanaka",
    city: "Belo Horizonte, MG", 
    plan: "BASICO", 
    status: "INATIVO",
    joined: "20 Dez 2025",
    orders: 89
  },
  { 
    id: 4,
    name: "Porto Gourmet", 
    logo: "PG",
    owner: "Marina Sousa",
    city: "Porto Alegre, RS", 
    plan: "PRO", 
    status: "ATIVO",
    joined: "02 Jan 2026",
    orders: 312
  },
  { 
    id: 5,
    name: "Pastel da Nonna", 
    logo: "PN",
    owner: "Enzo Ferrari",
    city: "Curitiba, PR", 
    plan: "BASICO", 
    status: "ATIVO",
    joined: "15 Jan 2026",
    orders: 156
  },
];

export default function LojistasPage() {
  const [search, setSearch] = useState("");

  const filteredLojistas = lojistasData.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-headline font-black text-white flex items-center gap-3">
              Lojistas
            </h2>
            <p className="text-muted-foreground mt-2 font-medium">
              Gerencie os parceiros e configurações de loja da <strong className="text-white">MOVIEATS</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl border border-white/5 transition-all">
              <Download className="w-5 h-5" />
            </button>
            <button className="bg-primary hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus className="w-5 h-5" />
              Novo Lojista
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-card border border-white/5 p-4 rounded-2xl shadow-xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou proprietário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5 rounded-xl transition-all font-bold text-xs">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white border border-white/5 rounded-xl transition-all font-bold text-xs text-nowrap">
              <ArrowUpDown className="w-4 h-4" />
              Ordenar
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Empresa</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cidade</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plano</th>
                  <th className="px-8 py-6 text-[10px) font-black text-muted-foreground uppercase tracking-widest text-center">Pedidos</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Membro desde</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLojistas.map((l) => (
                  <tr key={l.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/5 flex items-center justify-center font-black text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                          {l.logo}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white leading-tight">{l.name}</span>
                          <span className="text-[10px] font-bold text-muted-foreground mt-0.5">{l.owner}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-muted-foreground">{l.city}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${
                        l.plan === "ENTERPRISE" ? "border-secondary/20 text-secondary bg-secondary/5" : "border-primary/20 text-primary bg-primary/5"
                      }`}>
                        {l.plan}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-black text-white">{l.orders}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-muted-foreground">{l.joined}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${l.status === "ATIVO" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-neutral-600"}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${l.status === "ATIVO" ? "text-emerald-500" : "text-neutral-500"}`}>
                          {l.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-primary hover:text-white text-muted-foreground transition-all font-black text-[10px] uppercase tracking-widest border border-white/5 hover:border-primary shadow-lg hover:shadow-primary/20">
                        Gerenciar
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Placeholder */}
          <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Exibindo <strong className="text-white">5</strong> de <strong className="text-white">1,284</strong> lojistas</span>
            <div className="flex items-center gap-2">
              <button disabled className="px-4 py-2 rounded-lg bg-white/5 text-muted-foreground/30 text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Anterior</button>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all">Próximo</button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
