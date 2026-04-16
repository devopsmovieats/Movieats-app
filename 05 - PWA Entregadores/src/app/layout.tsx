import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: 0,
};

export const metadata: Metadata = {
  title: "Movieats Logística | App do Entregador",
  description: "Sistema de gestão de entregas Movieats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased dark" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
