export default function PWALayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-primary/20">
      {children}
    </div>
  );
}
