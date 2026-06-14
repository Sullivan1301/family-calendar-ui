import type { Metadata } from "next";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
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
          <Navbar />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 lg:ml-[260px] flex flex-col pt-14">
              <main className="p-6 md:p-8 flex-1 max-w-[1600px] mx-auto w-full">
                {children}
              </main>
              <footer className="px-6 md:px-8 py-4 border-t border-tba-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-tba-muted">
                <div>
                  &copy; 2026 <strong className="text-tba-blue font-serif">TBA</strong> – Calendrier Familial
                </div>
                <div className="flex gap-5">
                  <a href="#" className="hover:text-tba-blue transition-colors duration-200">Aide</a>
                  <a href="#" className="hover:text-tba-blue transition-colors duration-200">Confidentialité</a>
                  <a href="#" className="hover:text-tba-blue transition-colors duration-200">Contact</a>
                </div>
              </footer>
            </div>
          </div>
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      <Analytics/>
      </body>
    </html>
  );
}
