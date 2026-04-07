import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, 
  Store, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const stats = [
  { 
    label: "Total de Lojistas", 
    value: "1,284", 
    change: "+12.5%", 
    trend: "up", 
    icon: Store,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  { 
    label: "Usuários Ativos", 
    value: "45,672", 
    change: "+18.2%", 
    trend: "up", 
    icon: Users,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  },
  { 
    label: "Receita Mensal", 
    value: "R$ 142.380", 
    change: "+7.4%", 
    trend: "up", 
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  { 
    label: "Taxa de Conversão", 
    value: "3.2%", 
    change: "-2.1%", 
    trend: "down", 
    icon: TrendingUp,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
];

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, Admin</h1>
          <p className="text-muted-foreground mt-1">Aqui está o que está acontecendo no Movieats hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-6 rounded-2xl hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                }`}>
                  {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border p-8 rounded-2xl min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-xl font-semibold">Gráfico de Atividade</h4>
            <p className="text-muted-foreground max-w-xs mt-2">Os dados de atividade em tempo real serão exibidos aqui após a integração com o Supabase.</p>
          </div>

          <div className="bg-card border border-border p-8 rounded-2xl flex flex-col">
            <h4 className="text-xl font-semibold mb-6">Últimos Lojistas</h4>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">
                      L{i}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Restaurante Sabor {i}</p>
                      <p className="text-xs text-muted-foreground italic">Cadastrado há {i}h</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full font-medium">Ativo</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
