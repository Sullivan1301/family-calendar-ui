"use client";

import { useState } from "react";
import { Bell, Clock, CheckCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([
    { id: 1, icon: "👤", iconBg: "bg-tba-yellow/15", text: "<strong>Anja</strong> attend votre validation pour rejoindre la famille.", time: "Il y a 2 heures", read: false, adminOnly: true, accent: "border-l-tba-yellow" },
    { id: 2, icon: "💒", iconBg: "bg-tba-blue/8", text: "<strong>Mariage de Rina</strong> : Nouvel événement en attente de validation.", time: "Il y a 5 heures", read: false, adminOnly: true, accent: "border-l-tba-blue" },
    { id: 3, icon: "🎂", iconBg: "bg-red-50", text: "<strong>Anniversaire de Yasina</strong> dans 3 jours — " + format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'd MMMM', { locale: fr }), time: "Hier", read: false, accent: "border-l-tba-red" },
    { id: 4, icon: "✅", iconBg: "bg-emerald-50", text: "<strong>Tahina</strong> a confirmé sa présence aux Vacances Foulpointe", time: "Il y a 2 jours", read: true, accent: "border-l-emerald-500" },
  ]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => !n.adminOnly || (n.adminOnly && isAdmin));

  return (
    <>
      <button type="button" aria-label="Fermer les notifications" className="fixed inset-0 z-[140] bg-transparent lg:bg-black/10 lg:backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed top-14 left-4 right-4 z-[150] mt-2 w-auto max-w-[380px] rounded-tba border border-tba-border bg-white shadow-tba-lg animate-scale-in lg:left-auto lg:right-4">
        <div className="px-5 py-3.5 border-b border-tba-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-tba-blue" />
            <span className="text-sm font-semibold text-tba-blue">Notifications</span>
            <span className="bg-tba-red text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full shadow-sm ml-0.5">
              {filteredNotifications.filter(n => !n.read).length}
            </span>
          </div>
          <button type="button" onClick={() => setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))} className="text-[0.65rem] font-medium text-tba-blue hover:text-tba-red transition-colors duration-200 flex items-center gap-1">
            <CheckCheck size={13} /> Tout lire
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`flex gap-3 px-5 py-3.5 border-b border-tba-border/30 border-l-2 transition-all duration-200 cursor-pointer group ${n.accent} ${n.read ? 'opacity-50' : 'hover:bg-tba-surface/50'}`}
            >
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg shadow-sm transition-transform duration-200 group-hover:scale-105 ${n.iconBg}`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-tba-text leading-snug group-hover:text-tba-blue transition-colors duration-200" dangerouslySetInnerHTML={{ __html: n.text }} />
                <div className="flex items-center gap-1.5 text-[0.6rem] font-medium text-tba-muted mt-1.5">
                  <Clock size={10} /> {n.time}
                  {n.adminOnly && <span className="ml-auto text-tba-yellow flex items-center gap-0.5"><ShieldAlert size={10} /> Admin</span>}
                </div>
              </div>
              {!n.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-tba-blue shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>

        <div className="p-3.5 text-center border-t border-tba-border/50">
          <button className="text-[0.7rem] font-medium text-tba-muted hover:text-tba-blue transition-colors duration-200">
            Voir tout l'historique
          </button>
        </div>
      </div>
    </>
  );
}
