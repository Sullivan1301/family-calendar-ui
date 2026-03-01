"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PartyPopper, Users, Clock, CheckCircle, ShieldCheck, AlertCircle, Calendar as CalendarIcon, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getMadagascarHolidays, Holiday } from "@/lib/holidays";
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";
import { format, isSameDay } from "date-fns";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("Mois");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 2, 1));
  const [month, setMonth] = useState<Date>(new Date(2026, 2, 1));
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    getMadagascarHolidays(2026).then(setHolidays);
  }, []);

  const familyEvents = useMemo(() => [
    { id: '1', date: new Date(2026, 2, 18), title: '🎂 Anniversaire de Yasina', type: 'birthday' },
    { id: '2', date: new Date(2026, 2, 29), title: '🐣 Réunion famille Pâques', type: 'event' },
    { id: '3', date: new Date(2026, 5, 15), title: '💒 Mariage de Rina', type: 'event' },
  ], []);

  const monthStr = format(month, 'yyyy-MM');
  const currentMonthHolidays = holidays.filter(h => h.date.startsWith(monthStr));
  const currentMonthEvents = familyEvents.filter(e => format(e.date, 'yyyy-MM') === monthStr);

  const selectedDayInfo = useMemo(() => {
    if (!selectedDate) return null;
    const dStr = format(selectedDate, 'yyyy-MM-dd');
    const holiday = holidays.find(h => h.date === dStr);
    const event = familyEvents.find(e => isSameDay(e.date, selectedDate));
    return { holiday, event };
  }, [selectedDate, holidays, familyEvents]);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-tba-blue tracking-tight">Bonjour, {user?.name || 'Sullivan'} 👋</h1>
            <p className="text-base text-tba-gray mt-2 font-sans font-normal">
              Aujourd'hui nous sommes le <span className="font-bold text-tba-blue">dimanche 1er mars 2026</span>
            </p>
          </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-muted p-1.5 rounded-2xl gap-1 shadow-inner">
            {["Mois", "Semaine", "Jour"].map((v) => (
              <button
                key={v}
                onClick={() => setCurrentView(v)}
                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                  currentView === v
                    ? "bg-white text-tba-blue shadow-md"
                    : "text-tba-gray hover:bg-white/50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Link href="/new-event" className="btn-primary flex items-center gap-2 py-3 px-6 shadow-lg shadow-tba-red/20">
            <span className="text-xl leading-none">+</span> <span className="hidden sm:inline">Nouvel</span> Événement
          </Link>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="🎉" color="bg-tba-blue/10 text-tba-blue" value="12" label="Événements cette année" />
        <StatCard icon="👨‍👩‍👧‍👦" color="bg-tba-cyan/10 text-tba-cyan" value="7" label="Membres actifs" />
        {isAdmin ? (
          <StatCard icon="🛡️" color="bg-tba-yellow/20 text-tba-text" value="2" label="Validations en attente" />
        ) : (
          <StatCard icon="⏳" color="bg-tba-red/10 text-tba-red" value="4" label="RSVP en attente" />
        )}
        <StatCard icon="✅" color="bg-green-100 text-green-600" value="71%" label="Disponibilité moy." />
      </div>

      {/* Calendar Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Calendar Card */}
        <div className="xl:col-span-2 standard-card p-6 overflow-hidden">
          <div className="flex justify-center w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={setMonth}
              locale={fr}
              className="rounded-md border shadow-none w-fit mx-auto"
              components={{
                DayContent: ({ date }: any) => {
                  const dStr = format(date, 'yyyy-MM-dd');
                  const isHoliday = holidays.some(h => h.date === dStr);
                  const event = familyEvents.find(e => isSameDay(e.date, date));

                  // Priority: Birthday > Holiday > Event
                  // We show up to 2 dots max to keep layout clean
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span>{date.getDate()}</span>
                      <div className="absolute bottom-1.5 flex gap-0.5 justify-center">
                        {isHoliday && <span className="w-1 h-1 rounded-full bg-tba-yellow" />}
                        {event && <span className={`w-1 h-1 rounded-full ${event.type === 'birthday' ? 'bg-tba-red' : 'bg-tba-cyan'}`} />}
                      </div>
                    </div>
                  );
                }
              }}
            />
          </div>
          
          <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-6 justify-center">
            <LegendItem color="bg-tba-cyan" label="Événement" />
            <LegendItem color="bg-tba-red" label="Anniversaire" />
            <LegendItem color="bg-tba-yellow" label="Férié MG" />
            <LegendItem color="bg-tba-blue" label="Aujourd'hui" ring />
          </div>
        </div>

        {/* Sidebar info card */}
        <div className="flex flex-col gap-6">
          {/* Selected Date Details */}
          <div className="standard-card p-6 bg-tba-blue text-white shadow-xl shadow-tba-blue/20">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-4 flex items-center gap-2 text-white">
              <CalendarIcon size={14} /> Détails du jour
            </h3>
            <div className="mb-6">
              <div className="text-4xl font-black font-serif capitalize">
                {selectedDate ? format(selectedDate, 'EEEE d', { locale: fr }) : 'Choisir une date'}
              </div>
              <div className="text-lg font-medium opacity-80 capitalize">
                {selectedDate ? format(selectedDate, 'MMMM yyyy', { locale: fr }) : ''}
              </div>
            </div>

            {selectedDayInfo?.holiday || selectedDayInfo?.event ? (
              <div className="space-y-4">
                {selectedDayInfo.holiday && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 animate-fade-in">
                    <div className="text-[0.6rem] font-black uppercase tracking-tighter text-tba-yellow mb-1">🇲🇬 Jour Férié</div>
                    <div className="text-sm font-bold leading-snug">{selectedDayInfo.holiday.localName}</div>
                  </div>
                )}
                {selectedDayInfo.event && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 animate-fade-in">
                    <div className="text-[0.6rem] font-black uppercase tracking-tighter text-tba-cyan mb-1">📅 Événement</div>
                    <div className="text-sm font-bold leading-snug">{selectedDayInfo.event.title}</div>
                    <Link href="/events" className="inline-flex items-center gap-1 text-[0.6rem] font-black mt-3 text-white/60 hover:text-white transition-colors">
                      VOIR LES DÉTAILS <Info size={10} />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center opacity-40 italic text-sm">
                Aucun événement particulier prévu ce jour.
              </div>
            )}
          </div>

          {/* Month Summary Card */}
          <div className="standard-card flex-1">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-black text-tba-blue uppercase tracking-widest">Aperçu du mois</h3>
              <StatusBadge status="approved" className="bg-tba-cyan/10 text-tba-cyan border-none" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-tba-gray">Total événements</span>
                  <span className="w-8 h-8 rounded-lg bg-tba-blue/10 text-tba-blue flex items-center justify-center">{currentMonthHolidays.length + currentMonthEvents.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-tba-gray">Jours fériés</span>
                  <span className="w-8 h-8 rounded-lg bg-tba-yellow/10 text-tba-text flex items-center justify-center">{currentMonthHolidays.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-tba-gray">Anniversaires</span>
                  <span className="w-8 h-8 rounded-lg bg-tba-red/10 text-tba-red flex items-center justify-center">{currentMonthEvents.filter(e => e.type === 'birthday').length}</span>
                </div>
              </div>
              
              <div className="mt-8">
                <Link href="/events" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-tba-blue/20 text-tba-blue font-bold text-xs hover:bg-tba-blue/5 transition-all">
                  TÉLÉCHARGER LE PLANNING PDF
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, value, label }: { icon: string, color: string, value: string, label: string }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-tba flex items-center gap-5 hover:-translate-y-1 hover:shadow-tba-lg transition-all group border border-border/50">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black text-tba-blue leading-none">{value}</div>
        <div className="text-xs font-bold text-muted-foreground mt-1 tracking-tight">{label}</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, ring }: { color: string, label: string, ring?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-[0.65rem] text-tba-gray font-black uppercase tracking-wider">
      <span className={`w-2.5 h-2.5 rounded-full ${color} ${ring ? 'ring-2 ring-tba-blue/20' : ''}`} />
      {label}
    </span>
  );
}
