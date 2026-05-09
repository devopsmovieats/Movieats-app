"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase">Portal Admin Ativo</h1>
        <p className="text-zinc-500 font-medium">O sistema foi configurado e está pronto para uso.</p>
        <div className="pt-4">
          <a 
            href="/login" 
            className="px-8 py-4 bg-[#ff5c00] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#e65300] transition-all rounded-none"
          >
            Acessar Painel
          </a>
        </div>
      </div>
    </div>
  );
}
