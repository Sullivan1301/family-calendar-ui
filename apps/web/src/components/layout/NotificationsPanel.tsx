"use client";

import { Bell, Check, Clock, Calendar, MapPin, X, CheckCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isAdmin } = useAuth();
  if (!isOpen) return null;

    const notifications = [
      { id: 1, icon: "👤", iconBg: "bg-tba-yellow/20", text: "<strong>Anja</strong> attend votre validation pour rejoindre la famille.", time: "Il y a 2 heures", read: false, adminOnly: true },
      { id: 2, icon: "💒", iconBg: "bg-tba-blue/10", text: "<strong>Mariage de Rina</strong> : Nouvel événement en attente de validation.", time: "Il y a 5 heures", read: false, adminOnly: true },
    { id: 3, icon: "🎂", iconBg: "bg-red-100", text: "<strong>Anniversaire de Yasina</strong> dans 3 jours — " + format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'd MMMM', { locale: fr }), time: "Hier", read: false },
    { id: 4, icon: "✅", iconBg: "bg-green-100", text: "<strong>Tahina</strong> a confirmé sa présence aux Vacances Foulpointe", time: "Il y a 2 jours", read: true },
  ];

  const filteredNotifications = notifications.filter(n => !n.adminOnly || (n.adminOnly && isAdmin));

  return (
    <>
      <div className="fixed inset-0 z-[140] bg-black/5 backdrop-blur-sm animate-fade-in lg:hidden" onClick={onClose} />
      <div className="fixed top-16 right-6 z-[150] w-96 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 mt-2">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-tba-blue" />
            <span className="text-sm font-bold text-tba-blue">Notifications</span>
            <span className="bg-tba-red text-white text-[0.65rem] font-black px-2 py-0.5 rounded-full shadow-sm ml-1">
              {filteredNotifications.filter(n => !n.read).length}
            </span>
          </div>
          <button className="text-[0.65rem] font-bold text-tba-blue uppercase tracking-widest hover:text-tba-red transition-all flex items-center gap-1">
            <CheckCheck size={14} /> Tout lire
          </button>
        </div>
        
        <div className="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-border">
          {filteredNotifications.map((n) => (
            <div 
              key={n.id} 
              className={`flex gap-4 px-6 py-4 border-b border-border transition-all cursor-pointer group ${n.read ? 'bg-white opacity-70' : 'bg-white hover:bg-muted/30'}`}
            >
              <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 ${n.iconBg}`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground leading-snug group-hover:text-tba-blue transition-colors" dangerouslySetInnerHTML={{ __html: n.text }} />
                <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-muted-foreground mt-2 uppercase tracking-tight">
                  <Clock size={10} /> {n.time}
                  {n.adminOnly && <span className="ml-auto text-tba-yellow flex items-center gap-1"><ShieldAlert size={10} /> Admin</span>}
                </div>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-tba-red shrink-0 mt-1.5 shadow-sm" />
              )}
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-muted/30 text-center">
          <button className="text-[0.7rem] font-bold text-muted-foreground hover:text-tba-blue transition-all uppercase tracking-widest">
            Voir tout l'historique
          </button>
        </div>
      </div>
    </>
  );
}
