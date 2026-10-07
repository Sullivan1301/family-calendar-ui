"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { FamilyGate } from "./FamilyGate";

/** Routes affichées sans la navigation de l'application. */
const bareRoutes = ["/login", "/onboarding"];

function isBare(pathname: string) {
  return (
    bareRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/invitation/")
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isBare(pathname)) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-[260px] flex flex-col pt-14">
          <main className="p-6 md:p-8 flex-1 max-w-[1600px] mx-auto w-full">
            <FamilyGate>{children}</FamilyGate>
          </main>
          <footer className="px-6 md:px-8 py-4 border-t border-tba-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-tba-muted">
            <div>
              &copy; {new Date().getFullYear()}{" "}
              <strong className="text-tba-blue font-serif">TBA</strong> – Calendrier Familial
            </div>
            <div className="flex gap-5">
              <a href="#" className="hover:text-tba-blue transition-colors duration-200">Aide</a>
              <a href="#" className="hover:text-tba-blue transition-colors duration-200">Confidentialité</a>
              <a href="#" className="hover:text-tba-blue transition-colors duration-200">Contact</a>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
