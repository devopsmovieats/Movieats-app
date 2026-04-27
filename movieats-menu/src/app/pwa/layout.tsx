"use client";

import { UserProvider } from "@/context/UserContext";
import "./globals.css";

export default function PWALayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <div className="min-h-screen bg-black text-white selection:bg-primary/20">
        {children}
      </div>
    </UserProvider>
  );
}
