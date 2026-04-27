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
    <div className="flex flex-col min-h-screen p-6 md:p-12 items-center justify-center">
      <div className="w-full max-w-lg flex flex-col min-h-[80vh] justify-center">
        {/* Header/Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-16"
        >
          <div className="p-4 bg-orange-600/20 backdrop-blur-md rounded-3xl border border-orange-600/30 mb-8">
            <Flame className="w-12 h-12 text-orange-600 fill-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-center text-white leading-none">
            {establishmentName}
          </h1>
          <p className="text-white/60 text-[12px] font-bold uppercase tracking-[0.4em] mt-4 text-center">Identificação do Cliente</p>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="space-y-5">
              {/* Nome Input */}
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-orange-600 transition-colors">
                  <User size={22} />
                </div>
                <input
                  type="text"
                  name="nome"
                  placeholder="Informe seu nome completo"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl py-6 pl-14 pr-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/30 text-white"
                  required
                />
              </div>

              {/* Apelido Input */}
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-orange-600 transition-colors">
                  <Smile size={22} />
                </div>
                <input
                  type="text"
                  name="apelido"
                  placeholder="Como gostaria de ser chamado?"
                  value={formData.apelido}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl py-6 pl-14 pr-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/30 text-white"
                  required
                />
              </div>

              {/* Data Nascimento Input */}
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-orange-600 transition-colors">
                  <Calendar size={22} />
                </div>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl py-6 pl-14 pr-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/30 text-white appearance-none"
                  required
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/40 pointer-events-none uppercase tracking-widest hidden sm:block">Sua Data de Nascimento</span>
              </div>
            </div>

            <div className="pt-8">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#ea580c" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-orange-600 text-white font-black uppercase italic tracking-widest py-6 rounded-2xl shadow-[0_10px_40px_rgb(234,88,12,0.3)] flex items-center justify-center gap-3 transition-all text-xl"
              >
                Vamos comer?
                <ArrowRight size={26} />
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em] hover:text-white/60 transition-colors cursor-default">
            © 2026 Movieats Technology
          </p>
        </div>
      </div>
    </div>
  );
}
