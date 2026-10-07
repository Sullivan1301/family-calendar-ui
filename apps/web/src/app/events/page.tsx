"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  CalendarDays,
  Loader2,
  AlertCircle,
  PartyPopper,
  Search,
  Plus,
} from "lucide-react";
import { format, isAfter, startOfToday } from "date-fns";
import { fr } from "date-fns/locale";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import { EventStatus, EventType } from "../../types";

interface ApiEvent {
  id: string;
  title: string;
  type: EventType;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  status: EventStatus;
  createdByUser?: { id: string; name: string | null; image: string | null };
}

export const typeEmoji: Record<string, string> = {
  mariage: "💒",
  "baptême": "👶",
  "anniversaire de décès": "🕯️",
  "événement global": "🌍",
  autre: "🐣",
};

type Filter = "upcoming" | "past" | "all";

export default function EventsPage() {
  const { activeFamily } = useAuth();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useApi<{ events: ApiEvent[] }>(
    activeFamily ? `/api/events?familyId=${activeFamily.id}` : null
  );

  const events = useMemo(() => {
    const all = data?.events ?? [];
    const today = startOfToday();
    const term = search.trim().toLowerCase();

    return all
      .filter((e) => {
        if (filter === "upcoming") return isAfter(new Date(e.startDate), today);
        if (filter === "past") return !isAfter(new Date(e.startDate), today);
        return true;
      })
      .filter((e) => {
        if (!term) return true;
        return (
          e.title.toLowerCase().includes(term) ||
          (e.location ?? "").toLowerCase().includes(term) ||
          e.type.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const da = new Date(a.startDate).getTime();
        const db = new Date(b.startDate).getTime();
        // À venir : du plus proche au plus lointain. Passé : du plus récent au plus ancien.
        return filter === "past" ? db - da : da - db;
      });
  }, [data, filter, search]);

  const counts = useMemo(() => {
    const all = data?.events ?? [];
    const today = startOfToday();
    return {
      upcoming: all.filter((e) => isAfter(new Date(e.startDate), today)).length,
      past: all.filter((e) => !isAfter(new Date(e.startDate), today)).length,
      all: all.length,
    };
  }, [data]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-tba-blue tracking-tight">
            Événements
          </h1>
          <p className="text-base text-tba-gray mt-2 font-sans font-normal">
            {activeFamily?.name ? `${activeFamily.name} · ` : ""}
            {counts.all} événement{counts.all > 1 ? "s" : ""} enregistré
            {counts.all > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/new-event" className="btn-primary flex items-center gap-2 py-3 px-8">
          <Plus size={18} /> Nouvel événement
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex bg-muted p-1.5 rounded-2xl gap-1 shadow-inner">
          {(
            [
              ["upcoming", "À venir", counts.upcoming],
              ["past", "Passés", counts.past],
              ["all", "Tous", counts.all],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === key
                  ? "bg-white text-tba-blue shadow-md"
                  : "text-tba-gray hover:bg-white/50"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-tba-gray pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un événement…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-white focus:border-tba-blue focus:ring-2 focus:ring-tba-blue/20 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-tba-gray gap-3">
          <Loader2 size={24} className="animate-spin text-tba-blue" />
          Chargement des événements…
        </div>
      )}

      {error && (
        <div className="bg-tba-red/5 border border-tba-red/20 rounded-tba p-6 flex items-start gap-3">
          <AlertCircle className="text-tba-red shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-tba-blue">Impossible de charger les événements</p>
            <p className="text-sm text-tba-gray mt-1">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-tba-bg-light flex items-center justify-center mb-4 text-muted-foreground">
            <PartyPopper size={32} />
          </div>
          <h3 className="text-lg font-bold text-tba-blue">
            {search ? "Aucun résultat" : "Aucun événement ici"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            {search
              ? "Essayez un autre terme de recherche."
              : "Créez le premier événement de votre famille."}
          </p>
          {!search && (
            <Link href="/new-event" className="btn-primary py-3 px-7">
              Créer un événement
            </Link>
          )}
        </div>
      )}

      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: ApiEvent }) {
  const date = new Date(event.startDate);

  return (
    <Link
      href={`/events/${event.id}`}
      className="bg-white rounded-tba shadow-tba border border-border overflow-hidden hover:-translate-y-1 hover:shadow-tba-lg transition-all flex flex-col"
    >
      <div className="bg-gradient-to-br from-tba-blue to-tba-cyan p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="text-3xl mb-2">{typeEmoji[event.type] || "📅"}</div>
            <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
            <div className="text-xs font-semibold text-white/80 mt-1 capitalize">{event.type}</div>
          </div>
          <StatusBadge status={event.status} className="shrink-0 bg-white/90" />
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-tba-text">
          <CalendarDays size={15} className="text-tba-blue shrink-0" />
          <span className="capitalize">
            {format(date, "EEEE d MMMM yyyy", { locale: fr })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-tba-gray">
          <MapPin size={15} className="text-tba-red shrink-0" />
          <span>{event.location || "Lieu non précisé"}</span>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{event.description}</p>
        )}

        <div className="mt-auto pt-4 text-xs text-muted-foreground border-t border-border/60">
          Proposé par {event.createdByUser?.name || "un membre"}
        </div>
      </div>
    </Link>
  );
}
