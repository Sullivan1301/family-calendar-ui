"use client";

import { UserPlus, MapPin, Cake, ExternalLink, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserStatus } from "@/types";
import { toast } from "sonner";

export default function MembersPage() {
  const { isAdmin } = useAuth();

  const handleInvite = () => {
    toast.success("Lien d'invitation généré ! (Fonctionnalité en cours)");
  };

  const members = [
    { id: "1", name: "Sullivan", role: "Super Admin", roleKey: "super-admin", age: 34, loc: "Antananarivo", initials: "SL", bday: "15 avr.", color: "from-tba-blue to-tba-cyan", status: "active" as UserStatus },
    { id: "2", name: "Anja", role: "Admin", roleKey: "admin", age: 62, loc: "Antananarivo", initials: "AN", bday: "18 mars", color: "from-emerald-700 to-emerald-500", status: "active" as UserStatus },
    { id: "3", name: "Tahina", role: "Membre", roleKey: "member", age: 65, loc: "Antananarivo", initials: "TH", bday: "22 juin", color: "from-amber-600 to-amber-400", status: "active" as UserStatus },
    { id: "4", name: "Nayah", role: "Membre", roleKey: "member", age: 28, loc: "Antsirabe", initials: "NY", bday: "9 sept.", color: "from-tba-red to-rose-400", status: "active" as UserStatus },
    { id: "5", name: "Yasina", role: "Membre", roleKey: "member", age: 27, loc: "Toamasina", initials: "YS", bday: "3 déc.", color: "from-blue-600 to-blue-400", status: "active" as UserStatus },
    { id: "6", name: "Rina", role: "Membre", roleKey: "member", age: 45, loc: "Mahajanga", initials: "RI", bday: "14 fév.", color: "from-slate-600 to-slate-400", status: "active" as UserStatus },
    { id: "7", name: "Mamitina", role: "Membre", roleKey: "member", age: 82, loc: "Toamasina", initials: "MA", bday: "10 mai", color: "from-purple-600 to-purple-400", status: "active" as UserStatus },
    { id: "8", name: "Annia", role: "Membre", roleKey: "member", age: 52, loc: "Antananarivo", initials: "AI", bday: "25 déc.", color: "from-pink-600 to-pink-400", status: "active" as UserStatus },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-tba-blue tracking-tight font-serif">Membres de la famille</h1>
          <p className="text-sm text-tba-gray mt-1.5 font-medium">8 membres — Gérez les profils et validations</p>
        </div>
        <button onClick={handleInvite} className="btn-primary flex items-center gap-2 py-2.5 px-6 text-sm">
          <UserPlus size={16} />
          Inviter un membre
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member) => (
          <MemberCard key={member.name} {...member} isAdminView={isAdmin} />
        ))}
        <div onClick={handleInvite} className="border-2 border-dashed border-tba-border rounded-tba p-8 flex flex-col items-center justify-center text-tba-muted hover:border-tba-blue hover:text-tba-blue transition-all duration-300 cursor-pointer group hover:bg-white/50">
          <div className="w-14 h-14 rounded-2xl bg-tba-surface flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-tba-blue/5 transition-all duration-300">
            <UserPlus size={22} />
          </div>
          <span className="font-medium text-sm">Ajouter un membre</span>
        </div>
      </div>
    </div>
  );
}

function MemberCard({ name, role, roleKey, age, loc, initials, bday, color, status, isAdminView }: any) {
  return (
    <div className="bg-white rounded-tba shadow-tba overflow-hidden hover:-translate-y-0.5 hover:shadow-tba-hover transition-all duration-300 group border border-tba-border">
      <div className={`h-20 bg-gradient-to-br ${color} relative`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} border-[3px] border-white absolute -bottom-7 left-5 shadow-lg flex items-center justify-center font-bold text-lg text-white z-10 ring-2 ring-white/20`}>
          {initials}
        </div>
      </div>
      <div className="pt-9 pb-5 px-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-semibold text-tba-blue">{name}</h3>
          <StatusBadge status={status} className="text-[0.6rem]" />
        </div>
        <div className="text-xs font-medium text-tba-muted mb-4">{age} ans — {loc}</div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          <span className="flex items-center gap-1 text-[0.65rem] font-medium text-tba-gray bg-tba-surface px-2.5 py-1 rounded-lg border border-tba-border/50">
            <MapPin size={11} className="text-tba-blue" /> {loc}
          </span>
          <span className="flex items-center gap-1 text-[0.65rem] font-medium text-tba-gray bg-tba-surface px-2.5 py-1 rounded-lg border border-tba-border/50">
            <Cake size={11} className="text-tba-red" /> {bday}
          </span>
          {roleKey === 'super-admin' && (
            <span className="flex items-center gap-1 text-[0.65rem] font-medium text-tba-blue bg-tba-blue/8 px-2.5 py-1 rounded-lg">
              <ShieldCheck size={11} /> Super Admin
            </span>
          )}
          {roleKey === 'admin' && (
            <span className="flex items-center gap-1 text-[0.65rem] font-medium text-tba-cyan bg-tba-cyan/8 px-2.5 py-1 rounded-lg">
              <ShieldCheck size={11} /> Admin
            </span>
          )}
        </div>

        {status === 'pending' && isAdminView && (
          <div className="bg-tba-yellow/8 border border-tba-yellow/15 rounded-xl p-3 mb-5 flex items-start gap-2">
            <AlertCircle className="text-tba-yellow shrink-0 mt-0.5" size={13} />
            <p className="text-[0.65rem] text-tba-text font-medium leading-tight">
              Ce membre attend votre validation pour accéder à l'intégralité du calendrier.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => toast.info(`Voir le profil de ${name}`)}
            className="flex-1 bg-tba-blue text-white font-medium text-xs py-2.5 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <ExternalLink size={13} /> Profil
          </button>
          <button
            onClick={() => toast.info(`Envoyer un message à ${name}`)}
            className="flex-1 border-2 border-tba-border text-tba-gray font-medium text-xs py-2.5 rounded-xl hover:bg-tba-blue hover:text-white hover:border-tba-blue transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <Mail size={13} /> Message
          </button>
        </div>
      </div>
    </div>
  );
}
