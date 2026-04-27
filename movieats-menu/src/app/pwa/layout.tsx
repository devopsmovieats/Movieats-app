"use client";

import React from "react";
import { UserProvider } from "@/context/UserContext";
import { Home, ClipboardList, ShoppingBag, BellRing, User, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PWALayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: <Home size={20} />, href: "/pwa" },
    { label: "Cardápio", icon: <ClipboardList size={20} />, href: "/pwa" },
    { label: "Pedidos", icon: <ShoppingBag size={20} />, href: "#" },
    { label: "Garçom", icon: <BellRing size={20} />, href: "#" },
    { label: "Conta", icon: <User size={20} />, href: "#" },
    { label: "Mais", icon: <Plus size={20} />, href: "#" },
  ];

  return (
    <UserProvider>
      <div className="min-h-screen bg-transparent text-white selection:bg-primary/20 pb-24">
        {children}

        {/* Bottom Tab Bar - Native App Style */}
        <nav className="fixed bottom-4 left-4 right-4 z-[100] h-16 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around px-2 shadow-2xl">
          {navItems.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                pathname === item.href ? "text-orange-500" : "text-white/40 hover:text-white/60"
              }`}
            >
              <div className={pathname === item.href ? "scale-110" : ""}>
                {item.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </UserProvider>
  );
}
