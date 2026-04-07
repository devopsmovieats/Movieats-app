"use client";

import { Bell, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 bg-muted/50 border border-border px-4 py-2 rounded-xl w-96 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Pesquisar por lojistas, pedidos ou suporte..."
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-xl hover:bg-muted relative transition-colors duration-200 group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background animate-pulse"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-border mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">Admin Master</p>
            <p className="text-xs text-muted-foreground">admin@movieats.com.br</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center border-2 border-background shadow-lg shadow-primary/20">
            <User className="text-white w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
