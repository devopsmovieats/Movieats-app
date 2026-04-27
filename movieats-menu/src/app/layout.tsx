import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
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
  title: "Movieats | Cardápio Digital",
  description: "Experiência gastronômica digital Movieats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${manrope.variable} antialiased dark font-sans relative min-h-screen overflow-x-hidden`}>
        {/* Global Background Image for the entire flow */}
        <div className="fixed inset-0 z-0">
          <img 
            src="/images/bg-identificacao.png" 
            alt="Food Background" 
            className="w-full h-full object-cover grayscale-[20%] brightness-[40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
