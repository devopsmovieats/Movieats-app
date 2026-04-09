"use client";

import { useState, useEffect } from "react";
import { Bell, Menu, Store, Bike, Package, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// Configuração do Toast elegante conforme o padrão Movieats
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#141414",
  color: "#fff",
  customClass: {
    popup: "rounded-xl border border-white/5 shadow-2xl shadow-black/50"
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
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
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass hover:bg-white/10 transition-all group border-white/5 cursor-pointer"
    >
      <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-[10px] font-bold text-white/90 leading-tight">{label}</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] transition-all duration-500 ${
            isOpen 
              ? 'bg-emerald-500 shadow-emerald-500/50 scale-110' 
              : 'bg-red-500 shadow-red-500/50 scale-90'
          }`} />
          <span className={`text-[8px] font-black uppercase tracking-wider ${isOpen ? 'text-emerald-500' : 'text-red-500'}`}>
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
  const router = useRouter();

  // Carregar estados do localStorage ao montar
  useEffect(() => {
    const savedStore = localStorage.getItem("movieats_store_open");
    const savedCourier = localStorage.getItem("movieats_courier_active");
    
    if (savedStore !== null) setIsStoreOpen(savedStore === "true");
    if (savedCourier !== null) setIsCourierActive(savedCourier === "true");
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    router.push("/login");
  };

  const toggleStore = () => {
    const newState = !isStoreOpen;
    setIsStoreOpen(newState);
    localStorage.setItem("movieats_store_open", String(newState));
    
    Toast.fire({
      icon: newState ? "success" : "error",
      title: newState ? "Estabelecimento ABERTO" : "Estabelecimento FECHADO",
      iconColor: newState ? "#10b981" : "#ef4444"
    });
  };

  const toggleCourier = () => {
    const newState = !isCourierActive;
    setIsCourierActive(newState);
    localStorage.setItem("movieats_courier_active", String(newState));
    
    Toast.fire({
      icon: newState ? "success" : "warning",
      title: newState ? "Sistema de entregadores ativado" : "Sistema de entregadores desativado",
      iconColor: newState ? "#10b981" : "#f59e0b"
    });
  };

  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-white cursor-pointer">
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <StatusSwitch 
            label="Loja Online" 
            isOpen={isStoreOpen} 
            onToggle={toggleStore} 
            icon={Store}
          />
          <StatusSwitch 
            label="Entregadores" 
            isOpen={isCourierActive} 
            onToggle={toggleCourier} 
            icon={Bike}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition-all group cursor-pointer ${
              showNotifications ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'glass text-muted-foreground hover:text-white border-white/5'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
              3
            </span>
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass rounded-2xl border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm font-black text-white tracking-tight">Pedidos Pendentes</span>
                </div>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">3 Novos</span>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {fakeNotifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">{notif.customer}</span>
                      <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{notif.items}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white">{notif.total}</span>
                      <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline cursor-pointer">Ver Detalhes</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full p-3 text-[11px] font-black text-white/50 hover:text-white uppercase tracking-[0.2em] transition-colors border-t border-white/5 bg-white/[0.02] cursor-pointer">
                Ver Todos os Pedidos
              </button>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div 
          onClick={handleLogout}
          className="flex items-center gap-3 p-1.5 pr-4 glass rounded-xl border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary/80 to-orange-500 p-[1px]">
            <div className="w-full h-full rounded-[7px] bg-[#0a0a0a] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Lojista" 
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white group-hover:text-primary transition-colors">Villa Gourmet</span>
            <span className="text-[9px] text-white/40 font-medium group-hover:text-red-400 flex items-center gap-1">
              Sair <LogOut className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
