"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  PartyPopper,
  Users,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Home,
  Check,
} from "lucide-react";
import { SupportProject } from "./SupportProject";
import { useApi } from "../../hooks/useApi";

interface SidebarMember {
  id: string;
  userId: string;
  status: string;
  role: string;
  user?: { id: string; name: string | null; email: string; image: string | null };
}

const palettes = [
  "from-tba-blue to-tba-cyan",
  "from-emerald-700 to-emerald-500",
  "from-amber-600 to-amber-400",
  "from-tba-red to-rose-400",
  "from-blue-600 to-blue-400",
  "from-slate-600 to-slate-400",
  "from-purple-600 to-purple-400",
  "from-pink-600 to-pink-400",
];

function paletteFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 997;
  return palettes[hash % palettes.length];
}

function initialsOf(label: string) {
  return (
    label
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, families, activeFamily, setActiveFamily } = useAuth();

  const { data: eventsData } = useApi<{ events: { id: string; status: string }[] }>(
    activeFamily ? `/api/events?familyId=${activeFamily.id}` : null
  );
  const { data: membersData } = useApi<{ members: SidebarMember[] }>(
    activeFamily ? `/api/families/${activeFamily.id}/members` : null
  );

  const events = eventsData?.events ?? [];
  const pendingCount = events.filter((e) => e.status === "pending").length;
  const members = (membersData?.members ?? []).filter((m) => m.status === "active");

  const menuItems: {
    name: string;
    icon: React.ReactNode;
    href: string;
    count?: number;
  }[] = [
    { name: "Tableau de bord", icon: <LayoutDashboard size={18} />, href: "/" },
    {
      name: "Événements",
      icon: <PartyPopper size={18} />,
      href: "/events",
      count: events.length || undefined,
    },
    { name: "Membres", icon: <Users size={18} />, href: "/members" },
    { name: "Nouveau", icon: <PlusCircle size={18} />, href: "/new-event" },
  ];

  if (isAdmin) {
    menuItems.push({
      name: "Administration",
      icon: <ShieldCheck size={18} />,
      href: "/admin",
      count: pendingCount || undefined,
    });
  }

  return (
    <aside className="fixed top-[var(--nav-h)] left-0 bottom-0 w-[260px] overflow-y-auto bg-white border-r border-tba-border p-6 hidden lg:flex flex-col gap-2 scrollbar-thin scrollbar-thumb-tba-border">
      <div className="mb-6">
        <div className="text-[0.65rem] font-bold tracking-widest text-tba-gray-light uppercase px-4 mb-4">
          Navigation principale
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left group ${
                  isActive
                    ? "bg-tba-blue text-white shadow-lg shadow-tba-blue/20"
                    : "text-tba-gray hover:bg-tba-surface2 hover:text-tba-blue"
                }`}
              >
                <span
                  className={`transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {item.icon}
                </span>
                {item.name}
                {item.count !== undefined && (
                  <span
                    className={`ml-auto text-[0.65rem] font-black px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-tba-red text-white"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {families.length > 1 && (
        <div className="mb-6 p-4 bg-tba-surface2 rounded-2xl border border-tba-border/50">
          <div className="text-[0.65rem] font-bold tracking-widest text-tba-gray-light uppercase mb-3">
            Mes familles
          </div>
          <div className="space-y-1">
            {families.map((family) => {
              const isCurrent = family.id === activeFamily?.id;
              return (
                <button
                  key={family.id}
                  onClick={() => setActiveFamily(family)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    isCurrent
                      ? "bg-white text-tba-blue shadow-sm"
                      : "text-tba-gray hover:bg-white/60 hover:text-tba-blue"
                  }`}
                >
                  <Home size={13} className="shrink-0" />
                  <span className="truncate flex-1">{family.name}</span>
                  {isCurrent && <Check size={13} className="shrink-0 text-tba-cyan" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <div className="text-[0.65rem] font-bold tracking-widest text-tba-gray-light uppercase px-4 mb-4">
          {activeFamily?.name || "Ma Famille"}
        </div>
        <div className="space-y-1">
          {members.length === 0 && (
            <p className="px-4 text-xs text-tba-gray-light">Aucun membre actif.</p>
          )}
          {members.map((member) => {
            const name = member.user?.name || member.user?.email || "Membre";
            const isSelf = member.userId === user?.id;
            return (
              <Link
                key={member.id}
                href="/members"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-tba-gray hover:bg-tba-surface2 hover:text-tba-blue transition-all group"
              >
                <div className="relative">
                  <span
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${paletteFor(
                      member.userId
                    )} flex items-center justify-center text-[0.65rem] text-white font-black shrink-0 border-2 border-white shadow-sm group-hover:scale-110 transition-transform overflow-hidden`}
                  >
                    {member.user?.image ? (
                      <img
                        src={member.user.image}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initialsOf(name)
                    )}
                  </span>
                  {isSelf && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <span className="truncate">{name}</span>
                {member.role !== "member" && (
                  <ShieldCheck size={13} className="ml-auto shrink-0 text-tba-cyan" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <SupportProject />
    </aside>
  );
}
