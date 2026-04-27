"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Utensils, Truck, Store, Flame, BellRing } from "lucide-react";

export default function SelecaoAtendimentoPage() {
  const modules = [
    {
      title: "Comer aqui (Mesa)",
      subtitle: "Para pedir na mesa",
      icon: <ShoppingBag className="w-8 h-8" />,
      href: "/pwa",
      color: "from-orange-600/30 to-orange-600/10",
      borderColor: "border-orange-600/30",
    },
    {
      title: "Retirada (Balcão)",
      subtitle: "Para levar",
      icon: <Store className="w-8 h-8" />,
      href: "/pwa", // No futuro pode ter flag ?type=retirada
      color: "from-emerald-600/30 to-emerald-600/10",
      borderColor: "border-emerald-600/30",
    },
    {
      title: "Delivery",
      subtitle: "Para receber em casa",
      icon: <Truck className="w-8 h-8" />,
      href: "/pwa", // No futuro pode ter flag ?type=delivery
      color: "from-purple-600/30 to-purple-600/10",
      borderColor: "border-purple-600/30",
    },
    {
      title: "Chamar Garçom",
      subtitle: "Atendimento na mesa",
      icon: <BellRing className="w-8 h-8" />,
      href: "/garcom",
      color: "from-blue-600/30 to-blue-600/10",
      borderColor: "border-blue-600/30",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen p-6 md:p-12">
      <div className="flex flex-col items-center space-y-4 text-center mt-8 mb-12">
        <div className="p-4 bg-orange-600/20 backdrop-blur-md rounded-3xl border border-orange-600/30">
          <Flame className="w-12 h-12 text-orange-600 fill-orange-600" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Como deseja ser atendido?</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Escolha uma opção abaixo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto flex-1 content-center">
        {modules.map((mod, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href={mod.href}
              className={`group p-8 bg-gradient-to-br ${mod.color} border ${mod.borderColor} rounded-3xl transition-all flex flex-col items-center text-center space-y-4 backdrop-blur-md h-full justify-center`}
            >
              <div className="text-white/60 group-hover:text-white transition-colors">
                {mod.icon}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">{mod.title}</h2>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">{mod.subtitle}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="pt-12 text-center opacity-60 mt-auto">
        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">© 2026 Movieats Technology</p>
      </div>
    </div>
  );
}
