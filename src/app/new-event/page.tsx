"use client";

import { useState, useMemo } from "react";
import { Save, Search, UserPlus, Users, MapPin, Calendar, Clock, Lock, ShieldCheck, Bell, MessageSquare, Type, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EventType } from "@/types";
import { toast } from "sonner";

export default function NewEventPage() {
  const [activeLoc, setActiveLoc] = useState("Antananarivo");
  const [eventType, setEventType] = useState<EventType>("autre");
  const [toggles, setToggles] = useState({
    visible: true,
    notif: true,
    comments: true,
    filterLoc: false
  });

  const handleSave = () => {
    toast.success("Événement enregistré avec succès !");
  };

  const handleAddGuest = () => {
    toast.info("Ajouter un invité : Fonctionnalité en cours de développement");
  };

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const locations = ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga", "Fianarantsoa", "Toliara", "Antsiranana", "Foulpointe"];

  const isSensitive = useMemo(() => {
    return ['mariage', 'baptême', 'anniversaire de décès', 'événement global'].includes(eventType);
  }, [eventType]);

  const eventTypes: { label: string; value: EventType }[] = [
    { label: "🐣 Réunion familiale", value: "autre" },
    { label: "🎂 Anniversaire", value: "autre" },
    { label: "💒 Mariage", value: "mariage" },
    { label: "👶 Baptême", value: "baptême" },
    { label: "🕯️ Anniversaire de décès", value: "anniversaire de décès" },
    { label: "🌍 Événement global", value: "événement global" },
    { label: "🏖️ Vacances", value: "autre" },
    { label: "🎭 Sortie", value: "autre" },
  ];

  return (
    <div className="animate-fade-in pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-tba-blue tracking-tight font-serif">Créer un événement</h1>
          <p className="text-sm text-tba-gray mt-1.5 font-medium">Renseignez les informations de votre événement familial</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 py-2.5 px-6 text-sm">
          <Save size={16} />
          Enregistrer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="standard-card">
            <div className="px-5 py-3.5 border-b border-tba-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={16} className="text-tba-blue" />
                <h3 className="text-base font-semibold text-tba-blue">Informations générales</h3>
              </div>
              {isSensitive ? <StatusBadge status="pending" className="text-[0.6rem]" /> : <StatusBadge status="approved" className="text-[0.6rem]" />}
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="section-label">Nom de l'événement *</label>
                  <div className="input-with-icon">
                    <Info size={15} className="text-tba-muted shrink-0" />
                    <input type="text" className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-tba-blue placeholder:text-tba-muted" placeholder="Ex: Anniversaire de Maman, Vacances d'été…" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="section-label">Type d'événement *</label>
                  <div className="input-with-icon">
                    <CheckCircle2 size={15} className="text-tba-muted shrink-0" />
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-tba-blue cursor-pointer"
                    >
                      {eventTypes.map(t => (
                        <option key={t.value + t.label} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  {isSensitive && (
                    <p className="text-[0.65rem] text-tba-yellow font-medium flex items-center gap-1 mt-1">
                      <AlertCircle size={10} /> Nécessite l'approbation d'un Admin
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="section-label">Visibilité</label>
                  <div className="input-with-icon">
                    <Lock size={15} className="text-tba-muted shrink-0" />
                    <select className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-tba-blue cursor-pointer">
                      <option>🌍 Toute la famille</option>
                      <option>📍 Par localisation</option>
                      <option>👥 Invités seulement</option>
                      <option>🔒 Privé</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="section-label">Date de début *</label>
                  <div className="input-with-icon">
                    <Calendar size={15} className="text-tba-muted shrink-0" />
                    <input type="date" className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-tba-blue" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="section-label">Date de fin</label>
                  <div className="input-with-icon">
                    <Clock size={15} className="text-tba-muted shrink-0" />
                    <input type="date" className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-tba-blue" />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="section-label">Description</label>
                  <textarea className="w-full px-4 py-3 rounded-xl bg-tba-surface border border-tba-border text-sm font-medium text-tba-blue focus:border-tba-blue focus:ring-2 focus:ring-tba-blue/10 outline-none min-h-[100px] resize-none transition-all duration-200 placeholder:text-tba-muted" placeholder="Décrivez l'événement, les détails pratiques…" />
                </div>
              </div>
            </div>
          </div>

          <div className="standard-card">
            <div className="px-5 py-3.5 border-b border-tba-border/50 flex items-center gap-2">
              <MapPin size={16} className="text-tba-blue" />
              <h3 className="text-base font-semibold text-tba-blue">Localisation</h3>
            </div>
            <div className="p-5">
              <div className="input-with-icon mb-5">
                <Search className="text-tba-muted shrink-0" size={15} />
                <input type="text" className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-tba-blue placeholder:text-tba-muted" placeholder="Rechercher une ville ou adresse…" />
              </div>
              <div className="section-label mb-2.5">Suggestions</div>
              <div className="flex flex-wrap gap-1.5">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setActiveLoc(loc)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer border transition-all duration-200 ${
                      activeLoc === loc
                        ? "bg-tba-blue text-white border-tba-blue shadow-md shadow-tba-blue/15"
                        : "bg-white text-tba-gray border-tba-border hover:border-tba-blue/40 hover:text-tba-blue"
                    }`}
                  >
                    <MapPin size={12} /> {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="standard-card">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-tba-border/50">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-tba-blue" />
                <h3 className="text-base font-semibold text-tba-blue">Gestion des invités</h3>
              </div>
              <button onClick={handleAddGuest} className="btn-ghost text-xs py-1.5 px-3">+ Ajouter</button>
            </div>
            <div className="p-5 space-y-0">
              <GuestRow initials="SL" name="Sullivan" role="Organisateur" color="from-tba-blue to-tba-cyan" isOrg />
              <GuestRow initials="AN" name="Anja" role="📍 Antananarivo" color="from-emerald-700 to-emerald-500" />
              <GuestRow initials="YS" name="Yasina" role="📍 Toamasina" color="from-amber-600 to-amber-400" />

              <div className="pt-4 mt-2 border-t border-tba-border/50 text-center">
                <button
                  onClick={() => toast.success("Toute la famille a été invitée !")}
                  className="text-tba-blue text-xs font-medium hover:underline transition-all duration-200 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <Users size={13} /> Inviter toute la famille
                </button>
              </div>
            </div>
          </div>

          <div className="standard-card">
            <div className="px-5 py-3.5 border-b border-tba-border/50 flex items-center gap-2">
              <ShieldCheck size={16} className="text-tba-blue" />
              <h3 className="text-base font-semibold text-tba-blue">Paramètres & Sécurité</h3>
            </div>
            <div className="p-5 space-y-5">
              <ToggleRow icon={<Lock size={16} className="text-tba-blue" />} title="Visible par tous" sub="Tous les membres de la famille peuvent voir l'événement" on={toggles.visible} toggle={() => toggle('visible')} />
              <ToggleRow icon={<MapPin size={16} className="text-tba-cyan" />} title="Filtrer par ville" sub="Seuls les membres de la ville choisie verront l'événement" on={toggles.filterLoc} toggle={() => toggle('filterLoc')} />
              <ToggleRow icon={<Bell size={16} className="text-tba-red" />} title="Notifications" sub="Envoyer un rappel automatique à J-3" on={toggles.notif} toggle={() => toggle('notif')} />
              <ToggleRow icon={<MessageSquare size={16} className="text-emerald-600" />} title="Commentaires" sub="Autoriser les échanges sur cet événement" on={toggles.comments} toggle={() => toggle('comments')} />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-amber-500 shrink-0" size={18} />
            <div className="text-xs text-amber-800">
              <span className="font-semibold">Note :</span> Les champs marqués d'une étoile (*) sont obligatoires. {isSensitive ? "Cet événement étant de type sensible, il devra être validé par un administrateur avant d'être visible par tous." : "Votre événement sera visible dès l'enregistrement selon vos paramètres de confidentialité."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestRow({ initials, name, role, color, isOrg }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-tba-border/50 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm`}>
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-tba-blue">{name}</div>
          <div className="text-xs text-tba-muted">{role}</div>
        </div>
      </div>
      {isOrg ? (
        <span className="text-[0.65rem] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Organisateur</span>
      ) : (
        <button onClick={() => toast.info(`${name} retiré`)} className="text-tba-red text-xs font-medium hover:opacity-70 transition-all duration-200">Retirer</button>
      )}
    </div>
  );
}

function ToggleRow({ icon, title, sub, on, toggle }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-tba-surface border border-tba-border/50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all duration-200">{icon}</div>
        <div>
          <div className="text-sm font-semibold text-tba-blue">{title}</div>
          <div className="text-[0.7rem] text-tba-muted font-medium">{sub}</div>
        </div>
      </div>
      <div
        onClick={toggle}
        className={`relative w-10 h-[22px] rounded-full cursor-pointer transition-colors duration-200 shrink-0 ${on ? 'bg-tba-blue' : 'bg-tba-border'}`}
      >
        <div className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${on ? 'translate-x-[18px]' : ''}`} />
      </div>
    </div>
  );
}
