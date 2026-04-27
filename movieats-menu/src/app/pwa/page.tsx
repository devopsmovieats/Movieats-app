"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingBasket, Plus, Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CardapioPage() {
  const { userData } = useUser();
  const [establishmentName, setEstablishmentName] = useState("Vila Gourmet");
  const [activeCategory, setActiveCategory] = useState("Burgers");

  useEffect(() => {
    async function fetchBranding() {
      try {
        const { data } = await supabase
          .from('bd_config_estabelecimento')
          .select('nome_loja')
          .limit(1)
          .maybeSingle();
        
        if (data?.nome_loja) {
          setEstablishmentName(data.nome_loja);
        }
      } catch (err) {
        console.error("Erro ao buscar branding:", err);
      }
    }
    fetchBranding();
  }, []);

  const categories = ["Entradas", "Burgers", "Pizzas", "Bebidas", "Sobremesas"];

  return (
    <main className="flex flex-col min-h-screen">
      {/* Header - Escala reduzida e saudação dinâmica */}
      <header className="px-6 pt-8 pb-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
             <h2 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
               {establishmentName}
             </h2>
             <h1 className="text-xl md:text-2xl font-black text-white italic">
               Olá, {userData?.nome || "Visitante"}!
               <span className="block not-italic text-sm font-bold text-white/50 tracking-normal mt-1">Seja bem-vindo(a)!</span>
             </h1>
          </div>
          <div className="p-2.5 bg-orange-600/20 rounded-xl border border-orange-600/30">
            <Flame className="w-5 h-5 text-orange-600 fill-orange-600" />
          </div>
        </div>

        {/* Search Bar - Mais compacta */}
        <div className="relative group mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="O que vamos comer hoje?" 
            className="w-full h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl pl-12 pr-4 text-sm font-semibold outline-none focus:border-orange-600/50 transition-all placeholder:text-white/20"
          />
        </div>
      </header>

      {/* Categories - Horizontal Scroll */}
      <div className="px-6 overflow-x-auto no-scrollbar flex gap-2 py-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeCategory === cat 
                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" 
                : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List - Cards Compactos */}
      <div className="flex flex-col gap-4 px-6 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[13px] font-black uppercase tracking-widest text-white/90">{activeCategory}</h3>
          <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
            <Filter size={12} />
            Filtrar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex gap-4 hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-orange-600/20 to-transparent" />
              </div>
              <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Smash Burger Clássico</h4>
                  <p className="text-[11px] text-white/40 leading-snug line-clamp-2">Pão brioche, carne de 100g, cheddar e molho especial Movieats.</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-500 font-black text-sm italic tracking-tighter">R$ 29,90</span>
                  <button className="p-1.5 bg-orange-600 rounded-lg text-white shadow-lg shadow-orange-600/10">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Action Cart (Optional) */}
      <div className="fixed bottom-24 right-6 z-50">
        <button className="w-14 h-14 bg-orange-600 text-white rounded-2xl shadow-2xl flex items-center justify-center relative active:scale-95 transition-all">
          <ShoppingBasket size={24} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-orange-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-orange-600">2</span>
        </button>
      </div>
    </main>
  );
}
