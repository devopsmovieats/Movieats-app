"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter">MOVIEATS ADMIN MASTER</h1>
        <p className="text-zinc-500">O sistema está carregando corretamente.</p>
        <div className="mt-8">
          <a 
            href="/login" 
            className="px-6 py-3 bg-[#ff5c00] text-white font-bold rounded-none hover:bg-[#e65300] transition-all"
          >
            ACESSAR PAINEL
          </a>
        </div>
      </div>
    </div>
  );
}
