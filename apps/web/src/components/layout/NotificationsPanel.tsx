"use client";

import { Bell, Clock, CheckCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApi, apiPatch } from "../../hooks/useApi";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const typeIcons: Record<string, string> = {
  event_invitation: "📅",
  event_approved: "✅",
  event_rejected: "❌",
  family_invitation: "👤",
  comment_added: "💬",
  member_joined: "🎉",
};

const typeIconBg: Record<string, string> = {
  event_invitation: "bg-tba-blue/10",
  event_approved: "bg-green-100",
  event_rejected: "bg-tba-red/10",
  family_invitation: "bg-tba-yellow/20",
  comment_added: "bg-tba-cyan/10",
  member_joined: "bg-emerald-100",
};

export function NotificationsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { data, refetch } = useApi<{ notifications: any[]; unreadCount: number }>(
    isOpen && user ? "/api/notifications" : null
  );

  if (!isOpen) return null;

  const notifications = data?.notifications || [];

  const markAllRead = async () => {
    try {
      await apiPatch("/api/notifications/read-all");
      toast.success("Toutes les notifications marquées comme lues");
      refetch();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const markRead = async (id: string) => {
    try {
      await apiPatch(`/api/notifications/${id}/read`);
      refetch();
    } catch {
      // Silently fail
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[140] bg-black/5 backdrop-blur-sm animate-fade-in lg:hidden" onClick={onClose} />
      <div className="fixed top-16 right-6 z-[150] w-96 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 mt-2">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-tba-blue" />
            <span className="text-sm font-bold text-tba-blue">Notifications</span>
            {data && data.unreadCount > 0 && (
              <span className="bg-tba-red text-white text-[0.65rem] font-black px-2 py-0.5 rounded-full shadow-sm ml-1">
                {data.unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={markAllRead}
            className="text-[0.65rem] font-bold text-tba-blue uppercase tracking-widest hover:text-tba-red transition-all flex items-center gap-1"
          >
            <CheckCheck size={14} /> Tout lire
          </button>
        </div>

        <div className="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-border">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            notifications.map((n: any) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex gap-4 px-6 py-4 border-b border-border transition-all cursor-pointer group ${n.read ? 'bg-white opacity-70' : 'bg-white hover:bg-muted/30'}`}
              >
                <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 ${typeIconBg[n.type] || 'bg-gray-100'}`}>
                  {typeIcons[n.type] || "🔔"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-tba-blue leading-tight">{n.title}</div>
                  <div className="text-xs text-foreground leading-snug mt-0.5">{n.message}</div>
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-muted-foreground mt-2 uppercase tracking-tight">
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(n.createdAt), { locale: fr, addSuffix: true })}
                  </div>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-tba-blue shrink-0 mt-1.5 shadow-sm" />
                )}
              </div>
            ))
          )}
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
