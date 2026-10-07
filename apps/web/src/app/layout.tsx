import type { Metadata } from "next";
import { AppShell } from "../components/layout/AppShell";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "../components/ui/sonner";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: "TBA – Calendrier Familial",
  description: "Interface web responsive pour la gestion du calendrier familial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="antialiased bg-gradient-to-br from-tba-surface via-white to-tba-bg-light min-h-screen font-sans">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
