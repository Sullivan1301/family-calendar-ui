"use client";

import { UserPlus, MessageCircle, MapPin, Cake, ExternalLink, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserStatus } from "@/types";

export default function MembersPage() {
    const { isAdmin } = useAuth();
    
    const members = [
      { id: "1", name: "Sullivan", role: "Super Admin", roleKey: "super-admin", age: 34, loc: "Antananarivo", initials: "SL", bday: "15 avr.", color: "from-tba-blue to-tba-cyan", availability: ["avail", "avail", "avail", "maybe", "avail", "avail", "empty"], status: "active" as UserStatus },
      { id: "2", name: "Anja", role: "Admin", roleKey: "admin", age: 62, loc: "Antananarivo", initials: "AN", bday: "18 mars", color: "from-emerald-700 to-emerald-500", availability: ["avail", "busy", "busy", "avail", "avail", "avail", "avail"], status: "active" as UserStatus },
      { id: "3", name: "Tahina", role: "Membre", roleKey: "member", age: 65, loc: "Antananarivo", initials: "TH", bday: "22 juin", color: "from-amber-600 to-amber-400", availability: ["avail", "avail", "maybe", "avail", "busy", "avail", "avail"], status: "active" as UserStatus },
      { id: "4", name: "Nayah", role: "Membre", roleKey: "member", age: 28, loc: "Antsirabe", initials: "NY", bday: "9 sept.", color: "from-tba-red to-rose-400", availability: ["busy", "busy", "avail", "avail", "maybe", "busy", "avail"], status: "active" as UserStatus },
      { id: "5", name: "Yasina", role: "Membre", roleKey: "member", age: 27, loc: "Toamasina", initials: "YS", bday: "3 déc.", color: "from-blue-600 to-blue-400", availability: ["avail", "avail", "avail", "avail", "avail", "maybe", "avail"], status: "active" as UserStatus },
      { id: "6", name: "Rina", role: "Membre", roleKey: "member", age: 45, loc: "Mahajanga", initials: "RI", bday: "14 fév.", color: "from-slate-600 to-slate-400", availability: ["avail", "maybe", "avail", "busy", "avail", "avail", "maybe"], status: "active" as UserStatus },
      { id: "7", name: "Mamitina", role: "Membre", roleKey: "member", age: 82, loc: "Toamasina", initials: "MA", bday: "10 mai", color: "from-purple-600 to-purple-400", availability: ["avail", "avail", "avail", "avail", "avail", "avail", "avail"], status: "active" as UserStatus },
      { id: "8", name: "Annia", role: "Membre", roleKey: "member", age: 52, loc: "Antananarivo", initials: "AI", bday: "25 déc.", color: "from-pink-600 to-pink-400", availability: ["avail", "maybe", "avail", "avail", "avail", "maybe", "avail"], status: "active" as UserStatus },
    ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
            <h1 className="text-4xl md:text-5xl font-bold text-tba-blue tracking-tight">Membres de la famille</h1>
            <p className="text-base text-tba-gray mt-2 font-sans font-normal">8 membres · Gérez les profils et validations</p>
        </div>
        <button className="btn-primary flex items-center gap-2 py-3 px-8">
          <UserPlus size={18} />
          <span>+ Inviter un membre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <MemberCard key={member.name} {...member} isAdminView={isAdmin} />
        ))}
        {/* Add Member Placeholder */}
        <div className="border-2 border-dashed border-border rounded-tba p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-tba-blue hover:text-tba-blue transition-all cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UserPlus size={24} />
          </div>
          <span className="font-bold">Ajouter un membre</span>
        </div>
      </div>
    </div>
  );
}

function MemberCard({ name, role, roleKey, age, loc, initials, bday, color, status, isAdminView }: any) {
  return (
    <div className="bg-white rounded-tba shadow-tba overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-tba-lg transition-all group border border-border">
      <div className={`h-24 bg-linear-to-br ${color} relative px-6 flex items-end shadow-inner`}>
        <div className="absolute inset-0 bg-black/5" />
        <div className={`w-16 h-16 rounded-full bg-linear-to-br ${color} border-4 border-white absolute -bottom-8 left-6 shadow-lg flex items-center justify-center font-black text-xl text-white z-10`}>
          {initials}
        </div>
      </div>
      <div className="pt-10 pb-6 px-6">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-tba-blue">{name}</h3>
          <StatusBadge status={status} />
        </div>
        <div className="text-xs font-semibold text-muted-foreground mb-4">{age} ans · {loc}</div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="flex items-center gap-1.5 text-[0.7rem] font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full"><MapPin size={12} className="text-tba-blue" /> {loc}</span>
          <span className="flex items-center gap-1.5 text-[0.7rem] font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full"><Cake size={12} className="text-tba-red" /> {bday}</span>
          {roleKey === 'super-admin' && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold text-tba-blue bg-tba-blue/10 px-3 py-1 rounded-full"><ShieldCheck size={12} /> Super Admin</span>
          )}
          {roleKey === 'admin' && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold text-tba-cyan bg-tba-cyan/10 px-3 py-1 rounded-full"><ShieldCheck size={12} /> Admin</span>
          )}
        </div>
        
        {status === 'pending' && isAdminView && (
          <div className="bg-tba-yellow/10 border border-tba-yellow/20 rounded-xl p-3 mb-6 flex items-start gap-2">
            <AlertCircle className="text-tba-yellow shrink-0 mt-0.5" size={14} />
            <p className="text-[0.65rem] text-tba-text font-medium leading-tight">
              Ce membre attend votre validation pour accéder à l'intégralité du calendrier.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button className="flex-1 bg-tba-blue text-white font-bold text-xs py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <ExternalLink size={14} /> Profil
          </button>
          <button className="flex-1 border-2 border-tba-blue text-tba-blue font-bold text-xs py-2.5 rounded-xl hover:bg-tba-blue hover:text-white transition-all flex items-center justify-center gap-2">
            <Mail size={14} /> Message
          </button>
        </div>
      </div>
    </div>
  );
}
