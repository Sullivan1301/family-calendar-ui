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

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const menuItems = [
    { name: "Tableau de bord", icon: <LayoutDashboard size={18} />, href: "/" },
    { name: "Événements", icon: <PartyPopper size={18} />, href: "/events", count: 12 },
    { name: "Membres", icon: <Users size={18} />, href: "/members" },
    { name: "Nouveau", icon: <PlusCircle size={18} />, href: "/new-event" },
  ];

  if (isAdmin) {
    menuItems.push({ name: "Administration", icon: <ShieldCheck size={18} />, href: "/admin" });
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
    <aside className="fixed top-[var(--nav-h)] left-0 bottom-0 w-[260px] overflow-y-auto bg-white border-r border-tba-border p-6 hidden lg:flex flex-col gap-2 scrollbar-thin scrollbar-thumb-tba-border">
      <div className="mb-6">
        <div className="text-[0.65rem] font-bold tracking-widest text-tba-gray-light uppercase px-4 mb-4">Navigation principale</div>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left group ${
                pathname === item.href
                  ? "bg-tba-blue text-white shadow-lg shadow-tba-blue/20"
                  : "text-tba-gray hover:bg-tba-surface2 hover:text-tba-blue"
              }`}
            >
              <span className={`transition-transform duration-300 ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              {item.name}
              {item.count && (
                <span className={`ml-auto text-[0.65rem] font-black px-2 py-0.5 rounded-full ${pathname === item.href ? 'bg-white/20 text-white' : 'bg-tba-red text-white'}`}>
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 bg-tba-surface2 rounded-2xl border border-tba-border/50">
        <div className="text-[0.65rem] font-bold tracking-widest text-tba-gray-light uppercase mb-4">Filtres rapides</div>
        <div className="space-y-4">
          <div>
            <div className="text-[0.7rem] font-bold text-tba-blue mb-2 flex items-center gap-2">
              <Calendar size={12} /> Catégories
            </div>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <span
                  key={type.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.65rem] font-bold cursor-pointer border-2 border-white bg-white text-tba-gray hover:border-tba-blue hover:text-tba-blue transition-all shadow-sm"
                >
                  {type.icon} {type.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[0.7rem] font-bold text-tba-blue mb-2 flex items-center gap-2">
              <MapPin size={12} /> Localisation
            </div>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.65rem] font-bold cursor-pointer border-2 border-white bg-white text-tba-gray hover:border-tba-blue hover:text-tba-blue transition-all shadow-sm"
                >
                  📍 {loc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="text-[0.65rem] font-bold tracking-widest text-tba-gray-light uppercase px-4 mb-4">Ma Famille</div>
        <div className="space-y-1">
          {members.map((member) => (
            <Link
              key={member.name}
              href="/members"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-tba-gray hover:bg-tba-surface2 hover:text-tba-blue transition-all group"
            >
              <div className="relative">
                <span className={`w-8 h-8 rounded-full bg-linear-to-br ${member.color} flex items-center justify-center text-[0.65rem] text-white font-black shrink-0 border-2 border-white shadow-sm group-hover:scale-110 transition-transform`}>
                  {member.initials}
                </span>
                {member.status && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <span className="truncate">{member.name}</span>
            </Link>
          ))}
        </div>
      </div>
      
      <SupportProject />
      
      <div className="mt-8 flex gap-2 pt-6 border-t border-tba-border">
        <button className="w-10 h-10 rounded-xl bg-tba-surface2 flex items-center justify-center text-tba-gray hover:bg-tba-blue hover:text-white transition-all">
          <Settings size={18} />
        </button>
        <button className="w-10 h-10 rounded-xl bg-tba-surface2 flex items-center justify-center text-tba-gray hover:bg-tba-blue hover:text-white transition-all">
          <HelpCircle size={18} />
        </button>
      </div>
    </aside>
  );
}
