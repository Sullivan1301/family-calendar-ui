"use client";

import { useState } from "react";
import { MapPin, Calendar, Lock, Share2, Edit2, Users, Send } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function EventDetailPage() {
  const [rsvp, setRsvp] = useState("yes");
  const { isAdmin } = useAuth();
  const [comment, setComment] = useState("");

  const handleAction = (action: string) => {
    toast.info(`${action} : Fonctionnalité en cours de développement`);
  };

  const handleRSVP = (status: string) => {
    setRsvp(status);
    const labels: Record<string, string> = { yes: "Présent", maybe: "Peut-être", no: "Absent" };
    toast.success(`Votre réponse a été mise à jour : ${labels[status]}`);
  };

  const handleSendComment = () => {
    if (comment.trim()) {
      toast.success("Commentaire envoyé !");
      setComment("");
    }
  };

  const eventDate = new Date(2026, 2, 29);

  return (
    <div className="animate-fade-in">
      <div className="gradient-hero rounded-tba p-8 md:p-10 text-white mb-6 relative overflow-hidden shadow-tba-lg shadow-tba-blue/15">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 w-56 h-56 rounded-full bg-tba-cyan/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="inline-flex items-center bg-white/15 backdrop-blur-md text-white rounded-full text-xs font-medium px-3.5 py-1.5 border border-white/10">
              🐣 Réunion Familiale
            </span>
            <StatusBadge status="approved" className="bg-white/15 text-white border border-white/10 text-[0.65rem]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white font-serif">Réunion familiale du 29 mars 2026</h1>

          <div className="flex flex-wrap gap-5 text-sm opacity-85 mb-8">
            <span className="flex items-center gap-2"><Calendar size={16} className="opacity-60" /> {eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="flex items-center gap-2"><MapPin size={16} className="opacity-60" /> Toamasina, Chez Mamitina</span>
            <span className="flex items-center gap-2"><Users size={16} className="opacity-60" /> 12 invités</span>
            <span className="flex items-center gap-2"><Lock size={16} className="opacity-60" /> Famille complète</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button onClick={() => handleAction("Modifier")} className="btn-primary bg-tba-red hover:bg-red-600 flex items-center gap-2 py-2.5 px-6 text-sm">
              <Edit2 size={15} /> Modifier
            </button>
            <button onClick={() => handleAction("Partager")} className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-6 py-2.5 rounded-tba-sm backdrop-blur-sm border border-white/10 transition-all duration-200 flex items-center gap-2">
              <Share2 size={15} /> Partager
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col gap-6">
          <div className="standard-card">
            <div className="px-5 py-3.5 border-b border-tba-border/50">
              <h3 className="text-base font-semibold text-tba-blue flex items-center gap-2">🗳️ Ma participation</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-tba-gray mb-5">Confirmez-vous votre présence à cet événement ?</p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => handleRSVP("yes")}
                  className={`flex-1 min-w-[130px] p-3.5 rounded-xl text-center font-medium text-sm transition-all duration-200 border-2 ${
                    rsvp === "yes"
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                      : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-100/50"
                  }`}
                >
                  ✅ Oui, je viens
                </button>
                <button
                  onClick={() => handleRSVP("maybe")}
                  className={`flex-1 min-w-[130px] p-3.5 rounded-xl text-center font-medium text-sm transition-all duration-200 border-2 ${
                    rsvp === "maybe"
                      ? "bg-tba-yellow text-tba-text border-tba-yellow shadow-md shadow-tba-yellow/20"
                      : "bg-yellow-50 text-tba-yellow border-yellow-100 hover:border-yellow-200 hover:bg-yellow-100/50"
                  }`}
                >
                  🤔 Peut-être
                </button>
                <button
                  onClick={() => handleRSVP("no")}
                  className={`flex-1 min-w-[130px] p-3.5 rounded-xl text-center font-medium text-sm transition-all duration-200 border-2 ${
                    rsvp === "no"
                      ? "bg-tba-red text-white border-tba-red shadow-md shadow-tba-red/20"
                      : "bg-red-50 text-tba-red border-red-100 hover:border-red-200 hover:bg-red-100/50"
                  }`}
                >
                  ❌ Je ne peux pas
                </button>
              </div>
            </div>
          </div>

          <div className="standard-card">
            <div className="px-5 py-3.5 border-b border-tba-border/50">
              <h3 className="text-base font-semibold text-tba-blue">📆 Disponibilités — 29 mars</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-7 gap-1.5">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <div key={i} className="text-center text-[0.65rem] font-semibold text-tba-muted py-1 uppercase">{d}</div>
                ))}
                {[
                  { day: "23", cls: "bg-tba-surface text-tba-muted" },
                  { day: "24", cls: "bg-tba-surface text-tba-muted" },
                  { day: "25", cls: "bg-emerald-50 text-emerald-700" },
                  { day: "26", cls: "bg-emerald-50 text-emerald-700" },
                  { day: "27", cls: "bg-yellow-50 text-yellow-700" },
                  { day: "28", cls: "bg-red-50 text-red-700" },
                  { day: "29", cls: "bg-emerald-50 text-emerald-700 border-2 border-tba-blue font-bold" },
                  { day: "30", cls: "bg-emerald-50 text-emerald-700" },
                  { day: "31", cls: "bg-emerald-50 text-emerald-700" },
                ].map(({ day, cls }) => (
                  <div key={day} className={`h-9 rounded-lg flex items-center justify-center text-xs font-medium ${cls}`}>{day}</div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-5">
                <LegendItem color="bg-emerald-50 border border-emerald-100" label="Disponible" />
                <LegendItem color="bg-yellow-50 border border-yellow-100" label="Incertain" />
                <LegendItem color="bg-red-50 border border-red-100" label="Indisponible" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="standard-card">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-tba-border/50">
              <h3 className="text-base font-semibold text-tba-blue flex items-center gap-2">👥 Invités</h3>
              <button className="btn-ghost text-xs">+ Inviter</button>
            </div>
            <div className="p-5 flex flex-col">
              <GuestItem name="Sullivan" loc="Antananarivo" initials="SL" status="yes" color="from-tba-blue to-tba-cyan" />
              <GuestItem name="Anja" loc="Antananarivo" initials="AN" status="yes" color="from-emerald-600 to-emerald-400" />
              <GuestItem name="Yasina" loc="Toamasina" initials="YS" status="maybe" color="from-blue-600 to-blue-400" />
              <GuestItem name="Rina" loc="Mahajanga" initials="RI" status="pending" color="from-slate-600 to-slate-400" />
              <GuestItem name="Nayah" loc="Antsirabe" initials="NY" status="no" color="from-tba-red to-rose-400" />
            </div>
          </div>

          <div className="standard-card">
            <div className="px-5 py-3.5 border-b border-tba-border/50">
              <h3 className="text-base font-semibold text-tba-blue flex items-center gap-2">💬 Commentaires (3)</h3>
            </div>
            <div className="p-5">
              <div className="space-y-4 mb-5">
                <CommentItem initials="TH" name="Tahina" time="hier à 18h42" text="Super ! Je m'occupe du Romazava cette année. Est-ce que tout le monde est d'accord ? 🍲" color="from-amber-600 to-amber-400" />
                <CommentItem initials="YS" name="Yasina" time="aujourd'hui à 9h14" text="J'arrive par le Cotisse de 11h à la gare de Toamasina. Est-ce que quelqu'un peut me récupérer ?" color="from-blue-600 to-blue-400" />
                <CommentItem initials="SL" name="Sullivan" time="aujourd'hui à 10h02" text="@Yasina oui pas de souci, je passe te chercher avec la voiture 🚗" color="from-tba-blue to-tba-cyan" />
              </div>
              <div className="flex gap-2.5 pt-4 border-t border-tba-border/50">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-tba-surface border border-tba-border focus:border-tba-blue focus:ring-2 focus:ring-tba-blue/10 outline-none text-sm transition-all duration-200"
                  placeholder="Écrire un commentaire…"
                />
                <button onClick={handleSendComment} className="w-10 h-10 rounded-xl bg-tba-blue text-white flex items-center justify-center hover:bg-tba-blue/90 transition-all duration-200 shadow-sm shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-tba-gray font-medium">
      <span className={`w-3 h-3 rounded ${color}`} />
      {label}
    </span>
  );
}

function GuestItem({ name, loc, initials, status, color }: any) {
  const statusConfig: any = {
    yes: { text: "✅ Confirmé", class: "bg-emerald-50 text-emerald-600" },
    maybe: { text: "🤔 Peut-être", class: "bg-yellow-50 text-yellow-700" },
    no: { text: "❌ Absent", class: "bg-red-50 text-tba-red" },
    pending: { text: "⏳ En attente", class: "bg-tba-surface text-tba-muted" },
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-tba-border/50 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm`}>
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-tba-blue">{name}</div>
          <div className="text-xs text-tba-muted flex items-center gap-1"><MapPin size={10} /> {loc}</div>
        </div>
      </div>
      <span className={`text-[0.65rem] font-medium px-2.5 py-1 rounded-full ${statusConfig[status].class}`}>
        {statusConfig[status].text}
      </span>
    </div>
  );
}

function CommentItem({ initials, name, time, text, color }: any) {
  return (
    <div className="flex gap-3">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs shrink-0 ring-2 ring-white shadow-sm`}>
        {initials}
      </div>
      <div className="flex-1 bg-tba-surface rounded-xl p-3.5 border border-tba-border/50">
        <div className="text-xs text-tba-muted mb-1 flex items-center justify-between">
          <span className="font-semibold text-tba-blue">{name}</span>
          <span className="opacity-60 font-medium">{time}</span>
        </div>
        <div className="text-sm text-tba-text leading-relaxed">{text}</div>
      </div>
    </div>
  );
}
