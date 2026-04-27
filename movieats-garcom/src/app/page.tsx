"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

export default function WaiterLoginPage() {
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [establishmentName, setEstablishmentName] = useState("Vila Gourmet");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    user: "",
    password: "",
  });

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

    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui entraria a lógica de autenticação real via Supabase
      // Por enquanto, simulando um login de colaborador
      if (credentials.user === "admin" && credentials.password === "123456") {
         Swal.fire({
            icon: 'success',
            title: 'Acesso Autorizado',
            text: 'Bem-vindo ao Painel do Garçom',
            background: '#141414',
            color: '#fff',
            showConfirmButton: false,
            timer: 1500
         });
         router.push("/garcom"); // Rota interna do colaborador
      } else {
        throw new Error("Usuário ou senha inválidos");
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Falha no Acesso',
        text: err.message,
        background: '#141414',
        color: '#fff',
        confirmButtonColor: '#ff6b00'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 md:p-12 items-center justify-center">
      <div className="w-full max-w-md flex flex-col justify-center py-8">
        {/* Header/Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="p-4 bg-orange-600/20 backdrop-blur-md rounded-3xl border border-orange-600/30 mb-6">
            <Flame className="w-10 h-10 text-orange-600 fill-orange-600" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-orange-600 mb-2">Painel do Garçom</h1>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-center text-white leading-tight">
            {establishmentName}
          </h2>
          <div className="h-[2px] w-12 bg-white/20 mt-4 rounded-full" />
        </motion.div>

        {/* Login Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 ml-1">Usuário / ID Colaborador</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="user"
                    placeholder="Digite seu usuário"
                    value={credentials.user}
                    onChange={handleInputChange}
                    className="w-full h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl pl-14 pr-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/20 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 ml-1">Senha de Acesso</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-orange-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Digite sua senha"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="w-full h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl pl-14 pr-5 outline-none focus:border-orange-600/50 focus:bg-white/15 transition-all text-base font-semibold placeholder:text-white/20 text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full h-16 bg-orange-600 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3 transition-all text-lg"
              >
                {loading ? "Autenticando..." : "ACESSAR PAINEL"}
                {!loading && <ArrowRight size={22} />}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Support Footer */}
        <div className="mt-12 text-center opacity-40">
          <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">© 2026 Movieats Business • v1.0</p>
        </div>
      </div>
    </div>
  );
}
