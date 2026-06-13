"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  PartyPopper,
  Users,
  PlusCircle,
  MapPin,
  LayoutDashboard,
  Settings,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { SupportProject } from "./SupportProject";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const handleFilterClick = (type: string, name: string) => {
    toast.info(`Filtre par ${type} : "${name}"... (Fonctionnalité en cours de développement)`);
  };

  const menuItems = [
    { name: "Tableau de bord", icon: <LayoutDashboard size={17} />, href: "/" },
    { name: "Événements", icon: <PartyPopper size={17} />, href: "/events", count: 12 },
    { name: "Membres", icon: <Users size={17} />, href: "/members" },
    { name: "Nouveau", icon: <PlusCircle size={17} />, href: "/new-event" },
  ];

  if (isAdmin) {
    menuItems.push({ name: "Administration", icon: <ShieldCheck size={17} />, href: "/admin" });
  }

  const types = [
    { name: "Anniversaire", icon: "🎂" },
    { name: "Vacances", icon: "🏖️" },
    { name: "Réunion", icon: "👨‍👩‍👧" },
    { name: "Sortie", icon: "🎭" },
  ];

  const locations = ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga"];

  const members = [
    { name: "Sullivan", initials: "SL", status: "En ligne", color: "from-tba-blue to-tba-cyan" },
    { name: "Anja", initials: "AN", status: null, color: "from-emerald-600 to-emerald-400" },
    { name: "Tahina", initials: "TH", status: null, color: "from-amber-600 to-amber-400" },
    { name: "Nayah", initials: "NY", status: null, color: "from-tba-red to-rose-400" },
  ];

  return (
    <aside className="fixed top-[var(--nav-h)] left-0 bottom-0 w-[260px] overflow-y-auto bg-tba-surface border-r border-tba-border p-5 hidden lg:flex flex-col gap-1 scrollbar-thin scrollbar-thumb-tba-border">
      <div className="mb-5">
        <div className="section-label px-3 mb-3">Navigation</div>
        <div className="space-y-0.5">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left group relative ${
                pathname === item.href
                  ? "bg-tba-blue text-white shadow-md shadow-tba-blue/15"
                  : "text-tba-gray hover:bg-white hover:text-tba-blue hover:shadow-sm"
              }`}
            >
              {pathname === item.href && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/60 rounded-r-full" />
              )}
              <span className={`transition-transform duration-200 ${pathname === item.href ? "" : "group-hover:scale-110"}`}>{item.icon}</span>
              {item.name}
              {item.count && (
                <span className={`ml-auto text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${pathname === item.href ? "bg-white/20 text-white" : "bg-tba-red/10 text-tba-red"}`}>
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-5 p-4 bg-white rounded-tba border border-tba-border/50">
        <div className="section-label mb-3">Filtres rapides</div>
        <div className="space-y-3.5">
          <div>
            <div className="text-[0.7rem] font-semibold text-tba-gray mb-2 flex items-center gap-1.5">
              <Calendar size={12} /> Catégories
            </div>
            <div className="flex flex-wrap gap-1.5">
              {types.map((type) => (
                <span
                  key={type.name}
                  onClick={() => handleFilterClick("catégorie", type.name)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.65rem] font-medium cursor-pointer border border-tba-border bg-tba-surface text-tba-gray hover:border-tba-blue hover:text-tba-blue hover:bg-white transition-all duration-200"
                >
                  {type.icon} {type.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[0.7rem] font-semibold text-tba-gray mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> Localisation
            </div>
            <div className="flex flex-wrap gap-1.5">
              {locations.map((loc) => (
                <span
                  key={loc}
                  onClick={() => handleFilterClick("localisation", loc)}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[0.65rem] font-medium cursor-pointer border border-tba-border bg-tba-surface text-tba-gray hover:border-tba-blue hover:text-tba-blue hover:bg-white transition-all duration-200"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="section-label px-3 mb-3">Ma Famille</div>
        <div className="space-y-0.5">
          {members.map((member) => (
            <Link
              key={member.name}
              href="/members"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-tba-gray hover:bg-white hover:text-tba-blue hover:shadow-sm transition-all duration-200 group"
            >
              <div className="relative">
                <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-[0.6rem] text-white font-bold shrink-0 border border-white/50 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  {member.initials}
                </span>
                {member.status && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-tba-surface rounded-full" />
                )}
              </div>
              <span className="truncate">{member.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <SupportProject />

      <div className="mt-6 flex gap-1.5 pt-4 border-t border-tba-border">
        <button
          onClick={() => toast.info("Paramètres : Fonctionnalité en cours de développement")}
          className="w-9 h-9 rounded-lg bg-white border border-tba-border flex items-center justify-center text-tba-muted hover:bg-tba-blue hover:text-white hover:border-tba-blue transition-all duration-200"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={() => toast.info("Aide : Fonctionnalité en cours de développement")}
          className="w-9 h-9 rounded-lg bg-white border border-tba-border flex items-center justify-center text-tba-muted hover:bg-tba-blue hover:text-white hover:border-tba-blue transition-all duration-200"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </aside>
  );
}
