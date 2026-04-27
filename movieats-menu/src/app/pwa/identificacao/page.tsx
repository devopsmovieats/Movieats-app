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
    // Push to the next step (menu)
    router.push("/pwa");
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6 font-sans">
      {/* Header/Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mt-12 mb-12"
      >
        <div className="p-3 bg-orange-600/10 rounded-2xl border border-orange-600/20 mb-4">
          <Flame className="w-8 h-8 text-orange-600 fill-orange-600" />
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Identificação</h1>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Queremos te conhecer melhor</p>
      </motion.div>

      {/* Form */}
      <motion.form 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col space-y-8 max-w-md mx-auto w-full"
      >
        <div className="space-y-6">
          {/* Nome Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors">
              <User size={20} />
            </div>
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-600/50 focus:bg-white/10 transition-all text-sm font-medium placeholder:text-white/20"
              required
            />
          </div>

          {/* Apelido Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors">
              <Smile size={20} />
            </div>
            <input
              type="text"
              name="apelido"
              placeholder="Como gostaria de ser chamado?"
              value={formData.apelido}
              onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-600/50 focus:bg-white/10 transition-all text-sm font-medium placeholder:text-white/20"
              required
            />
          </div>

          {/* Data Nascimento Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors">
              <Calendar size={20} />
            </div>
            <input
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-600/50 focus:bg-white/10 transition-all text-sm font-medium placeholder:text-white/20 appearance-none"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 pointer-events-none uppercase tracking-wider">Nascimento</span>
          </div>
        </div>

        <div className="pt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase italic tracking-wider py-4 rounded-2xl shadow-[0_8px_30px_rgb(234,88,12,0.3)] flex items-center justify-center gap-2 transition-all"
          >
            Avançar
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </motion.form>

      {/* Footer */}
      <div className="mt-auto pt-12 text-center">
        <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">© 2026 Movieats Technology</p>
      </div>
    </div>
  );
}
