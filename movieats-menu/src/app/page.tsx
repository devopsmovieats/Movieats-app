"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para o PWA (Cardápio) por padrão na raiz
    router.push("/pwa");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse text-white/20 text-sm font-black uppercase tracking-widest">
        Movieats Ecosystem
      </div>
    </div>
  );
}
