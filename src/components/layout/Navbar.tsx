"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, Search, User, ShieldCheck } from "lucide-react";
import { NotificationsPanel } from "./NotificationsPanel";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-16 bg-tba-blue flex items-center justify-between px-6 md:px-10 shadow-lg shadow-tba-blue/20">
      <Link href="/" className="flex items-center gap-3 font-serif font-black text-2xl text-white tracking-tight group">
        <span className="bg-white text-tba-blue w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">T</span>
        <div className="flex flex-col leading-none">
          <span className="text-xl">BA</span>
          <span className="text-[0.6rem] font-sans font-black tracking-[0.2em] text-tba-cyan">FAMILIAL</span>
        </div>
      </Link>
      
      <div className="hidden lg:flex items-center gap-2">
        {[
          { name: "Tableau de bord", href: "/" },
          { name: "Événements", href: "/events" },
          { name: "Membres", href: "/members" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all uppercase tracking-wider ${
              pathname === item.href
                ? "bg-white/20 text-white backdrop-blur-md border border-white/10"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {item.name}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all uppercase tracking-wider flex items-center gap-2 ${
              pathname === "/admin"
                ? "bg-white/20 text-white backdrop-blur-md border border-white/10"
                : "text-tba-yellow hover:text-white hover:bg-white/10"
            }`}
          >
            <ShieldCheck size={14} /> Admin
          </Link>
        )}
        <Link href="/new-event" className="bg-tba-red text-white font-bold py-2 px-6 ml-4 text-xs tracking-widest uppercase rounded-full hover:opacity-90 transition-all shadow-lg shadow-tba-red/20">
          + Nouveau
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-white/10 rounded-full px-4 py-1.5 border border-white/10 focus-within:bg-white/20 transition-all">
          <Search size={14} className="text-white/60" />
          <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/40 px-2 w-32" />
        </div>
        
        <button 
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all group"
        >
          <Bell size={20} className="group-hover:animate-pulse" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-tba-red border-2 border-tba-blue shadow-sm"></span>
        </button>
        
        <div className="h-8 w-px bg-white/10 hidden sm:block" />
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white leading-none">{user?.name || 'Sullivan'}</div>
            <div className="text-[0.6rem] font-bold text-tba-cyan uppercase tracking-tighter">
              {isAdmin ? 'Super Admin' : 'Membre Famille'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-tba-cyan to-tba-blue border-2 border-white/40 flex items-center justify-center font-black text-sm text-white shadow-md group-hover:scale-110 transition-transform overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0] || 'S'
            )}
          </div>
        </div>

        <button 
          className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-tba-blue border-t border-white/10 p-6 flex flex-col gap-4 lg:hidden animate-fade-in shadow-2xl">
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
                className={`text-sm font-bold p-4 rounded-xl transition-all ${
                  pathname === item.href
                    ? "bg-white/20 text-white"
                    : "text-white/70 bg-white/5"
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
  );
}
