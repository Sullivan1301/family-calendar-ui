import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import Script from "next/script";

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
      <body className="antialiased bg-background min-h-screen font-sans">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="a81e45e8-f001-4975-84b2-a837e9bbb846"
        />
        <AuthProvider>
          <Navbar />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 lg:ml-[260px] flex flex-col pt-16">
              <main className="p-6 md:p-10 flex-1 max-w-[1600px] mx-auto w-full">
                {children}
              </main>
              <footer className="p-6 md:px-10 bg-white border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-muted-foreground">
                <div>
                  © 2026 <strong className="text-tba-blue font-serif">TBA</strong> – Calendrier Familial. Tous droits réservés.
                </div>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-tba-blue transition-colors uppercase tracking-widest text-[0.65rem]">Aide</a>
                  <a href="#" className="hover:text-tba-blue transition-colors uppercase tracking-widest text-[0.65rem]">Confidentialité</a>
                  <a href="#" className="hover:text-tba-blue transition-colors uppercase tracking-widest text-[0.65rem]">Contact</a>
                </div>
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
