"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  BarChart3, 
  Users, 
  Truck,
  Settings,
  LogOut,
  Flame
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Store, label: "Lojistas", href: "/lojistas" },
  { icon: BarChart3, label: "Analíticos", href: "/analiticos" },
  { icon: Users, label: "Leads", href: "/leads" },
  { icon: Truck, label: "Frota", href: "/frota" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("auth_token");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#0e0e0e] border-r border-white/5 h-screen sticky top-0 flex flex-col z-50">
      {/* Logo */}
      <div className="px-8 py-10 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="text-primary w-8 h-8 fill-primary" />
          <span className="text-2xl font-black tracking-tighter text-white">MOVIEATS</span>
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] pl-10">
          Admin Console
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-[#1a1a1a] text-secondary font-bold border-r-4 border-primary shadow-lg shadow-black/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"}`} />
              <span className="text-sm uppercase tracking-wide font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="p-3 border-t border-white/5 space-y-4">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-5 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-xl transition-all group"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
          <span className="text-sm font-medium">Configurações</span>
        </Link>

        {/* User Profile Card */}
        <div 
          onClick={handleLogout}
          className="bg-[#151515] rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-red-500/5 transition-all border border-white/5 hover:border-red-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-orange-400 overflow-hidden ring-2 ring-black">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Admin" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">Admin User</span>
              <span className="text-[10px] text-muted-foreground mt-1 underline underline-offset-2">Sair do sistema</span>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
