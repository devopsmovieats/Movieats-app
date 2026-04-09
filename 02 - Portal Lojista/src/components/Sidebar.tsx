"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Clock, 
  PenTool, 
  Kanban, 
  List,
  LayoutGrid, 
  ClipboardList, 
  UserCircle,
  CalendarClock,
  Wallet,
  Truck,
  Box,
  Flame,
  Utensils,
  ChevronDown,
  ChevronUp,
  LogOut
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Definindo a interface para suportar submenus
interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  subItems?: { label: string, href: string }[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "GERAL",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { 
        icon: Utensils, 
        label: "Cardápio", 
        subItems: [
          { label: "Categorias", href: "/geral/categorias" },
          { label: "Produtos", href: "/geral/produtos" },
          { label: "Grupos de Adicionais", href: "/geral/grupos-adicionais" },
        ]
      },
      { icon: Users, label: "Clientes", href: "/geral/clientes" },
    ]
  },
  {
    title: "OPERAÇÃO",
    items: [
      { icon: Clock, label: "Pedidos", href: "/operacao/pedidos" },
      { icon: PenTool, label: "Lançar Pedido", href: "/operacao/lancar-pedido" },
      { icon: Kanban, label: "Kanban", href: "/operacao/kanban" },
    ]
  },
  {
    title: "MESAS",
    items: [
      { icon: LayoutGrid, label: "Gerenciar Mesas", href: "/mesas/gerenciar" },
      { icon: Kanban, label: "Kanban Mesas", href: "/mesas/kanban" },
      { icon: ClipboardList, label: "Pedidos das Mesas", href: "/mesas/pedidos" },
      { icon: ClipboardList, label: "Comandas Fechadas", href: "/mesas/comandas-fechadas" },
    ]
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { icon: UserCircle, label: "Usuários", href: "/configuracoes/usuarios" },
      { icon: CalendarClock, label: "Horários", href: "/configuracoes/horarios" },
      { icon: Wallet, label: "Formas de Pagamento", href: "/configuracoes/pagamentos" },
      { icon: Truck, label: "Configurações de Entrega", href: "/configuracoes/entrega" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Estado para controlar submenus expandidos
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleLogout = () => {
    Cookies.remove("auth_token");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 h-screen sticky top-0 flex flex-col z-50 overflow-hidden">
      {/* Logo Section */}
      <div className="px-6 py-8 flex flex-col relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        <div className="flex items-center gap-3 mb-1 relative z-10">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <Flame className="text-primary w-6 h-6 fill-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-white uppercase leading-none">MOVIEATS</span>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1">Portal Lojista</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto pb-6 scrollbar-thin">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-white/30 tracking-[0.2em] uppercase">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isExpanded = !!expandedMenus[item.label];
                const hasSubItems = !!item.subItems;
                const isActive = item.href ? pathname === item.href : item.subItems?.some(sub => pathname === sub.href);

                if (hasSubItems) {
                  return (
                    <div key={item.label} className="space-y-1">
                      {/* Botão de Menu com Subitens */}
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group
                          ${isActive ? "text-primary shadow-[0_0_20px_rgba(255,107,0,0.05)]" : "text-white/50 hover:bg-white/5 hover:text-white"}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {isActive && !isExpanded && (
                            <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                          )}
                          <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : "text-white/40 group-hover:text-white"}`} />
                          <span className={`text-[11px] uppercase tracking-wider font-semibold`}>
                            {item.label}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-primary transition-all duration-300" />
                        ) : (
                          <ChevronDown className={`w-3.5 h-3.5 transition-all duration-300 ${isActive ? "text-primary" : "text-white/20"}`} />
                        )}
                      </button>

                      {/* Renderização dos Subitens com Animação */}
                      {isExpanded && (
                        <div className="pl-11 space-y-1 animate-in slide-in-from-top-2 duration-300">
                          {item.subItems?.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={`flex items-center gap-3 py-2 text-[10.5px] uppercase tracking-wide font-medium transition-colors relative
                                  ${isSubActive ? "text-primary" : "text-white/40 hover:text-white"}
                                `}
                              >
                                {isSubActive && (
                                  <div className="absolute -left-3.5 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                                )}
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Links normais
                return (
                  <Link
                    key={item.href}
                    href={item.href || "#"}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group relative ${
                      isActive 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                    )}
                    <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : "text-white/40 group-hover:text-white"}`} />
                    <span className={`text-[11px] uppercase tracking-wider font-semibold font-inter`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 text-center">
        <p className="text-[10px] text-white font-medium leading-relaxed">
          © 2026 Movieats Tecnologia LTDA.<br />
          Feito com <span className="text-primary font-bold">❤</span> no Brasil
        </p>
      </div>
    </aside>
  );
}
