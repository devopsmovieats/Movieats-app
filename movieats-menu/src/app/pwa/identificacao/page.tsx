"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Smile, Calendar, ArrowRight, Flame } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function IdentificacaoPage() {
  const router = useRouter();
  const { setUserData } = useUser();
  const [formData, setFormData] = useState({
    nome: "",
    apelido: "",
    dataNascimento: "",
  });

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
    router.push("/pwa");
  };

  return (
    <div className="relative flex flex-col min-h-screen text-white font-sans overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/bg-identificacao.png" 
          alt="Food Background" 
          className="w-full h-full object-cover grayscale-[20%] brightness-[40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen p-6 md:p-12">
        {/* Header/Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mt-8 mb-12 md:mt-16"
        >
          <div className="p-3 bg-orange-600/20 backdrop-blur-md rounded-2xl border border-orange-600/30 mb-4">
            <Flame className="w-10 h-10 text-orange-600 fill-orange-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-center">Identificação</h1>
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] mt-2 text-center">Uma experiência feita para você</p>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full"
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
                  placeholder="Nome completo"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-14 pr-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/30"
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
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-14 pr-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/30"
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
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-14 pr-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/30 appearance-none"
                  required
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/40 pointer-events-none uppercase tracking-widest hidden sm:block">Data de Nascimento</span>
              </div>
            </div>

            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#ea580c" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-orange-600 text-white font-black uppercase italic tracking-widest py-5 rounded-2xl shadow-[0_10px_40px_rgb(234,88,12,0.3)] flex items-center justify-center gap-3 transition-all text-lg"
              >
                Avançar para o Cardápio
                <ArrowRight size={24} />
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="mt-auto pt-12 text-center opacity-40">
          <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">© 2026 Movieats Technology</p>
        </div>
      </div>
    </div>
  );
}
