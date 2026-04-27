"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Smile, Calendar, ArrowRight, Flame } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";

export default function IdentificacaoRootPage() {
  const router = useRouter();
  const { setUserData } = useUser();
  const [establishmentName, setEstablishmentName] = useState("MovieEats");
  const [formData, setFormData] = useState({
    nome: "",
    apelido: "",
    dataNascimento: "",
  });

  useEffect(() => {
    async function fetchBranding() {
      try {
        const { data, error } = await supabase
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.apelido || !formData.dataNascimento) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    setUserData(formData);
    router.push("/selecao");
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 items-center justify-center overflow-hidden">
      <div className="w-full max-w-md flex flex-col justify-center py-4">
        {/* Header/Logo - Tamanho reduzido para evitar scroll */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6 md:mb-8"
        >
          <div className="p-3 bg-orange-600/20 backdrop-blur-md rounded-2xl border border-orange-600/30 mb-4">
            <Flame className="w-8 h-8 text-orange-600 fill-orange-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-center text-white leading-none">
            {establishmentName}
          </h1>
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 text-center">Identificação do Cliente</p>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-4">
              {/* Nome Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 ml-1">Nome completo</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="nome"
                    placeholder="informe seu nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-sm font-semibold placeholder:text-white/20 text-white"
                    required
                  />
                </div>
              </div>

              {/* Apelido Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 ml-1">Como gostaria de ser chamado?</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors">
                    <Smile size={18} />
                  </div>
                  <input
                    type="text"
                    name="apelido"
                    placeholder="informe seu apelido"
                    value={formData.apelido}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-sm font-semibold placeholder:text-white/20 text-white"
                    required
                  />
                </div>
              </div>

              {/* Data Nascimento Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 ml-1">Data de nascimento</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-sm font-semibold placeholder:text-white/20 text-white appearance-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.01, backgroundColor: "#ea580c" }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full bg-orange-600 text-white font-black uppercase italic tracking-widest py-4 rounded-xl shadow-[0_10px_40px_rgb(234,88,12,0.2)] flex items-center justify-center gap-2 transition-all text-base"
              >
                VAMOS COMER?
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Footer - Compacto */}
        <div className="mt-8 text-center">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
            © 2026 Movieats Technology
          </p>
        </div>
      </div>
    </div>
  );
}
