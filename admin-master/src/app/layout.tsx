/* eslint-disable */
import "./globals.css";

export const metadata = {
  title: "MOVIEATS | Admin Console",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
