"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";

export default function IdentificacaoRootPage() {
  const router = useRouter();
  const { setUserData } = useUser();
  const firstInputRef = useRef<HTMLInputElement>(null);
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

    // Autofocus no primeiro campo
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
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
    // Direciona direto para o cardápio digital
    router.push("/pwa");
  };

  return (
    <div className="flex flex-col min-h-screen p-6 md:p-12 items-center justify-center overflow-hidden">
      <div className="w-full max-w-lg flex flex-col justify-center py-6">
        {/* Header/Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10 md:mb-12"
        >
          <div className="p-4 bg-orange-600/20 backdrop-blur-md rounded-3xl border border-orange-600/30 mb-6">
            <Flame className="w-10 h-10 text-orange-600 fill-orange-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-center text-white leading-tight">
            {establishmentName}
          </h1>
          <div className="h-[2px] w-12 bg-orange-600/50 mt-4 rounded-full" />
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.4em] mt-4 text-center">Identificação do Cliente</p>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="space-y-5">
              {/* Nome Input */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[12px] font-black uppercase tracking-widest text-white/90 text-left px-1">Nome completo</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  name="nome"
                  placeholder="informe seu nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/20 text-white text-left"
                  required
                />
              </div>

              {/* Apelido Input */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[12px] font-black uppercase tracking-widest text-white/90 text-left px-1">Como gostaria de ser chamado?</label>
                <input
                  type="text"
                  name="apelido"
                  placeholder="informe seu apelido"
                  value={formData.apelido}
                  onChange={handleInputChange}
                  className="w-full h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/20 text-white text-left"
                  required
                />
              </div>

              {/* Data Nascimento Input */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[12px] font-black uppercase tracking-widest text-white/90 text-left px-1">Data de nascimento</label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="w-full h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/20 text-white text-left appearance-none"
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#ea580c" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full h-16 md:h-20 bg-orange-600 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-[0_10px_40px_rgb(234,88,12,0.3)] flex items-center justify-center gap-3 transition-all text-lg md:text-xl"
              >
                VAMOS COMER?
                <ArrowRight size={24} />
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[11px] font-black text-white uppercase tracking-[0.5em] opacity-80">
            © 2026 Movieats Technology
          </p>
        </div>
      </div>
    </div>
  );
}
