"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ChevronRight, Bike } from "lucide-react";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "entregador@teste.com" && password === "entregador123") {
      Swal.fire({
        title: "Bem-vindo!",
        text: "Iniciando turno de entregas...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#141414",
        color: "#fff"
      });
      setTimeout(() => router.push("/"), 1500);
    } else {
      Swal.fire({
        title: "Erro",
        text: "Credenciais inválidas.",
        icon: "error",
        background: "#141414",
        color: "#fff"
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 transform -rotate-12 mb-6">
            <Bike className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white leading-none">
            Movieats <span className="text-primary block">Logística</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] mt-4 opacity-50">App do Entregador</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <input 
                type="password" 
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-14 bg-primary text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[12px] italic shadow-2xl shadow-primary/20 transform transition-all active:scale-95 mt-8"
          >
            Entrar no Sistema
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-[10px] text-white/20 font-medium uppercase tracking-widest">
          © 2026 SoftcloudBA • Elite Delivery
        </p>
      </div>
    </div>
  );
}
