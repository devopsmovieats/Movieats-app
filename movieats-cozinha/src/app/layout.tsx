import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movieats | Painel da Cozinha KDS",
  description: "Sistema de gestão de pedidos KDS Movieats",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${manrope.variable} antialiased dark font-sans relative min-h-screen overflow-x-hidden`}>
        <UserProvider>
          {/* Global Background Image for the entire flow */}
          <div className="fixed inset-0 z-0">
            <img 
              src="/images/bg-painel-cozinha.png" 
              alt="Kitchen Background" 
              className="w-full h-full object-cover grayscale-[20%] brightness-[30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
          </div>

          {/* Content wrapper */}
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
