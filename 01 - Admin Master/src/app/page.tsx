import DashboardLayout from "@/components/DashboardLayout";
import { 
  Store, 
  ShoppingCart, 
  Wallet, 
  UserPlus,
  TrendingUp,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const metrics = [
  { 
    title: "Lojistas Ativos", 
    value: "1,284", 
    change: "+12%", 
    trend: "up", 
    icon: Store,
    isHighlighted: false
  },
  { 
    title: "Pedidos Hoje", 
    value: "4,892", 
    change: "+24%", 
    trend: "up", 
    icon: ShoppingCart,
    isHighlighted: true
  },
  { 
    title: "Faturamento Hoje", 
    value: "R$ 42.680", 
    change: "+8.5%", 
    trend: "up", 
    icon: Wallet,
    isHighlighted: false
  },
  { 
    title: "Leads Novos", 
    value: "42", 
    change: "-3%", 
    trend: "down", 
    icon: UserPlus,
    isHighlighted: false
  },
];

const lojistas = [
  { logo: "DG", name: "Pizzaria Del Grano", city: "São Paulo, SP", plan: "PRO", status: "ATIVO" },
  { logo: "BK", name: "Burger King Dom", city: "Rio de Janeiro, RJ", plan: "ENTERPRISE", status: "ATIVO" },
];

const leads = [
  { 
    name: "Ricardo Alvez", 
    company: "Sushi Master LTDA", 
    city: "Belo Horizonte, MG", 
    time: "Hoje, 10:24", 
    status: "NOVO" 
  },
  { 
    name: "Marina Sousa", 
    company: "Porto Gourmet", 
    city: "Porto Alegre, RS", 
    time: "Hoje, 09:15", 
    status: "EM CONTATO" 
  },
];

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* Welcome Section */}
        <div>
          <h2 className="text-4xl font-headline font-black text-white flex items-center gap-3">
            Bom dia, Admin <span className="animate-bounce">👋</span>
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
            Aqui está o que está acontecendo com a <strong className="text-white">MOVIEATS</strong> hoje.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div 
              key={m.title} 
              className={`rounded-[2rem] p-8 flex flex-col justify-between h-[180px] transition-all duration-300 hover:scale-[1.02] cursor-default ${
                m.isHighlighted 
                  ? "bg-primary text-white shadow-2xl shadow-primary/20" 
                  : "bg-card border border-white/5"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${m.isHighlighted ? "bg-white/20" : "bg-white/5"}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                  m.trend === "up" 
                    ? (m.isHighlighted ? "bg-white/20" : "bg-primary/20 text-primary") 
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {m.change} {m.trend === "up" ? "↗" : "↘"}
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${m.isHighlighted ? "text-white/80" : "text-muted-foreground"}`}>
                  {m.title}
                </p>
                <h3 className="text-3xl font-headline font-black">{m.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-card border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-xl font-headline font-black text-white">Pedidos por dia essa semana</h4>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white">7 Dias</button>
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-white transition-colors">30 Dias</button>
              </div>
            </div>
            
            {/* Bars Visualization */}
            <div className="h-[240px] flex items-end justify-between gap-4 px-4 relative">
              <div className="absolute top-0 right-0 bg-white/5 border border-white/5 px-2 py-1 rounded text-[10px] font-bold text-muted-foreground">4.8k</div>
              {[
                { label: "SEG", val: "40%" },
                { label: "TER", val: "55%" },
                { label: "QUA", val: "45%" },
                { label: "QUI", val: "70%" },
                { label: "SEX", val: "85%", active: true },
                { label: "SAB", val: "65%" },
                { label: "DOM", val: "35%" }
              ].map((day) => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-4 group">
                  <div 
                    className={`w-full max-w-[40px] rounded-2xl transition-all duration-500 ${
                      day.active ? "bg-primary shadow-lg shadow-primary/20" : "bg-white/5 hover:bg-white/10"
                    }`}
                    style={{ height: day.val }}
                  ></div>
                  <span className={`text-[10px] font-black tracking-widest ${day.active ? "text-primary" : "text-muted-foreground"}`}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-card border border-white/5 rounded-[2.5rem] p-10 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-headline font-black text-white">Lojistas por Plano</h4>
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Simulated Donut Chart */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="18" className="text-white/5" />
                  <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="18" strokeDasharray="502" strokeDashoffset="250" className="text-primary" />
                  <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="18" strokeDasharray="502" strokeDashoffset="420" className="text-secondary" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">1.2k</span>
                  <span className="text-[10px] font-black tracking-widest text-muted-foreground">TOTAL</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[11px] font-bold text-muted-foreground">Enterprise <span className="text-white ml-1">45%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[11px] font-bold text-muted-foreground">Pro <span className="text-white ml-1">30%</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[11px] font-bold text-muted-foreground">Básico <span className="text-white ml-1">25%</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Retailers */}
          <div className="bg-card border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-headline font-black text-white">Últimos Lojistas Cadastrados</h4>
              <button className="text-[11px] font-black text-primary hover:underline underline-offset-4 uppercase tracking-wider transition-all">Ver Todos</button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest pb-4 border-b border-white/5">
                <div>Lojista</div>
                <div>Cidade</div>
                <div>Plano</div>
                <div className="text-right">Status</div>
              </div>
              {lojistas.map((l) => (
                <div key={l.name} className="grid grid-cols-4 items-center group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      {l.logo}
                    </div>
                    <span className="text-sm font-black text-white leading-tight">{l.name}</span>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">{l.city}</div>
                  <div>
                    <span className="text-[10px] font-black px-2 py-1 rounded-md border border-primary/20 text-primary">
                      {l.plan}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-[10px] font-black text-emerald-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {l.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-card border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-headline font-black text-white">Últimos Leads</h4>
              <button className="text-[11px] font-black text-primary hover:underline underline-offset-4 uppercase tracking-wider transition-all">Gerenciar Leads</button>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest pb-4 border-b border-white/5">
                <div>Contato</div>
                <div>Cidade</div>
                <div>Data</div>
                <div className="text-right">Status</div>
              </div>
              {leads.map((lead) => (
                <div key={lead.name} className="grid grid-cols-4 items-center group cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white leading-tight">{lead.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground mt-1">{lead.company}</span>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">{lead.city}</div>
                  <div className="text-xs font-bold text-muted-foreground">{lead.time}</div>
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                      lead.status === "NOVO" ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground"
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
