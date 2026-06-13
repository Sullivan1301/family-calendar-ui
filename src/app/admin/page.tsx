"use client";

import { useState } from "react";
import {
  Users,
  PartyPopper,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  MoreVertical,
  Check,
  X,
  History,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserStatus, EventStatus } from "@/types";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'history'>('members');

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
        <div className="w-20 h-20 rounded-2xl bg-tba-red/8 flex items-center justify-center mb-5">
          <ShieldAlert size={36} className="text-tba-red" />
        </div>
        <h1 className="text-xl font-bold text-tba-blue mb-2 font-serif">Accès restreint</h1>
        <p className="text-sm text-tba-gray max-w-md">
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

  const tabs = [
    { key: 'members' as const, label: 'Membres', icon: <Users size={15} />, count: pendingMembers.length },
    { key: 'events' as const, label: 'Événements', icon: <PartyPopper size={15} />, count: pendingEvents.length },
    { key: 'history' as const, label: 'Historique', icon: <History size={15} /> },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={16} className="text-tba-blue" />
            <span className="section-label text-tba-blue">Panel d'administration</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-tba-blue tracking-tight font-serif">Gestion & Validations</h1>
          <p className="text-sm text-tba-gray mt-1.5 font-medium">
            Gérez les nouveaux membres et approuvez les événements sensibles.
          </p>
        </div>

        <div className="flex items-center gap-0.5 bg-white border border-tba-border rounded-xl p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-tba-blue text-white shadow-md shadow-tba-blue/15'
                  : 'text-tba-gray hover:bg-tba-surface hover:text-tba-blue'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-tba-border/50'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="En attente" value={pendingMembers.length + pendingEvents.length} subtitle="Membres & Événements" icon={<Clock size={18} />} accent="border-l-tba-yellow" />
        <StatCard title="Validés" value={history.filter(h => h.status === 'approved').length} subtitle="Derniers 30 jours" icon={<CheckCircle size={18} />} accent="border-l-emerald-500" />
        <StatCard title="Rejetés" value={history.filter(h => h.status === 'rejected').length} subtitle="Derniers 30 jours" icon={<XCircle size={18} />} accent="border-l-tba-red" />
      </div>

      <div className="standard-card overflow-hidden min-h-[400px]">
        {activeTab === 'members' && (
          <MembersApprovalTable members={pendingMembers} isSuperAdmin={isSuperAdmin} onAction={handleMemberAction} />
        )}
        {activeTab === 'events' && (
          <EventsApprovalTable events={pendingEvents} onAction={handleEventAction} />
        )}
        {activeTab === 'history' && (
          <ValidationHistory history={history} />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, accent }: any) {
  return (
    <div className={`bg-white p-5 rounded-tba shadow-tba border border-tba-border border-l-4 ${accent} flex items-center gap-4 hover-lift`}>
      <div className="w-11 h-11 rounded-xl bg-tba-surface border border-tba-border/50 flex items-center justify-center text-tba-gray">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-tba-blue tabular-nums">{value}</div>
        <div className="text-sm font-medium text-tba-text">{title}</div>
        <div className="text-[0.65rem] text-tba-muted">{subtitle}</div>
      </div>
    </div>
  );
}

function MembersApprovalTable({ members, isSuperAdmin, onAction }: any) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-tba-surface border border-tba-border/50 flex items-center justify-center mb-4 text-tba-muted">
          <Users size={28} />
        </div>
        <h3 className="text-base font-semibold text-tba-blue">Tout est à jour !</h3>
        <p className="text-sm text-tba-muted mt-1">Aucun nouveau membre n'attend de validation.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-tba-border/50">
            <th className="px-5 py-3.5 section-label">Membre</th>
            <th className="px-5 py-3.5 section-label">Date d'inscription</th>
            <th className="px-5 py-3.5 section-label">Statut</th>
            <th className="px-5 py-3.5 section-label text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tba-border/50">
          {members.map((member: any) => (
            <tr key={member.id} className="hover:bg-tba-surface/50 transition-colors duration-150">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tba-blue to-tba-cyan flex items-center justify-center text-[0.65rem] font-bold text-white ring-2 ring-white shadow-sm">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-tba-blue">{member.name}</div>
                    <div className="text-xs text-tba-muted">{member.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-xs font-medium text-tba-text">{member.date}</td>
              <td className="px-5 py-3.5">
                <StatusBadge status={member.status} className="text-[0.6rem]" />
              </td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button onClick={() => onAction(member.id, 'approved')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 flex items-center justify-center" title="Approuver">
                    <Check size={15} />
                  </button>
                  <button onClick={() => onAction(member.id, 'rejected')} className="w-8 h-8 rounded-lg bg-red-50 text-tba-red hover:bg-tba-red hover:text-white transition-all duration-200 flex items-center justify-center" title="Rejeter">
                    <X size={15} />
                  </button>
                  {isSuperAdmin && (
                    <button onClick={() => toast.info("Plus d'options pour ce membre...")} className="w-8 h-8 rounded-lg bg-tba-surface text-tba-muted hover:bg-tba-blue hover:text-white transition-all duration-200 flex items-center justify-center" title="Plus d'options">
                      <MoreVertical size={15} />
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
        <div className="w-14 h-14 rounded-2xl bg-tba-surface border border-tba-border/50 flex items-center justify-center mb-4 text-tba-muted">
          <PartyPopper size={28} />
        </div>
        <h3 className="text-base font-semibold text-tba-blue">Rien à valider</h3>
        <p className="text-sm text-tba-muted mt-1">Tous les événements sensibles ont été traités.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-tba-border/50">
            <th className="px-5 py-3.5 section-label">Événement</th>
            <th className="px-5 py-3.5 section-label">Type</th>
            <th className="px-5 py-3.5 section-label">Date</th>
            <th className="px-5 py-3.5 section-label">Créateur</th>
            <th className="px-5 py-3.5 section-label text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tba-border/50">
          {events.map((event: any) => (
            <tr key={event.id} className="hover:bg-tba-surface/50 transition-colors duration-150">
              <td className="px-5 py-3.5">
                <div className="text-sm font-semibold text-tba-blue">{event.title}</div>
              </td>
              <td className="px-5 py-3.5">
                <span className="text-[0.65rem] font-medium px-2.5 py-1 rounded-lg bg-tba-blue/8 text-tba-blue">{event.type}</span>
              </td>
              <td className="px-5 py-3.5 text-xs font-medium text-tba-text">{event.date}</td>
              <td className="px-5 py-3.5 text-xs text-tba-muted">{event.creator}</td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button onClick={() => onAction(event.id, 'approved')} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:opacity-90 transition-all duration-200 shadow-sm">
                    Approuver
                  </button>
                  <button onClick={() => onAction(event.id, 'rejected')} className="px-3 py-1.5 rounded-lg border border-tba-red/30 text-tba-red text-xs font-medium hover:bg-tba-red hover:text-white transition-all duration-200">
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
        <div className="w-14 h-14 rounded-2xl bg-tba-surface border border-tba-border/50 flex items-center justify-center mb-4 text-tba-muted">
          <History size={28} />
        </div>
        <h3 className="text-base font-semibold text-tba-blue">Aucun historique</h3>
        <p className="text-sm text-tba-muted mt-1">Les actions de validation apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="space-y-3">
        {history.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-tba-surface border border-tba-border/50 animate-fade-in hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-tba-red'}`}>
                {item.status === 'approved' ? <CheckCircle size={18} /> : <XCircle size={18} />}
              </div>
              <div>
                <div className="text-sm font-semibold text-tba-blue">{item.action} : {item.target}</div>
                <div className="text-[0.7rem] text-tba-muted mt-0.5">Par {item.admin} — {item.date}</div>
              </div>
            </div>
            <StatusBadge status={item.status === 'approved' ? 'approved' : 'rejected'} className="text-[0.6rem]" />
          </div>
        ))}
      </div>
    </div>
  );
}
