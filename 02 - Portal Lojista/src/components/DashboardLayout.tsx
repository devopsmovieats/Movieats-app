"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  );
}
