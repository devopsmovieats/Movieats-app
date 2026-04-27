import Link from "next/link";
import { Flame, ShoppingBag, Utensils, ChefHat, Truck } from "lucide-react";

export default function RootPage() {
  const modules = [
    {
      title: "Cardápio Digital",
      subtitle: "Módulo do Cliente",
      icon: <ShoppingBag className="w-8 h-8" />,
      href: "/pwa/identificacao",
      color: "from-orange-600/20 to-orange-600/5",
      borderColor: "border-orange-600/20",
    },
    {
      title: "Módulo Garçom",
      subtitle: "Atendimento Local",
      icon: <Utensils className="w-8 h-8" />,
      href: "/garcom",
      color: "from-blue-600/20 to-blue-600/5",
      borderColor: "border-blue-600/20",
    },
    {
      title: "Módulo Cozinha",
      subtitle: "Gestão de Pedidos",
      icon: <ChefHat className="w-8 h-8" />,
      href: "/cozinha",
      color: "from-emerald-600/20 to-emerald-600/5",
      borderColor: "border-emerald-600/20",
    },
    {
      title: "Módulo Entrega",
      subtitle: "Logística PWA",
      icon: <Truck className="w-8 h-8" />,
      href: "/entregador",
      color: "from-purple-600/20 to-purple-600/5",
      borderColor: "border-purple-600/20",
    },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-12 font-sans">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="p-4 bg-orange-600/10 rounded-3xl border border-orange-600/20">
          <Flame className="w-12 h-12 text-orange-600 fill-orange-600" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Movieats Ecosystem</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Selecione um módulo para acessar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
        {modules.map((mod, idx) => (
          <Link 
            key={idx}
            href={mod.href}
            className={`group p-8 bg-gradient-to-br ${mod.color} border ${mod.borderColor} rounded-3xl hover:scale-[1.02] transition-all flex flex-col items-center text-center space-y-4 backdrop-blur-sm`}
          >
            <div className="text-white/60 group-hover:text-white transition-colors">
              {mod.icon}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase tracking-tight italic">{mod.title}</h2>
              <p className="text-xs text-white/30 font-bold uppercase tracking-wider">{mod.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-12 border-t border-white/5 w-full max-w-xs text-center">
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">© 2026 Movieats Technology</p>
      </div>
    </div>
  );
}
