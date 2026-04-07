"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Settings, 
  BarChart3, 
  Package,
  Bell,
  LogOut
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/" },
  { icon: Store, label: "Lojistas", href: "/lojistas" },
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: Bell, label: "Notificações", href: "/notificacoes" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col transition-all duration-300">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Store className="text-primary-foreground w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
          MOVIEATS
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group">
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
