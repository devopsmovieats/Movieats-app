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
  title: "MOVIEATS | Portal do Estabelecimento",
  description: "Gestão operacional para lojistas Movieats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} ${manrope.variable} antialiased selection:bg-primary/30 font-body transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}
