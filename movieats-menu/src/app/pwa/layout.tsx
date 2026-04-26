"use client";

import "./globals.css";

export default function PWALayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/20">
      {children}
    </div>
  );
}
