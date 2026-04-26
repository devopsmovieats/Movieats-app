import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movieats | Ecosystem",
  description: "Unified platform for Movieats",
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
