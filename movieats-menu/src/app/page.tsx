"use client";

import Link from "next/link";
import { Flame, ShoppingBag, ShieldCheck } from "lucide-react";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-orange-600/10 rounded-3xl border border-orange-600/20">
          <Flame className="w-12 h-12 text-orange-600 fill-orange-600" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Movieats Ecosystem</h1>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Selecione um módulo para acessar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link 
          href="/pwa"
          className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center text-center space-y-4"
        >
          <ShoppingBag className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white uppercase tracking-tight italic">Cardápio Digital</h2>
            <p className="text-xs text-white/30 font-bold uppercase tracking-wider">Módulo do Cliente (PWA)</p>
          </div>
        </Link>

        <Link 
          href="/login"
          className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center text-center space-y-4"
        >
          <ShieldCheck className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
          <div className="space-y-1">
            <h2 className="text-lg font-black text-white uppercase tracking-tight italic">Painel do Dono</h2>
            <p className="text-xs text-white/30 font-bold uppercase tracking-wider">Administração (Dashboard)</p>
          </div>
        </Link>
      </div>

      <div className="pt-12 border-t border-white/5 w-full max-w-xs text-center">
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">© 2026 Movieats Technology</p>
      </div>
    </div>
  );
}
