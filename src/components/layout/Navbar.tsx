"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, Search, LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import { NotificationsPanel } from "./NotificationsPanel";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      toast.info(`Recherche de : "${search}"... (Fonctionnalité en cours de développement)`);
    }
  };

  const navLinks = [
    { name: "Tableau de bord", href: "/" },
    { name: "Événements", href: "/events" },
    { name: "Membres", href: "/members" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] h-14 bg-gradient-to-r from-tba-blue via-tba-blue to-[#1a3578] flex items-center justify-between px-6 md:px-8 transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-tba-blue/20" : ""}`}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="bg-white text-tba-blue w-8 h-8 rounded-lg flex items-center justify-center font-serif font-bold text-lg shadow-md group-hover:rotate-6 transition-transform duration-300">T</span>
          <div className="flex flex-col leading-none">
            <span className="text-white font-serif font-bold text-lg tracking-tight">BA</span>
            <span className="text-[0.55rem] font-semibold tracking-[0.15em] text-tba-cyan/80">FAMILIAL</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative text-[0.8rem] font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                pathname === item.href
                  ? "text-white bg-white/15"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.name}
              {pathname === item.href && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white/80 rounded-full" />
              )}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`relative text-[0.8rem] font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                pathname === "/admin"
                  ? "text-white bg-white/15"
                  : "text-tba-yellow/80 hover:text-tba-yellow hover:bg-white/5"
              }`}
            >
              <ShieldCheck size={13} /> Admin
              {pathname === "/admin" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white/80 rounded-full" />
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white/8 backdrop-blur-sm rounded-lg px-3.5 py-1.5 border border-white/10 focus-within:bg-white/15 focus-within:border-white/20 transition-all duration-200">
            <Search size={14} className="text-white/50" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/30 px-2.5 w-36"
            />
          </form>

          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tba-red border-2 border-tba-blue" />
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-none">{user?.name || "Sullivan"}</div>
                <div className="text-[0.6rem] font-medium text-tba-cyan/70 leading-none mt-0.5">
                  {isAdmin ? "Super Admin" : "Membre Famille"}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tba-cyan to-tba-blue border-2 border-white/30 flex items-center justify-center font-bold text-xs text-white group-hover:scale-105 transition-transform duration-200">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  user?.name?.[0] || "S"
                )}
              </div>
              <ChevronDown size={14} className="text-white/40 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[110]" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-tba-lg border border-tba-border py-1.5 z-[120] animate-scale-in">
                  <Link
                    href="/members"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-tba-gray hover:bg-tba-surface hover:text-tba-blue transition-colors"
                  >
                    Mon profil
                  </Link>
                  <div className="h-px bg-tba-border mx-3 my-1" />
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      toast.success("Déconnexion réussie !");
                    }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-tba-red hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut size={14} /> Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center text-white/70 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-tba-blue/95 backdrop-blur-xl border-t border-white/10 p-4 flex flex-col gap-2 lg:hidden animate-fade-in shadow-2xl">
            {[
              { name: "Tableau de bord", href: "/" },
              { name: "Événements", href: "/events" },
              { name: "Membres", href: "/members" },
              { name: "Administration", href: "/admin", adminOnly: true },
              { name: "Créer un événement", href: "/new-event" },
            ].map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium p-3.5 rounded-xl transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      </nav>
    </>
  );
}
