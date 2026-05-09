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
    // fetchBranding(); // Desativado temporariamente para evitar erro 406
    
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
    /* 
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
    */
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
      className={`bg-[#09090b] border-r border-zinc-900 h-screen sticky top-0 flex flex-col z-50 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-[270px]"}
      `}
    >
      {/* Top Branding & Toggle Button */}
      <div className={`px-6 py-10 flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between gap-4"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shrink-0 w-11 h-11 shadow-2xl transition-all duration-300`}>
            {brand.logo ? (
              <img src={brand.logo} alt="Logo" className="w-full h-full object-cover rounded-md" />
            ) : (
              <Flame className="text-[#ff5c00] w-6 h-6 fill-[#ff5c00]" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-500">
              <span className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                {brand.name}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mt-1">
                {userRole === "Atendente" ? "Atendimento" : userRole === "Gerente" ? "Gestão Operacional" : "Administrador"}
              </span>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-all text-zinc-600 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center mb-6">
          <button 
            onClick={toggleSidebar}
            className="p-3 bg-[#ff5c00]/10 text-[#ff5c00] hover:bg-[#ff5c00] hover:text-white rounded-xl transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-8 pt-2 pb-8 scrollbar-none">
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
              <div key={group.title} className="space-y-3">
                {!isCollapsed && (
                  <h3 className="px-3 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
                    {group.title}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isExpanded = !!expandedMenus[item.label];
                    const hasSubItems = !!item.subItems;
                    const isActive = item.href ? pathname === item.href : item.subItems?.some(sub => pathname === sub.href);

                return (
                  <div key={item.label} className="w-full">
                    <Link
                      href={item.href || "#"}
                      onClick={(e) => {
                        if (hasSubItems) {
                          e.preventDefault();
                          toggleSubmenu(item.label);
                        }
                      }}
                      className={`flex items-center gap-3 py-3 rounded-lg transition-all duration-200 outline-none group
                        ${isActive 
                          ? "bg-[#ff5c00] text-white shadow-lg shadow-[#ff5c00]/20" 
                          : "text-[#a1a1aa] hover:bg-[#27272a]"
                        } 
                        ${isCollapsed ? "justify-center w-12 h-12 mx-auto px-0" : "px-4 w-full"}
                      `}
                    >
                      <item.icon className={`shrink-0 transition-all duration-200 ${isActive ? "text-white" : "text-[#a1a1aa] group-hover:text-white"} ${isCollapsed ? "w-6 h-6" : "w-4 h-4"}`} />
                      
                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="text-[13px] font-semibold tracking-tight">
                            {item.label}
                          </span>
                          {hasSubItems && (
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : "opacity-40"}`} />
                          )}
                        </div>
                      )}
                    </Link>

                    {!isCollapsed && isExpanded && hasSubItems && (
                      <div className="pl-12 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                        {item.subItems?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`flex items-center gap-3 py-2 text-[12px] font-semibold transition-all relative
                                ${isSubActive ? "text-[#ff5c00] font-bold" : "text-[#a1a1aa] hover:text-white"}
                              `}
                            >
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

      <div className={`py-8 px-6 border-t border-zinc-900 text-center mt-auto flex flex-col items-center justify-center`}>
        {!isCollapsed ? (
          <div className="animate-in fade-in duration-700 w-full">
            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest mb-1">
              © 2026 MoviEats
            </p>
            <span className="flex items-center justify-center gap-2 text-[9px] font-bold text-zinc-800">
              SISTEMA OPERACIONAL
            </span>
          </div>
        ) : (
          <Flame className="w-6 h-6 text-[#ff5c00] fill-[#ff5c00] opacity-50" />
        )}
      </div>
    </aside>
  );
}
