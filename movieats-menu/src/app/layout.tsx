import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movieats Burgers | Cardápio Digital",
  description: "Peça os melhores burgers da cidade pelo nosso cardápio digital.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased dark">
        {children}
      </body>
    </html>
  );
}
