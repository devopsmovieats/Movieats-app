"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store,
  Clock, 
  PenTool, 
  Kanban,
  Users,
  BarChart3,
  LayoutGrid,
  ClipboardList,
  Settings, 
  UserCircle, 
  Trophy,
  CalendarClock,
  Wallet,
  Truck,
  Flame,
  ChevronDown,
  ChevronUp,
  Heart,
  Boxes,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Menu,
  DollarSign
} from "lucide-react";

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
        icon: Store, 
        label: "Cardápio", 
        subItems: [
          { label: "Categorias", href: "/geral/categorias" },
          { label: "Produtos", href: "/geral/produtos" },
          { label: "Grupos de Adicionais", href: "/geral/grupos-adicionais" },
        ]
      },
    ]
  },
  {
    title: "OPERAÇÃO",
    items: [
      { icon: Clock, label: "Pedidos", href: "/operacao/pedidos" },
      { icon: PenTool, label: "Lançar Pedido", href: "/operacao/lancar-pedido" },
      { icon: Kanban, label: "Kanban", href: "/operacao/kanban" },
      { icon: BarChart3, label: "Relatório de Vendas", href: "/operacao/relatorio" },
      { icon: Users, label: "Clientes", href: "/operacao/clientes" },
    ]
  },
  {
    title: "MESAS",
    items: [
      { icon: LayoutGrid, label: "Gerenciar Mesas", href: "/mesas/gerenciar" },
      { icon: ClipboardList, label: "Comandas Fechadas", href: "/mesas/comandas-fechadas" },
    ]
  },
  {
    title: "ESTOQUE",
    items: [
      { icon: Briefcase, label: "Fornecedores", href: "/estoque/fornecedores" },
      { icon: Boxes, label: "Almoxarifado", href: "/estoque/almoxarifado" },
    ]
  },
  {
    title: "FINANCEIRO",
    items: [
      { 
        icon: DollarSign, 
        label: "Financeiro", 
        subItems: [
          { label: "A Receber", href: "/financeiro/receber" },
          { label: "A Pagar", href: "/financeiro/pagar" },
          { label: "Relatório Financeiro", href: "/financeiro/relatorios" },
        ]
      },
    ]
  },
  {
    title: "SISTEMA",
    items: [
      { icon: Settings, label: "Configurações", href: "/configuracoes/geral" },
      { icon: UserCircle, label: "Usuários", href: "/configuracoes/usuarios" },
      { icon: Trophy, label: "Fidelidade", href: "/configuracoes/fidelidade" },
      { icon: CalendarClock, label: "Horários", href: "/configuracoes/horarios" },
      { icon: Wallet, label: "Formas de Pagamento", href: "/configuracoes/pagamentos" },
      { icon: Truck, label: "Configurações de Entrega", href: "/configuracoes/entrega" },
    ]
  }
];

import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [brand, setBrand] = useState({ name: "MoviEats", logo: "" });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>("ADMIN");

  useEffect(() => {
    fetchBranding();
    
    const collapsedSaved = localStorage.getItem("movieats_sidebar_collapsed_mode");
    const userSaved = localStorage.getItem("movieats_user");
    
    if (userSaved) {
      const user = JSON.parse(userSaved);
      if (user.role) setUserRole(user.role);
    }

    if (collapsedSaved === "true") {
      setIsCollapsed(true);
    }

    const handleBrandingUpdate = (e: any) => {
      const { name, logo } = e.detail;
      setBrand({ name: name || "MoviEats", logo: logo || "" });
    };

    window.addEventListener("movieats:branding_update", handleBrandingUpdate);
    return () => window.removeEventListener("movieats:branding_update", handleBrandingUpdate);
  }, []);

  const fetchBranding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bd_config_estabelecimento")
        .select("nome_loja, url_logo")
        .eq("id", user.id)
        .single();

      if (data) {
        setBrand({
          name: data.nome_loja || "MoviEats",
          logo: data.url_logo || ""
        });
      }
    } catch (err) {
      console.error("Erro Sidebar Branding:", err);
    }
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("movieats_sidebar_collapsed_mode", String(newState));
  };

  const toggleSubmenu = (label: string) => {
    if (isCollapsed) return;
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside 
      className={`bg-white dark:bg-[#1f2937] border-none h-screen sticky top-0 flex flex-col z-50 overflow-y-auto overflow-x-hidden theme-transition transition-all duration-300 ease-in-out shadow-[10px_0_30px_-15px_rgba(0,0,0,0.5)]
        ${isCollapsed ? "w-20" : "w-[270px]"}
      `}
    >
      {/* Top Branding & Toggle Button */}
      <div className={`px-5 py-9 flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between gap-4"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 bg-slate-50 dark:bg-[#111827] border-none rounded-xl flex items-center justify-center shrink-0 w-11 h-11 shadow-premium transition-all duration-300`}>
            {brand.logo ? (
              <img src={brand.logo} alt="Logo" className="w-full h-full object-cover rounded-md" />
            ) : (
              <Flame className="text-orange-600 w-5 h-5 fill-orange-600" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-500">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                {brand.name}
              </span>
              <span className="text-[10px] font-medium text-white/50 tracking-wider mt-0.5 opacity-90">
                {userRole === "Atendente" ? "Atendimento" : userRole === "Gerente" ? "Gestão Operacional" : "Portal do Administrador"}
              </span>
            </div>
          )}
        </div>
        
        {/* Simple Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className={`p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-slate-400 hover:text-orange-600 ${isCollapsed ? "hidden" : "block"}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Show Toggle when collapsed */}
      {isCollapsed && (
        <div className="flex justify-center mb-6">
          <button 
            onClick={toggleSidebar}
            className="p-3 bg-orange-600/10 text-orange-600 hover:bg-orange-600 hover:text-white rounded-md transition-all shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className={`flex-1 px-4 space-y-9 pt-2 pb-8 transition-all duration-300`}>
        {menuGroups
          .filter(group => {
            if (userRole === "ATENDENTE") {
              return ["GERAL", "OPERAÇÃO", "MESAS"].includes(group.title);
            }
            if (userRole === "GERENTE") {
              return group.title !== "SISTEMA";
            }
            return true;
          })
          .map((group) => {
            // Filtragem de itens dentro de cada grupo para o Atendente
            const visibleItems = group.items.filter(item => {
              if (userRole === "ATENDENTE") {
                if (group.title === "GERAL") return ["Dashboard", "Cardápio"].includes(item.label);
                if (group.title === "OPERAÇÃO") return ["Lançar Pedido"].includes(item.label);
                if (group.title === "MESAS") return ["Gerenciar Mesas"].includes(item.label);
              }
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-4">
                {!isCollapsed && (
                  <h3 className="px-4 text-[11px] font-semibold text-white/20 tracking-wider">
                    {group.title.charAt(0) + group.title.slice(1).toLowerCase()}
                  </h3>
                )}
                
                <div className="space-y-1.5 flex flex-col items-center">
                  {visibleItems.map((item) => {
                    const isExpanded = !!expandedMenus[item.label];
                    const hasSubItems = !!item.subItems;
                const isActive = item.href ? pathname === item.href : item.subItems?.some(sub => pathname === sub.href);

                return (
                  <div key={item.label} className="w-full relative">
                    <Link
                      href={item.href || "#"}
                      onClick={(e) => {
                        if (hasSubItems) {
                          e.preventDefault();
                          toggleSubmenu(item.label);
                        }
                      }}
                      className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 outline-none
                        ${isActive 
                          ? "bg-white/10 text-white font-semibold" 
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                        } 
                        ${isCollapsed ? "justify-center w-11 h-11 px-0" : "px-4 w-full"}
                      `}
                    >
                      <item.icon className={`transition-transform shrink-0 ${isActive ? "text-white" : "text-white/40"} ${isCollapsed ? "w-5 h-5" : "w-4 h-4"}`} />
                      
                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0 animate-in fade-in duration-300">
                          <span className="text-sm font-medium leading-none truncate">
                            {item.label}
                          </span>
                          {hasSubItems && (
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      )}
                    </Link>

                    {!isCollapsed && isExpanded && hasSubItems && (
                      <div className="pl-12 mt-1.5 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        {item.subItems?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`flex items-center gap-3 py-2 text-sm font-medium transition-all relative outline-none
                                ${isSubActive ? "text-white font-semibold" : "text-white/60 hover:text-white"}
                              `}
                            >
                              {isSubActive && (
                                <div className="absolute -left-3.5 w-1 h-1 rounded-full bg-white" />
                              )}
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      </nav>

      {/* Footer Clean - Corrigido */}
      <div className={`py-10 px-6 border-none text-center bg-transparent mt-auto flex flex-col items-center justify-center`}>
        {!isCollapsed ? (
          <div className="animate-in fade-in duration-500 w-full">
            <p className="text-[10px] text-white/30 font-medium leading-relaxed tracking-wider mb-2">
              © 2026 MoviEats
            </p>
            <span className="flex items-center justify-center gap-2 text-[9px] font-medium text-white/20 tracking-wider">
              Feito com <Heart className="w-3 h-3 text-white/20 fill-white/10" /> no Brasil
            </span>
          </div>
        ) : (
          <Heart className="w-5 h-5 text-orange-600 fill-orange-600 animate-pulse" />
        )}
      </div>
    </aside>
  );
}
