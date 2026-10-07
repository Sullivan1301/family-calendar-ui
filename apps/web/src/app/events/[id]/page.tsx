"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  MapPin,
  CalendarDays,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Send,
  Check,
  X,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useAuth } from "../../../context/AuthContext";
import { useApi, apiPost, apiDelete } from "../../../hooks/useApi";
import { EventStatus, EventType } from "../../../types";

interface ApiEvent {
  id: string;
  familyId: string;
  title: string;
  type: EventType;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  status: EventStatus;
  createdBy: string;
  createdByUser?: { id: string; name: string | null; image: string | null };
  approvedByUser?: { id: string; name: string | null } | null;
  guests?: { id: string; name: string; email: string | null; confirmed: boolean }[];
}

interface ApiComment {
  id: string;
  content: string;
  createdAt: string;
  user?: { id: string; name: string | null; image: string | null };
}

type Rsvp = "yes" | "maybe" | "no";

interface RsvpData {
  responses: {
    id: string;
    userId: string;
    response: Rsvp;
    user?: { id: string; name: string | null; image: string | null };
  }[];
  myResponse: { response: Rsvp } | null;
  counts: { yes: number; maybe: number; no: number };
}

const typeEmoji: Record<string, string> = {
  mariage: "💒",
  "baptême": "👶",
  "anniversaire de décès": "🕯️",
  "événement global": "🌍",
  autre: "🐣",
};

const rsvpLabels: Record<Rsvp, string> = {
  yes: "Présent",
  maybe: "Peut-être",
  no: "Absent",
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [savingRsvp, setSavingRsvp] = useState(false);
  const [moderating, setModerating] = useState(false);

  const {
    data: eventData,
    isLoading,
    error,
    refetch: refetchEvent,
  } = useApi<{ event: ApiEvent }>(id ? `/api/events/${id}` : null);

  const { data: commentsData, refetch: refetchComments } = useApi<{
    comments: ApiComment[];
  }>(id ? `/api/events/${id}/comments` : null);

  const { data: rsvpData, refetch: refetchRsvp } = useApi<RsvpData>(
    id ? `/api/events/${id}/rsvp` : null
  );

  const event = eventData?.event;
  const comments = commentsData?.comments ?? [];
  const myRsvp = rsvpData?.myResponse?.response ?? null;
  const canDelete = !!event && (isAdmin || event.createdBy === user?.id);

  const handleRsvp = async (response: Rsvp) => {
    setSavingRsvp(true);
    try {
      await apiPost(`/api/events/${id}/rsvp`, { response });
      toast.success(`Votre réponse : ${rsvpLabels[response]}`);
      refetchRsvp();
    } catch (err: any) {
      toast.error(err.message || "Impossible d'enregistrer votre réponse.");
    } finally {
      setSavingRsvp(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    try {
      await apiPost(`/api/events/${id}/comments`, { content: comment.trim() });
      setComment("");
      refetchComments();
    } catch (err: any) {
      toast.error(err.message || "Commentaire non envoyé.");
    } finally {
      setSending(false);
    }
  };

  const handleModerate = async (action: "approve" | "reject") => {
    setModerating(true);
    try {
      await apiPost(`/api/events/${id}/${action}`);
      toast.success(action === "approve" ? "Événement approuvé." : "Événement rejeté.");
      refetchEvent();
    } catch (err: any) {
      toast.error(err.message || "Action impossible.");
    } finally {
      setModerating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cet événement ? Cette action est irréversible.")) return;
    try {
      await apiDelete(`/api/events/${id}`);
      toast.success("Événement supprimé.");
      router.replace("/events");
    } catch (err: any) {
      toast.error(err.message || "Suppression impossible.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-tba-gray gap-3">
        <Loader2 size={24} className="animate-spin text-tba-blue" />
        Chargement de l&apos;événement…
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-tba-red/10 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={32} className="text-tba-red" />
        </div>
        <h1 className="text-2xl font-bold text-tba-blue mb-2">Événement introuvable</h1>
        <p className="text-tba-gray mb-7">
          {error || "Cet événement n'existe plus ou vous n'y avez pas accès."}
        </p>
        <Link href="/events" className="btn-primary inline-block py-3 px-7">
          Retour aux événements
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate);

  return (
    <div className="animate-fade-in">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm font-bold text-tba-gray hover:text-tba-blue transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Tous les événements
      </Link>

      <div className="bg-gradient-to-br from-tba-blue to-tba-cyan rounded-tba p-8 md:p-10 text-white mb-8 relative overflow-hidden shadow-tba-lg">
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-tba-red/10 blur-2xl" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-4xl">{typeEmoji[event.type] || "📅"}</span>
            <StatusBadge status={event.status} className="bg-white/90" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/80 capitalize">
              {event.type}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">{event.title}</h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-tba-yellow shrink-0" />
              <span className="capitalize">
                {format(startDate, "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-tba-yellow shrink-0" />
              <span>{event.location || "Lieu non précisé"}</span>
            </div>
          </div>
        </div>
      </div>

      {event.status === "pending" && isAdmin && (
        <div className="bg-tba-yellow/10 border border-tba-yellow/30 rounded-tba p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-tba-yellow shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-tba-blue">Cet événement attend votre validation</p>
              <p className="text-sm text-tba-gray mt-0.5">
                Il ne sera visible comme confirmé qu&apos;une fois approuvé.
              </p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => handleModerate("approve")}
              disabled={moderating}
              className="bg-emerald-600 text-white font-bold text-sm py-2.5 px-6 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <Check size={15} /> Approuver
            </button>
            <button
              onClick={() => handleModerate("reject")}
              disabled={moderating}
              className="border-2 border-tba-red text-tba-red font-bold text-sm py-2.5 px-6 rounded-xl hover:bg-tba-red hover:text-white transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <X size={15} /> Rejeter
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-tba shadow-tba border border-border p-6 md:p-8">
            <h2 className="text-xl font-bold text-tba-blue mb-4">Détails</h2>
            {event.description ? (
              <p className="text-tba-text whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">Aucune description fournie.</p>
            )}

            <div className="mt-6 pt-6 border-t border-border/60 text-sm text-muted-foreground space-y-1">
              <div>
                Proposé par{" "}
                <strong className="text-tba-blue">
                  {event.createdByUser?.name || "un membre"}
                </strong>
              </div>
              {event.approvedByUser?.name && (
                <div>
                  Approuvé par{" "}
                  <strong className="text-tba-blue">{event.approvedByUser.name}</strong>
                </div>
              )}
            </div>

            {canDelete && (
              <button
                onClick={handleDelete}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-tba-red hover:underline"
              >
                <Trash2 size={15} /> Supprimer cet événement
              </button>
            )}
          </section>

          <section className="bg-white rounded-tba shadow-tba border border-border p-6 md:p-8">
            <h2 className="text-xl font-bold text-tba-blue mb-5">
              Commentaires {comments.length > 0 && `(${comments.length})`}
            </h2>

            <div className="space-y-5 mb-6">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucun commentaire. Lancez la discussion !
                </p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-tba-blue to-tba-cyan shrink-0 flex items-center justify-center text-xs font-black text-white overflow-hidden">
                    {c.user?.image ? (
                      <img
                        src={c.user.image}
                        alt={c.user.name || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (c.user?.name || "?")[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-bold text-tba-blue">
                        {c.user?.name || "Membre"}
                      </span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        {format(new Date(c.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-tba-text mt-1 whitespace-pre-line break-words">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendComment} className="flex gap-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Écrire un commentaire…"
                className="flex-1 px-4 py-3 rounded-xl border border-border focus:border-tba-blue focus:ring-2 focus:ring-tba-blue/20 outline-none transition-all text-sm"
              />
              <button
                type="submit"
                disabled={sending || !comment.trim()}
                className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-tba shadow-tba border border-border p-6">
            <h2 className="text-lg font-bold text-tba-blue mb-1">Serez-vous présent ?</h2>
            <p className="text-xs text-tba-gray mb-5">
              Votre réponse est visible par toute la famille.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["yes", <Check key="y" size={16} />, "emerald"],
                  ["maybe", <HelpCircle key="m" size={16} />, "yellow"],
                  ["no", <X key="n" size={16} />, "red"],
                ] as const
              ).map(([value, icon]) => {
                const active = myRsvp === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleRsvp(value)}
                    disabled={savingRsvp}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-60 border-2 ${
                      active
                        ? "bg-tba-blue text-white border-tba-blue shadow-md"
                        : "bg-white text-tba-gray border-border hover:border-tba-blue hover:text-tba-blue"
                    }`}
                  >
                    {icon}
                    {rsvpLabels[value]}
                  </button>
                );
              })}
            </div>

            {rsvpData && (
              <div className="mt-6 pt-5 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs font-bold text-tba-blue uppercase tracking-widest mb-3">
                  <Users size={13} /> Réponses
                </div>
                <div className="flex gap-4 text-sm font-semibold mb-4">
                  <span className="text-emerald-600">{rsvpData.counts.yes} présent(s)</span>
                  <span className="text-tba-yellow">{rsvpData.counts.maybe} peut-être</span>
                  <span className="text-tba-red">{rsvpData.counts.no} absent(s)</span>
                </div>
                <div className="space-y-2">
                  {rsvpData.responses.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Personne n&apos;a encore répondu.
                    </p>
                  )}
                  {rsvpData.responses.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-tba-text truncate">
                        {r.user?.name || "Membre"}
                      </span>
                      <span
                        className={`font-bold shrink-0 ${
                          r.response === "yes"
                            ? "text-emerald-600"
                            : r.response === "maybe"
                              ? "text-tba-yellow"
                              : "text-tba-red"
                        }`}
                      >
                        {rsvpLabels[r.response]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {event.guests && event.guests.length > 0 && (
            <section className="bg-white rounded-tba shadow-tba border border-border p-6">
              <h2 className="text-lg font-bold text-tba-blue mb-4">
                Invités externes ({event.guests.length})
              </h2>
              <div className="space-y-3">
                {event.guests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-tba-text truncate">
                        {guest.name}
                      </div>
                      {guest.email && (
                        <div className="text-xs text-muted-foreground truncate">{guest.email}</div>
                      )}
                    </div>
                    <span
                      className={`text-[0.65rem] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        guest.confirmed
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {guest.confirmed ? "Confirmé" : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
