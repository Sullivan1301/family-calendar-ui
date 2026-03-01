"use client";

import { useState } from "react";
import { 
  Users, 
  PartyPopper, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Filter,
  Search,
  MoreVertical,
  Check,
  X,
  History,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserStatus, EventStatus, User, Event } from "@/types";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'history'>('members');

  // Mock data for validations
  const [pendingMembers, setPendingMembers] = useState<any[]>([
    { id: "1", name: "Anja", email: "anja@tba.mg", date: "01/03/2026", status: "pending" as UserStatus, avatar: "AN" },
    { id: "2", name: "Tahina", email: "tahina@tba.mg", date: "28/02/2026", status: "pending" as UserStatus, avatar: "TH" },
  ]);

  const [pendingEvents, setPendingEvents] = useState<any[]>([
    { id: "e1", title: "Mariage de Rina", type: "Mariage", date: "15/08/2026", creator: "Rina", status: "pending" as EventStatus },
    { id: "e2", title: "Baptême de Nayah", type: "Baptême", date: "22/05/2026", creator: "Tahina", status: "pending" as EventStatus },
  ]);

  const [history, setHistory] = useState<any[]>([
    { id: "h1", action: "Approbation Membre", target: "Nayah", admin: "Sullivan", date: "Aujourd'hui, 10:30", status: "approved" },
    { id: "h2", action: "Approbation Événement", target: "Anniversaire Mamitina", admin: "Sullivan", date: "Hier, 15:45", status: "approved" },
    { id: "h3", action: "Rejet Membre", target: "Inconnu", admin: "Sullivan", date: "26/02/2026", status: "rejected" },
  ]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-tba-red/10 flex items-center justify-center mb-6">
          <ShieldAlert size={40} className="text-tba-red" />
        </div>
        <h1 className="text-2xl font-bold text-tba-blue mb-2">Accès restreint</h1>
        <p className="text-muted-foreground max-w-md">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page. 
          Veuillez contacter le Super Admin Sullivan si vous pensez qu'il s'agit d'une erreur.
        </p>
      </div>
    );
  }

  const handleMemberAction = (id: string, action: 'approved' | 'rejected') => {
    const member = pendingMembers.find(m => m.id === id);
    if (member) {
      setPendingMembers(prev => prev.filter(m => m.id !== id));
      setHistory(prev => [{ 
        id: Date.now().toString(), 
        action: action === 'approved' ? "Approbation Membre" : "Rejet Membre", 
        target: member.name, 
        admin: "Sullivan", 
        date: "À l'instant", 
        status: action 
      }, ...prev]);
      toast.success(action === 'approved' ? `Membre ${member.name} approuvé !` : `Membre ${member.name} rejeté.`);
    }
  };

  const handleEventAction = (id: string, action: 'approved' | 'rejected') => {
    const event = pendingEvents.find(e => e.id === id);
    if (event) {
      setPendingEvents(prev => prev.filter(e => e.id !== id));
      setHistory(prev => [{ 
        id: Date.now().toString(), 
        action: action === 'approved' ? "Approbation Événement" : "Rejet Événement", 
        target: event.title, 
        admin: "Sullivan", 
        date: "À l'instant", 
        status: action 
      }, ...prev]);
      toast.success(action === 'approved' ? `Événement ${event.title} approuvé !` : `Événement ${event.title} rejeté.`);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={18} className="text-tba-blue" />
            <span className="text-xs font-bold text-tba-blue uppercase tracking-widest">Panel d'administration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-tba-blue tracking-tight">Gestion & Validations</h1>
          <p className="text-base text-muted-foreground mt-2 font-sans font-normal">
            Gérez les nouveaux membres et approuvez les événements sensibles.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-tba border border-border">
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'members' ? 'bg-tba-blue text-white shadow-md' : 'text-muted-foreground hover:bg-tba-bg-light hover:text-tba-blue'}`}
          >
            <Users size={16} /> Membres ({pendingMembers.length})
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'events' ? 'bg-tba-blue text-white shadow-md' : 'text-muted-foreground hover:bg-tba-bg-light hover:text-tba-blue'}`}
          >
            <PartyPopper size={16} /> Événements ({pendingEvents.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-tba-blue text-white shadow-md' : 'text-muted-foreground hover:bg-tba-bg-light hover:text-tba-blue'}`}
          >
            <History size={16} /> Historique
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="En attente" value={pendingMembers.length + pendingEvents.length} subtitle="Membres & Événements" icon={<Clock size={20} />} color="bg-tba-yellow" textColor="text-tba-text" />
        <StatCard title="Validés" value={history.filter(h => h.status === 'approved').length} subtitle="Derniers 30 jours" icon={<CheckCircle size={20} />} color="bg-emerald-500" />
        <StatCard title="Rejetés" value={history.filter(h => h.status === 'rejected').length} subtitle="Derniers 30 jours" icon={<XCircle size={20} />} color="bg-tba-red" />
      </div>

      <div className="bg-white rounded-tba shadow-tba border border-border overflow-hidden min-h-[400px]">
        {activeTab === 'members' && (
          <MembersApprovalTable 
            members={pendingMembers} 
            isSuperAdmin={isSuperAdmin} 
            onAction={handleMemberAction} 
          />
        )}
        {activeTab === 'events' && (
          <EventsApprovalTable 
            events={pendingEvents} 
            onAction={handleEventAction} 
          />
        )}
        {activeTab === 'history' && (
          <ValidationHistory history={history} />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color, textColor = "text-white" }: any) {
  return (
    <div className="bg-white p-6 rounded-tba shadow-tba border border-border flex items-center gap-5 hover:translate-y-[-4px] transition-transform duration-300">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center ${textColor} shadow-lg shadow-black/5`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black text-tba-blue">{value}</div>
        <div className="text-sm font-bold text-tba-text">{title}</div>
        <div className="text-[0.65rem] font-medium text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}

function MembersApprovalTable({ members, isSuperAdmin, onAction }: any) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-tba-bg-light flex items-center justify-center mb-4 text-muted-foreground">
          <Users size={32} />
        </div>
        <h3 className="text-lg font-bold text-tba-blue">Tout est à jour !</h3>
        <p className="text-sm text-muted-foreground">Aucun nouveau membre n'attend de validation.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-tba-bg-light border-b border-border">
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest">Membre</th>
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest">Date d'inscription</th>
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest">Statut</th>
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((member: any) => (
            <tr key={member.id} className="hover:bg-tba-bg-light/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-tba-blue to-tba-cyan flex items-center justify-center text-[0.7rem] font-black text-white border-2 border-white shadow-sm">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-tba-blue">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-xs font-semibold text-tba-text">{member.date}</td>
              <td className="px-6 py-4">
                <StatusBadge status={member.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onAction(member.id, 'approved')}
                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm" 
                    title="Approuver"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={() => onAction(member.id, 'rejected')}
                    className="p-2 rounded-lg bg-tba-red/10 text-tba-red hover:bg-tba-red hover:text-white transition-all shadow-sm" 
                    title="Rejeter"
                  >
                    <X size={16} />
                  </button>
                  {isSuperAdmin && (
                    <button 
                      onClick={() => toast.info("Plus d'options pour ce membre...")}
                      className="p-2 rounded-lg bg-tba-blue/5 text-tba-blue hover:bg-tba-blue hover:text-white transition-all shadow-sm" 
                      title="Plus d'options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventsApprovalTable({ events, onAction }: any) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-tba-bg-light flex items-center justify-center mb-4 text-muted-foreground">
          <PartyPopper size={32} />
        </div>
        <h3 className="text-lg font-bold text-tba-blue">Rien à valider</h3>
        <p className="text-sm text-muted-foreground">Tous les événements sensibles ont été traités.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-tba-bg-light border-b border-border">
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest">Événement</th>
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest">Type</th>
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest">Date</th>
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest">Créateur</th>
            <th className="px-6 py-4 text-[0.65rem] font-black text-tba-blue uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((event: any) => (
            <tr key={event.id} className="hover:bg-tba-bg-light/50 transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-tba-blue">{event.title}</div>
              </td>
              <td className="px-6 py-4">
                <span className="text-[0.65rem] font-black px-2.5 py-1 rounded-lg bg-tba-blue/10 text-tba-blue uppercase tracking-wider">
                  {event.type}
                </span>
              </td>
              <td className="px-6 py-4 text-xs font-semibold text-tba-text">{event.date}</td>
              <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{event.creator}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onAction(event.id, 'approved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm"
                  >
                    Approuver
                  </button>
                  <button 
                    onClick={() => onAction(event.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg border border-tba-red text-tba-red text-xs font-bold hover:bg-tba-red hover:text-white transition-all"
                  >
                    Rejeter
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ValidationHistory({ history }: any) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-tba-bg-light flex items-center justify-center mb-4 text-muted-foreground">
          <History size={32} />
        </div>
        <h3 className="text-lg font-bold text-tba-blue">Aucun historique</h3>
        <p className="text-sm text-muted-foreground">Les actions de validation apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {history.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-tba-bg-light/50 border border-border animate-fade-in">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-tba-red/10 text-tba-red'}`}>
                {item.status === 'approved' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              </div>
              <div>
                <div className="text-sm font-bold text-tba-blue">{item.action} : {item.target}</div>
                <div className="text-[0.7rem] font-medium text-muted-foreground">Par {item.admin} · {item.date}</div>
              </div>
            </div>
            <StatusBadge status={item.status === 'approved' ? 'approved' : 'rejected'} />
          </div>
        ))}
      </div>
    </div>
  );
}
