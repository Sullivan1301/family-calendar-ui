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
          <h1 className="text-4xl md:text-5xl font-bold text-tba-blue tracking-tight">Créer un événement</h1>
          <p className="text-base text-tba-gray mt-2 font-sans font-normal">Renseignez les informations de votre événement familial</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 py-3 px-8 shadow-xl">
          <Save size={18} />
          <span>Enregistrer l'événement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {/* Main info */}
          <div className="standard-card">
            <div className="px-6 py-4 border-b border-tba-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={18} className="text-tba-blue" />
                <h3 className="text-lg font-bold text-tba-blue">Informations générales</h3>
              </div>
              {isSensitive ? (
                <StatusBadge status="pending" />
              ) : (
                <StatusBadge status="approved" />
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-tba-gray uppercase tracking-widest">Nom de l'événement *</label>
                  <div className="input-with-icon">
                    <Info size={16} className="text-tba-gray-light mr-2" />
                    <input type="text" className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-tba-blue placeholder:text-tba-gray-light" placeholder="Ex: Anniversaire de Maman, Vacances d'été…" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-tba-gray uppercase tracking-widest">Type d'événement *</label>
                  <div className="input-with-icon">
                    <CheckCircle2 size={16} className="text-tba-gray-light mr-2" />
                    <select 
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-tba-blue cursor-pointer"
                    >
                      {eventTypes.map(t => (
                        <option key={t.value + t.label} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  {isSensitive && (
                    <p className="text-[0.65rem] text-tba-yellow font-bold flex items-center gap-1 mt-1">
                      <AlertCircle size={10} /> Nécessite l'approbation d'un Admin
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-tba-gray uppercase tracking-widest">Visibilité</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="text-tba-gray-light mr-2" />
                    <select className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-tba-blue cursor-pointer">
                      <option>🌍 Toute la famille</option>
                      <option>📍 Par localisation</option>
                      <option>👥 Invités seulement</option>
                      <option>🔒 Privé</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-tba-gray uppercase tracking-widest">Date de début *</label>
                  <div className="input-with-icon">
                    <Calendar size={16} className="text-tba-gray-light mr-2" />
                    <input type="date" className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-tba-blue" defaultValue="2026-03-29" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-tba-gray uppercase tracking-widest">Date de fin</label>
                  <div className="input-with-icon">
                    <Clock size={16} className="text-tba-gray-light mr-2" />
                    <input type="date" className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-tba-blue" />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-tba-gray uppercase tracking-widest">Description</label>
                  <textarea className="w-full px-4 py-3 rounded-xl bg-white border border-tba-border text-sm font-semibold text-tba-blue focus:border-tba-red outline-none min-h-[120px] resize-none transition-all placeholder:text-tba-gray-light" placeholder="Décrivez l'événement, les détails pratiques…"></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="standard-card">
            <div className="px-6 py-4 border-b border-tba-border flex items-center gap-2">
              <MapPin size={18} className="text-tba-blue" />
              <h3 className="text-lg font-bold text-tba-blue">Localisation</h3>
            </div>
            <div className="p-6">
              <div className="relative mb-6">
                <div className="input-with-icon">
                  <Search className="text-tba-gray-light mr-2" size={16} />
                  <input type="text" className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-tba-blue placeholder:text-tba-gray-light" placeholder="Rechercher une ville ou adresse…" />
                </div>
              </div>
              <div className="text-[0.7rem] font-bold text-tba-gray-light mb-3 uppercase tracking-widest">Suggestions</div>
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <span
                    key={loc}
                    onClick={() => setActiveLoc(loc)}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold cursor-pointer border-2 transition-all ${
                      activeLoc === loc
                        ? "bg-tba-blue text-white border-tba-blue shadow-lg shadow-tba-blue/20"
                        : "bg-white text-tba-gray border-tba-border hover:border-tba-blue hover:text-tba-blue"
                    }`}
                  >
                    📍 {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Guest Management */}
          <div className="standard-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-tba-border">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-tba-blue" />
                <h3 className="text-lg font-bold text-tba-blue">Gestion des invités</h3>
              </div>
              <button onClick={handleAddGuest} className="btn-secondary py-2 px-4 text-xs font-bold">+ Ajouter</button>
            </div>
              <div className="p-6 space-y-4">
                <GuestRow initials="SL" name="Sullivan" role="Organisateur" color="from-tba-blue to-tba-cyan" isOrg />
                <GuestRow initials="AN" name="Anja" role="📍 Antananarivo" color="from-emerald-700 to-emerald-500" />
                <GuestRow initials="YS" name="Yasina" role="📍 Toamasina" color="from-amber-600 to-amber-400" />
                
                <div className="pt-4 border-t border-tba-border text-center">
                <button 
                  onClick={() => toast.success("Toute la famille a été invitée !")}
                  className="text-tba-blue text-xs font-bold hover:underline transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <Users size={14} /> Inviter toute la famille
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="standard-card">
            <div className="px-6 py-4 border-b border-tba-border flex items-center gap-2">
              <ShieldCheck size={18} className="text-tba-blue" />
              <h3 className="text-lg font-bold text-tba-blue">Paramètres & Sécurité</h3>
            </div>
            <div className="p-6 space-y-6">
              <ToggleRow 
                icon={<Lock size={18} className="text-tba-blue" />}
                title="Visible par tous" 
                sub="Tous les membres de la famille peuvent voir l'événement" 
                on={toggles.visible} 
                toggle={() => toggle('visible')} 
              />
              <ToggleRow 
                icon={<MapPin size={18} className="text-tba-cyan" />}
                title="Filtrer par ville" 
                sub="Seuls les membres de la ville choisie verront l'événement" 
                on={toggles.filterLoc} 
                toggle={() => toggle('filterLoc')} 
              />
              <ToggleRow 
                icon={<Bell size={18} className="text-tba-red" />}
                title="Notifications" 
                sub="Envoyer un rappel automatique à J-3" 
                on={toggles.notif} 
                toggle={() => toggle('notif')} 
              />
              <ToggleRow 
                icon={<MessageSquare size={18} className="text-emerald-600" />}
                title="Commentaires" 
                sub="Autoriser les échanges sur cet événement" 
                on={toggles.comments} 
                toggle={() => toggle('comments')} 
              />
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <div className="text-xs text-amber-800">
              <span className="font-bold">Note :</span> Les champs marqués d'une étoile (*) sont obligatoires. {isSensitive ? "Cet événement étant de type sensible, il devra être validé par un administrateur avant d'être visible par tous." : "Votre événement sera visible dès l'enregistrement selon vos paramètres de confidentialité."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestRow({ initials, name, role, color, isOrg }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-tba-border last:border-b-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full bg-linear-to-br ${color} flex items-center justify-center text-white font-bold text-xs`}>
          {initials}
        </div>
        <div>
          <div className="text-sm font-bold text-tba-blue">{name}</div>
          <div className="text-xs text-tba-gray">{role}</div>
        </div>
      </div>
      {isOrg ? (
        <span className="text-[0.65rem] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">Organisateur</span>
      ) : (
        <button onClick={() => toast.info(`${name} retiré`)} className="text-tba-red text-xs font-bold hover:text-tba-red-light transition-all">Retirer</button>
      )}
    </div>
  );
}

function ToggleRow({ icon, title, sub, on, toggle }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-tba-bg-light flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">{icon}</div>
        <div>
          <div className="text-sm font-bold text-tba-blue">{title}</div>
          <div className="text-[0.7rem] text-tba-gray font-medium">{sub}</div>
        </div>
      </div>
      <div 
        onClick={toggle}
        className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${on ? 'bg-tba-blue' : 'bg-tba-border'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${on ? 'translate-x-5' : ''}`} />
      </div>
    </div>
  );
}
