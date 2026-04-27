"use client";

import { useState, useEffect } from "react";
import { Bell, Menu, Store, Bike, Package, LogOut, Sun, Moon } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "var(--card)",
  color: "var(--foreground)",
  customClass: {
    popup: "rounded-md border border-border shadow-2xl backdrop-blur-md"
  }
});

interface StatusSwitchProps {
  isOpen: boolean;
  onToggle: () => void;
  label: string;
  icon: any;
}

function StatusSwitch({ isOpen, onToggle, label, icon: Icon }: StatusSwitchProps) {
  return (
    <button 
      onClick={onToggle}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-none bg-white dark:bg-[#1f2937] shadow-premium hover:bg-slate-100 dark:hover:bg-white/5 transition-all group cursor-pointer outline-none"
    >
      <div className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-white/10 text-white' : 'bg-slate-200 dark:bg-muted text-slate-500 dark:text-muted-foreground'}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-[11px] font-semibold text-slate-900 dark:text-white/50 leading-tight tracking-tight">
          {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
            isOpen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
          }`} />
          <span className={`text-[9px] font-bold tracking-wider ${isOpen ? 'text-emerald-500' : 'text-red-500'}`}>
            {isOpen ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
    </button>
  );
}

const fakeNotifications = [
  { id: 1, customer: "João Silva", items: "2x Burger Artesanal", total: "R$ 84,90", time: "Há 2 min" },
  { id: 2, customer: "Maria Souza", items: "1x Pizza Família", total: "R$ 65,00", time: "Há 5 min" },
  { id: 3, customer: "Pedro Santos", items: "3x Combo Executivo", total: "R$ 112,00", time: "Há 8 min" },
];

export default function Header() {
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isCourierActive, setIsCourierActive] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedStore = localStorage.getItem("movieats_store_open");
    const savedCourier = localStorage.getItem("movieats_courier_active");
    const savedTheme = localStorage.getItem("movieats_theme") || "dark";
    
    if (savedStore !== null) setIsStoreOpen(savedStore === "true");
    if (savedCourier !== null) setIsCourierActive(savedCourier === "true");
    
    const isDarkMode = savedTheme === "dark";
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("movieats_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("movieats_theme", "light");
    }
    
    Toast.fire({
      icon: "info",
      title: `Modo ${newTheme ? 'Escuro' : 'Claro'} Ativado`,
    });
  };

  return (
    <header className="h-20 border-none flex items-center justify-between px-6 bg-transparent sticky top-0 z-40 theme-transition">
      <div className="flex items-center gap-6">
        <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-md text-slate-900 dark:text-white cursor-pointer">
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          <StatusSwitch 
            label="Loja Online" 
            isOpen={isStoreOpen} 
            onToggle={() => {
              setIsStoreOpen(!isStoreOpen);
              localStorage.setItem("movieats_store_open", String(!isStoreOpen));
            }} 
            icon={Store}
          />
          <StatusSwitch 
            label="Entregadores" 
            isOpen={isCourierActive} 
            onToggle={() => {
              setIsCourierActive(!isCourierActive);
              localStorage.setItem("movieats_courier_active", String(!isCourierActive));
            }} 
            icon={Bike}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border-none bg-white dark:bg-[#1f2937] text-slate-500 dark:text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-premium cursor-pointer outline-none"
        >
          {isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl border-none transition-all cursor-pointer outline-none shadow-premium ${
              showNotifications ? 'bg-white text-slate-900' : 'bg-white dark:bg-[#1f2937] text-slate-500 dark:text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-slate-900 text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#111827]">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-card rounded-md border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-white opacity-40" />
                  <span className="text-sm font-bold text-white tracking-tight">Pedidos Pendentes</span>
                </div>
                <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-white/10 rounded-full">3 NOVOS</span>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {fakeNotifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-border hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-white transition-colors">{notif.customer}</span>
                      <span className="text-[10px] text-white opacity-30 font-semibold">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-white opacity-40 mb-2 line-clamp-1 font-semibold">{notif.items}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{notif.total}</span>
                      <button className="text-[10px] font-bold text-white opacity-60 hover:opacity-100 transition-opacity">Ver Detalhes</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full p-4 text-[11px] font-bold text-white opacity-40 hover:opacity-100 transition-opacity border-t border-border bg-muted/10 cursor-pointer">
                Ver Todos os Pedidos
              </button>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div 
          onClick={() => {
             Cookies.remove("auth_token");
             router.push("/login");
          }}
          className="flex items-center gap-3 p-1.5 pr-4 bg-white dark:bg-[#1f2937] rounded-xl border-none hover:bg-slate-100 dark:hover:bg-[#374151] transition-all group cursor-pointer shadow-premium outline-none"
        >
          <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-orange-600 to-orange-400 p-[1px]">
            <div className="w-full h-full rounded-[2.5px] bg-background overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Lojista" 
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white group-hover:text-white transition-colors">Villa Gourmet</span>
            <span className="text-[9px] text-white opacity-30 font-bold group-hover:text-red-500 flex items-center gap-1 transition-colors">
              Sair <LogOut className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
