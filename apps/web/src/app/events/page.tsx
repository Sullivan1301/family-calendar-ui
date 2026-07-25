"use client";

import { useState } from "react";
import { Users, MapPin, Calendar, Lock, Edit2, Share2 } from "lucide-react";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
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
      {/* Event Hero */}
      <div className="bg-linear-to-br from-tba-blue to-tba-cyan rounded-tba p-8 md:p-10 text-white mb-8 relative overflow-hidden shadow-tba-lg">
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-tba-red/10 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold px-4 py-1.5 border border-white/10">
              🐣 Réunion Familiale
            </span>
            <StatusBadge status="approved" className="bg-white/20 text-white border border-white/10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Réunion familiale du 29 mars 2026</h1>

            <div className="flex flex-wrap gap-6 text-sm opacity-90 mb-8">
              <span className="flex items-center gap-2"><Calendar size={18} className="text-white/70" /> {eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-2"><MapPin size={18} className="text-white/70" /> Toamasina, Chez Mamitina</span>
              <span className="flex items-center gap-2"><Users size={18} className="text-white/70" /> 12 invités</span>
              <span className="flex items-center gap-2"><Lock size={18} className="text-white/70" /> Famille complète</span>
            </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => handleAction("Modifier")} className="btn-primary bg-tba-red hover:bg-red-700 flex items-center gap-2 py-3 px-8 shadow-xl">
              <Edit2 size={16} /> Modifier l'événement
            </button>
            <button onClick={() => handleAction("Partager")} className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-3 rounded-tba backdrop-blur-sm border border-white/10 transition-all flex items-center gap-2">
              <Share2 size={16} /> Partager
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          {/* RSVP Card */}
          <div className="standard-card">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-tba-blue">🗳️ Ma participation</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-6">Confirmez-vous votre présence à cet événement ?</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleRSVP("yes")}
                  className={`flex-1 min-w-[140px] p-4 rounded-xl text-center font-bold text-sm transition-all border-2 ${
                    rsvp === "yes"
                      ? "bg-green-600 text-white border-green-600 shadow-lg"
                      : "bg-green-50 text-green-600 border-green-100 hover:border-green-200"
                  }`}
                >
                  ✅ Oui, je viens
                </button>
                <button
                  onClick={() => handleRSVP("maybe")}
                  className={`flex-1 min-w-[140px] p-4 rounded-xl text-center font-bold text-sm transition-all border-2 ${
                    rsvp === "maybe"
                      ? "bg-tba-yellow text-tba-text border-tba-yellow shadow-lg"
                      : "bg-yellow-50 text-tba-yellow border-yellow-100 hover:border-yellow-200"
                  }`}
                >
                  🤔 Peut-être
                </button>
                <button
                  onClick={() => handleRSVP("no")}
                  className={`flex-1 min-w-[140px] p-4 rounded-xl text-center font-bold text-sm transition-all border-2 ${
                    rsvp === "no"
                      ? "bg-tba-red text-white border-tba-red shadow-lg"
                      : "bg-red-50 text-tba-red border-red-100 hover:border-red-200"
                  }`}
                >
                  ❌ Je ne peux pas
                </button>
              </div>
            </div>
          </div>

          {/* Availability Matrix */}
          <div className="standard-card">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-tba-blue">📆 Disponibilités — 29 mars</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2">
                {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
                  <div key={d} className="text-center text-xs font-bold text-muted-foreground py-1 uppercase">{d}</div>
                ))}
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">23</div>
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">24</div>
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-green-100 text-green-800">25</div>
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-green-100 text-green-800">26</div>
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-yellow-100 text-yellow-800">27</div>
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-red-100 text-red-800">28</div>
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-green-100 text-green-800 border-2 border-tba-blue font-black">29</div>
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-green-100 text-green-800">30</div>
                <div className="h-10 rounded-lg flex items-center justify-center text-xs font-bold bg-green-100 text-green-800">31</div>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <LegendItem color="bg-green-100" label="Disponible" />
                <LegendItem color="bg-yellow-100" label="Incertain" />
                <LegendItem color="bg-red-100" label="Indisponible" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Guest List */}
          <div className="standard-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-tba-blue">👥 Invités</h3>
              <button className="btn-ghost text-xs">+ Inviter</button>
            </div>
                <div className="p-6 flex flex-col">
                  <GuestItem name="Sullivan" loc="Antananarivo" initials="SL" status="yes" color="from-tba-blue to-tba-cyan" />
                  <GuestItem name="Anja" loc="Antananarivo" initials="AN" status="yes" color="from-emerald-600 to-emerald-400" />
                  <GuestItem name="Yasina" loc="Toamasina" initials="YS" status="maybe" color="from-blue-600 to-blue-400" />
                <GuestItem name="Rina" loc="Mahajanga" initials="RI" status="pending" color="from-slate-600 to-slate-400" />
                <GuestItem name="Nayah" loc="Antsirabe" initials="NY" status="no" color="from-tba-red to-rose-400" />
              </div>
          </div>

          {/* Comments Section */}
          <div className="standard-card">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-tba-blue">💬 Commentaires (3)</h3>
            </div>
            <div className="p-6">
                <div className="space-y-6 mb-6">
                  <CommentItem 
                    initials="TH" 
                    name="Tahina" 
                    time="hier à 18h42" 
                    text="Super ! Je m'occupe du Romazava cette année. Est-ce que tout le monde est d'accord ? 🍲" 
                    color="from-amber-600 to-amber-400"
                  />
                  <CommentItem 
                    initials="YS" 
                    name="Yasina" 
                    time="aujourd'hui à 9h14" 
                    text="J'arrive par le Cotisse de 11h à la gare de Toamasina. Est-ce que quelqu'un peut me récupérer ?" 
                    color="from-blue-600 to-blue-400"
                  />
                  <CommentItem 
                    initials="SL" 
                    name="Sullivan" 
                    time="aujourd'hui à 10h02" 
                    text="@Yasina oui pas de souci, je passe te chercher avec la voiture 🚗" 
                    color="from-tba-blue to-tba-cyan"
                  />
                </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <input 
                  type="text" 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  className="flex-1 px-4 py-3 rounded-xl bg-muted border-2 border-transparent focus:border-tba-blue focus:bg-white outline-none text-sm transition-all" 
                  placeholder="Écrire un commentaire…" 
                />
                <button onClick={handleSendComment} className="btn-primary py-3 px-6">Envoyer</button>
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
    <span className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

function GuestItem({ name, loc, initials, status, color }: any) {
  const statusConfig: any = {
    yes: { text: "✅ Confirmé", class: "bg-green-50 text-green-700" },
    maybe: { text: "🤔 Peut-être", class: "bg-yellow-50 text-yellow-700" },
    no: { text: "❌ Absent", class: "bg-red-50 text-tba-red" },
    pending: { text: "⏳ En attente", class: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full bg-linear-to-br ${color} flex items-center justify-center text-white font-bold text-xs`}>
          {initials}
        </div>
        <div>
          <div className="text-sm font-bold text-tba-blue">{name}</div>
          <div className="text-xs text-muted-foreground">📍 {loc}</div>
        </div>
      </div>
      <span className={`text-[0.65rem] font-bold px-3 py-1 rounded-full ${statusConfig[status].class}`}>
        {statusConfig[status].text}
      </span>
    </div>
  );
}

function CommentItem({ initials, name, time, text, color }: any) {
  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-full bg-linear-to-br ${color} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
        {initials}
      </div>
      <div className="flex-1 bg-muted/50 rounded-2xl p-4 border border-border/50">
        <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
          <span className="font-bold text-tba-blue">{name}</span>
          <span className="opacity-70 font-medium">{time}</span>
        </div>
        <div className="text-sm text-foreground leading-relaxed">{text}</div>
      </div>
    </div>
  );
}
