"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userSaved = localStorage.getItem("movieats_user");
    if (userSaved) {
      const user = JSON.parse(userSaved);
      setUserRole(user.role);

      // Trava de Rota para Gerente
      if (user.role === "GERENTE" && pathname.startsWith("/configuracoes")) {
        router.push("/");
      }

      // Trava de Rota para Atendente
      if (user.role === "ATENDENTE") {
        const restrictedPaths = ["/financeiro", "/estoque", "/configuracoes", "/geral/grupos-adicionais"];
        if (restrictedPaths.some(path => pathname.startsWith(path))) {
          router.push("/");
        }
      }
    }
  }, [pathname, router]);
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 p-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
