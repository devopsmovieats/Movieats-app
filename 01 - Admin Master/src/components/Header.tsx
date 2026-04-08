"use client";

import { Bell, HelpCircle, Calendar } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-background/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-10 border-b border-white/[0.03]">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-headline font-black text-white uppercase tracking-tight">
          Dashboard
        </h1>
        
        {/* Date Picker Component */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
          <Calendar className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-muted-foreground">Terça, 24 Outubro</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group relative">
          <Bell className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
          <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background animate-pulse"></span>
        </button>
        
        <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
          <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-[1.5px] cursor-pointer hover:scale-105 transition-transform ml-2">
          <div className="w-full h-full rounded-full bg-black overflow-hidden ring-1 ring-white/10">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Profile" 
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
