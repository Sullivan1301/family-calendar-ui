"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/ui/StatusBadge";
import { getMadagascarHolidays, Holiday } from "../lib/holidays";
import { Calendar } from "../components/ui/calendar";
import { fr } from "date-fns/locale";
import { format, isSameDay, startOfWeek, addDays, eachDayOfInterval, subMonths, addMonths } from "date-fns";
import { useApi } from "../hooks/useApi";

const typeEmoji: Record<string, string> = {
  mariage: '💒',
  'baptême': '👶',
  'anniversaire de décès': '🕯️',
  'événement global': '🌍',
  autre: '🐣',
};

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("Mois");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const { user, isAdmin, activeFamily } = useAuth();

  useEffect(() => {
    getMadagascarHolidays(2026).then(setHolidays);
  }, []);

  const { data: eventsData } = useApi<{ events: any[] }>(
    activeFamily ? `/api/events?familyId=${activeFamily.id}` : null
  );

  const familyEvents = useMemo(() => {
    if (eventsData?.events) {
      return eventsData.events.map((e: any) => ({
        id: e.id,
        date: new Date(e.startDate),
        title: `${typeEmoji[e.type] || '📅'} ${e.title}`,
        type: e.type === 'mariage' || e.type === 'baptême' ? 'event' : e.type === 'autre' ? 'birthday' : 'event',
      }));
    }
    return [];
  }, [eventsData]);

  const getEventsForDate = (date: Date) => {
    return familyEvents.filter(event => isSameDay(event.date, date));
  };

  const daysOfWeek = useMemo(() => {
    const start = startOfWeek(month, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [month]);

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
          <h1 className="text-3xl md:text-4xl font-bold text-tba-blue tracking-tight font-serif">
            Bonjour, {user?.name || 'Sullivan'} 👋
          </h1>
          <p className="text-sm text-tba-gray mt-1.5 font-medium">
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-tba-border rounded-xl p-1 gap-0.5 shadow-sm">
            {["Mois", "Semaine", "Jour"].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setCurrentView(v);
                  setSelectedDate(new Date());
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentView === v
                    ? "bg-tba-blue text-white shadow-md shadow-tba-blue/15"
                    : "text-tba-gray hover:bg-tba-surface"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Link href="/new-event" className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Nouvel</span> Événement
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon="🎉" gradient="from-tba-blue/10 to-tba-blue/5" value={String(familyEvents.length)} label="Événements cette année" />
        <StatCard icon="👨‍👩‍👧‍👦" gradient="from-tba-cyan/10 to-tba-cyan/5" value={activeFamily ? "—" : "—"} label="Membres actifs" />
        {isAdmin ? (
          <StatCard icon="🛡️" gradient="from-tba-yellow/15 to-tba-yellow/5" value={String(familyEvents.filter(e => e.type === 'pending').length)} label="Validations en attente" />
        ) : (
          <StatCard icon="⏳" gradient="from-tba-red/10 to-tba-red/5" value={String(familyEvents.filter(e => e.type === 'pending').length)} label="RSVP en attente" />
        )}
        <StatCard icon="✅" gradient="from-emerald-100 to-emerald-50" value={String(familyEvents.length > 0 ? "100%" : "—")} label="Disponibilité moy." />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card p-6 overflow-hidden">
          <div className="flex justify-center w-full">
            {currentView === 'Mois' ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={month}
                onMonthChange={setMonth}
                locale={fr}
                className="rounded-lg border-0 shadow-none w-fit mx-auto"
                components={{}}
              />
            ) : currentView === 'Semaine' ? (
              <div className="bg-white rounded-xl border border-tba-border shadow-sm p-5 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-5">
                  <button
                    onClick={() => setMonth(subMonths(month, 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-tba-gray hover:bg-tba-surface hover:text-tba-blue transition-all duration-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="font-semibold text-sm text-tba-blue">
                    Semaine du {format(startOfWeek(month, { weekStartsOn: 1 }), 'd MMM yyyy')} — {format(addDays(startOfWeek(month, { weekStartsOn: 1 }), 6), 'd MMM yyyy')}
                  </h2>
                  <button
                    onClick={() => setMonth(addMonths(month, 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-tba-gray hover:bg-tba-surface hover:text-tba-blue transition-all duration-200"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                    <div key={index} className="text-center text-xs font-semibold text-tba-muted py-2 border-b border-tba-border/50">
                      {day}
                    </div>
                  ))}
                  {daysOfWeek.map((date) => {
                    const dStr = format(date, 'yyyy-MM-dd');
                    const isHoliday = holidays.some(h => h.date === dStr);
                    const events = getEventsForDate(date);
                    const isToday = isSameDay(date, new Date());
                    const isSelected = selectedDate && isSameDay(date, selectedDate);

                    return (
                      <div
                        key={date.toString()}
                        className={`min-h-24 p-1.5 border rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-tba-blue/10 border-tba-blue/40 shadow-inner-sm'
                            : isToday
                              ? 'bg-tba-blue/5 border-tba-blue/20'
                              : 'border-transparent hover:bg-tba-surface hover:border-tba-border/50'
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className={`text-right pr-1.5 text-sm font-medium ${
                          isToday ? 'font-bold text-tba-blue' : isSelected ? 'text-tba-blue' : 'text-tba-gray'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="flex flex-wrap gap-0.5 justify-center mt-1.5">
                          {isHoliday && <span className="w-1.5 h-1.5 rounded-full bg-tba-yellow" />}
                          {events.slice(0, 2).map((event, idx) => (
                            <span key={idx} className={`w-1.5 h-1.5 rounded-full ${event.type === 'birthday' ? 'bg-tba-red' : 'bg-tba-cyan'}`} />
                          ))}
                          {events.length > 2 && (
                            <span className="text-[0.55rem] text-tba-muted font-medium">+{events.length - 2}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-tba-border shadow-sm p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate || new Date(), -1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-tba-gray hover:bg-tba-surface hover:text-tba-blue transition-all duration-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="font-semibold text-lg text-tba-blue">
                    {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: fr }) : format(new Date(), 'd MMMM yyyy', { locale: fr })}
                  </h2>
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate || new Date(), 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-tba-gray hover:bg-tba-surface hover:text-tba-blue transition-all duration-200"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDate && (() => {
                    const dStr = format(selectedDate, 'yyyy-MM-dd');
                    const dayHolidays = holidays.filter(h => h.date === dStr);
                    const dayEvents = getEventsForDate(selectedDate);

                    if (dayHolidays.length === 0 && dayEvents.length === 0) {
                      return (
                        <div className="text-center py-12 text-tba-gray bg-tba-surface rounded-xl border border-dashed border-tba-border">
                          <p className="font-medium text-sm">Aucun événement pour cette journée</p>
                          <p className="text-xs mt-1 text-tba-muted">Sélectionnez un autre jour ou créez un nouvel événement</p>
                        </div>
                      );
                    }

                    return [
                      ...dayHolidays.map((holiday, idx) => (
                        <div key={`holiday-${idx}`} className="p-4 border rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200/60">
                          <div className="flex items-start gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-tba-yellow mt-1.5 shrink-0" />
                            <div>
                              <div className="font-semibold text-tba-yellow text-xs uppercase tracking-wide">Jour férié</div>
                              <div className="font-medium text-tba-text text-sm mt-0.5">{holiday.localName}</div>
                            </div>
                          </div>
                        </div>
                      )),
                      ...dayEvents.map((event, idx) => (
                        <div key={`event-${idx}`} className="p-4 border rounded-xl bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-200/60">
                          <div className="flex items-start gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${event.type === 'birthday' ? 'bg-tba-red' : 'bg-tba-cyan'} mt-1.5 shrink-0`} />
                            <div>
                              <div className="font-semibold text-tba-cyan text-xs uppercase tracking-wide">
                                {event.type === 'birthday' ? 'Anniversaire' : 'Événement'}
                              </div>
                              <div className="font-medium text-tba-text text-sm mt-0.5">{event.title}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ];
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-5 border-t border-tba-border/50 flex flex-wrap gap-5 justify-center">
            <LegendItem color="bg-tba-cyan" label="Événement" />
            <LegendItem color="bg-tba-red" label="Anniversaire" />
            <LegendItem color="bg-tba-yellow" label="Férié MG" />
            <LegendItem color="bg-tba-blue" label="Aujourd'hui" ring />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-tba bg-gradient-to-br from-tba-blue via-[#1a3578] to-tba-blue p-6 text-white shadow-tba-lg shadow-tba-blue/20 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10">
              <div className="text-[0.65rem] font-semibold uppercase tracking-wide opacity-60 mb-3 flex items-center gap-1.5">
                <CalendarIcon size={13} /> Détails du jour
              </div>
              <div className="mb-5">
                <div className="text-3xl font-bold font-serif capitalize">
                  {selectedDate ? format(selectedDate, 'EEEE d', { locale: fr }) : 'Choisir une date'}
                </div>
                <div className="text-sm font-medium opacity-70 capitalize mt-0.5">
                  {selectedDate ? format(selectedDate, 'MMMM yyyy', { locale: fr }) : ''}
                </div>
              </div>

              {selectedDayInfo?.holiday || selectedDayInfo?.event ? (
                <div className="space-y-3">
                  {selectedDayInfo.holiday && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 animate-fade-in">
                      <div className="text-[0.6rem] font-bold uppercase tracking-wide text-tba-yellow mb-1">🇲🇬 Jour Férié</div>
                      <div className="text-sm font-semibold leading-snug">{selectedDayInfo.holiday.localName}</div>
                    </div>
                  )}
                  {selectedDayInfo.event && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 animate-fade-in">
                      <div className="text-[0.6rem] font-bold uppercase tracking-wide text-tba-cyan mb-1">📅 Événement</div>
                      <div className="text-sm font-semibold leading-snug">{selectedDayInfo.event.title}</div>
                      <Link href="/events" className="inline-flex items-center gap-1 text-[0.6rem] font-semibold mt-2 text-white/50 hover:text-white transition-colors duration-200">
                        VOIR LES DÉTAILS <Info size={10} />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center opacity-40 italic text-sm">
                  Aucun événement particulier prévu ce jour.
                </div>
              )}
            </div>
          </div>

          <div className="standard-card flex-1">
            <div className="px-5 py-3.5 border-b border-tba-border/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-tba-blue">Aperçu du mois</h3>
              <StatusBadge status="approved" className="bg-tba-cyan/10 text-tba-cyan border-none text-[0.65rem]" />
            </div>
            <div className="p-5">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tba-gray font-medium">Total événements</span>
                  <span className="w-8 h-8 rounded-lg bg-tba-blue/8 text-tba-blue flex items-center justify-center font-bold text-sm">{currentMonthHolidays.length + currentMonthEvents.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tba-gray font-medium">Jours fériés</span>
                  <span className="w-8 h-8 rounded-lg bg-tba-yellow/10 text-tba-text flex items-center justify-center font-bold text-sm">{currentMonthHolidays.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tba-gray font-medium">Anniversaires</span>
                  <span className="w-8 h-8 rounded-lg bg-tba-red/10 text-tba-red flex items-center justify-center font-bold text-sm">{currentMonthEvents.filter(e => e.type === 'birthday').length}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/events" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-tba-blue/15 text-tba-blue font-semibold text-xs hover:bg-tba-blue/5 hover:border-tba-blue/25 transition-all duration-200">
                  <Download size={14} /> TÉLÉCHARGER LE PLANNING PDF
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, gradient, value, label }: { icon: string, gradient: string, value: string, label: string }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4 hover-lift group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-gradient-to-br ${gradient} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-tba-blue leading-none tabular-nums">{value}</div>
        <div className="text-xs font-medium text-tba-muted mt-1">{label}</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, ring }: { color: string, label: string, ring?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-[0.65rem] text-tba-gray font-medium">
      <span className={`w-2 h-2 rounded-full ${color} ${ring ? 'ring-2 ring-tba-blue/20' : ''}`} />
      {label}
    </span>
  );
}
