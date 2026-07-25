"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getMadagascarHolidays, Holiday } from "@/lib/holidays";
import { fr } from "date-fns/locale";
import { format, isSameDay, startOfWeek, startOfMonth, endOfMonth, endOfWeek, addDays, eachDayOfInterval, addMonths, subMonths } from "date-fns";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("Mois");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    getMadagascarHolidays(month.getFullYear()).then(setHolidays);
  }, [month]);

  const familyEvents = useMemo(() => [
    { id: '1', date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7), title: '🎂 Anniversaire de Yasina', type: 'birthday' },
    { id: '2', date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 14), title: '🐣 Réunion famille Pâques', type: 'event' },
    { id: '3', date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()), title: '💒 Mariage de Rina', type: 'event' },
  ], []);

  const getEventsForDate = (date: Date) => {
    return familyEvents.filter(event => isSameDay(event.date, date));
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setMonth(date);
  };

  const daysOfWeek = useMemo(() => {
    const start = startOfWeek(selectedDate ?? month, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [month, selectedDate]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const monthStr = format(month, 'yyyy-MM');
  const currentMonthHolidays = holidays.filter(h => h.date.startsWith(monthStr));
  const currentMonthEvents = familyEvents.filter(e => format(e.date, 'yyyy-MM') === monthStr);

  const selectedDayInfo = useMemo(() => {
    if (!selectedDate) return null;
    const dStr = format(selectedDate, 'yyyy-MM-dd');
    const dayHolidays = holidays.filter(h => h.date === dStr);
    const dayEvents = familyEvents.filter(e => isSameDay(e.date, selectedDate));
    return { holidays: dayHolidays, events: dayEvents };
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
          <div className="flex bg-[#fffdf9] border border-[#eadfd3] rounded-xl p-1 gap-0.5 shadow-sm">
            {["Mois", "Semaine", "Jour"].map((v) => (
              <button
                key={v}
                onClick={() => {
                  const today = new Date();
                  setCurrentView(v);
                  selectDate(today);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentView === v
                    ? "bg-[#a7472d] text-white shadow-md shadow-[#a7472d]/20"
                    : "text-tba-gray hover:bg-[#f7eee5] hover:text-[#7c301d]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Link href="/new-event" className="flex items-center gap-2 rounded-lg bg-[#a7472d] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#a7472d]/20 transition-all duration-200 hover:-translate-y-px hover:bg-[#873820]">
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Nouvel</span> Événement
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon="🎉" gradient="from-[#f5dfd3] to-[#fbf5ee]" value="12" label="Événements cette année" />
        <StatCard icon="👨‍👩‍👧‍👦" gradient="from-[#dce8df] to-[#f2f7f1]" value="7" label="Membres actifs" />
        {isAdmin ? (
          <StatCard icon="🛡️" gradient="from-[#f6e5b9] to-[#fff8e8]" value="2" label="Validations en attente" />
        ) : (
          <StatCard icon="⏳" gradient="from-[#f7ddd8] to-[#fff5f2]" value="4" label="RSVP en attente" />
        )}
        <StatCard icon="✅" gradient="from-[#dce8df] to-[#f2f7f1]" value="71%" label="Disponibilité moy." />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 overflow-hidden rounded-[20px] border border-[#eadfd3] bg-[#fffdf9] shadow-[0_16px_50px_rgba(73,46,30,0.08)]">
          <div className="border-b border-[#eadfd3] bg-[#f7eee5] px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#9b6049]">Calendrier familial</p>
                <h2 className="mt-1 text-xl font-bold capitalize text-[#54291f] sm:text-2xl">{format(month, 'MMMM yyyy', { locale: fr })}</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setMonth(subMonths(month, 1))} aria-label="Mois précédent" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfcdbf] bg-[#fffdf9] text-[#7c301d] transition-colors hover:bg-[#a7472d] hover:text-white">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => selectDate(new Date())} className="hidden rounded-full px-3 py-2 text-xs font-semibold text-[#7c301d] transition-colors hover:bg-[#ecd8c8] sm:block">Aujourd&rsquo;hui</button>
                <button onClick={() => setMonth(addMonths(month, 1))} aria-label="Mois suivant" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfcdbf] bg-[#fffdf9] text-[#7c301d] transition-colors hover:bg-[#a7472d] hover:text-white">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-5">
            {currentView === 'Mois' ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[680px]">
                  <div className="grid grid-cols-7 border-b border-[#eadfd3]">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                      <div key={day} className="px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#9b6049]">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 border-l border-t border-[#eadfd3]">
                    {calendarDays.map((date) => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      const isCurrentMonth = date.getMonth() === month.getMonth();
                      const isToday = isSameDay(date, new Date());
                      const isSelected = Boolean(selectedDate && isSameDay(date, selectedDate));
                      const dayHolidays = holidays.filter((item) => item.date === dateKey);
                      const events = getEventsForDate(date);

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => selectDate(date)}
                          aria-label={format(date, 'EEEE d MMMM yyyy', { locale: fr })}
                          className={`group min-h-[104px] border-b border-r border-[#eadfd3] p-2 text-left transition-colors duration-200 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#a7472d] sm:min-h-[118px] sm:p-2.5 ${
                            isSelected ? 'bg-[#f4e0d4]' : isToday ? 'bg-[#fff5ea]' : isCurrentMonth ? 'bg-[#fffdf9] hover:bg-[#faf1e9]' : 'bg-[#f5eee6] hover:bg-[#efe3d8]'
                          }`}
                        >
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-[#a7472d] text-white' : isSelected ? 'bg-[#d78b68] text-[#54291f]' : isCurrentMonth ? 'text-[#54291f]' : 'text-[#a99485]'}`}>{date.getDate()}</span>
                          <div className="mt-2 space-y-1">
                            {dayHolidays[0] && <span className="block truncate rounded-md bg-[#f5df9e] px-1.5 py-1 text-[0.6rem] font-semibold text-[#6f4d00]" title={dayHolidays.map((holiday) => holiday.localName).join(', ')}>Férié · {dayHolidays[0].localName}</span>}
                            {events.slice(0, 2).map((event) => (
                              <span key={event.id} className={`block truncate rounded-md px-1.5 py-1 text-[0.6rem] font-semibold ${event.type === 'birthday' ? 'bg-[#f4d8d0] text-[#873820]' : 'bg-[#dce8df] text-[#315d48]'}`} title={event.title}>{event.title}</span>
                            ))}
                            {events.length > 2 && <span className="block px-1.5 text-[0.6rem] font-semibold text-[#9b6049]">+{events.length - 2} autres</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : currentView === 'Semaine' ? (
              <div className="w-full rounded-xl border border-[#eadfd3] bg-[#fffdf9] p-5 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <button
                    onClick={() => selectDate(addDays(selectedDate ?? month, -7))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-tba-gray hover:bg-tba-surface hover:text-tba-blue transition-all duration-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="font-semibold text-sm text-tba-blue">
                    Semaine du {format(daysOfWeek[0], 'd MMM yyyy')} — {format(daysOfWeek[6], 'd MMM yyyy')}
                  </h2>
                  <button
                    onClick={() => selectDate(addDays(selectedDate ?? month, 7))}
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
                        onClick={() => selectDate(date)}
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
                    onClick={() => selectDate(addDays(selectedDate || new Date(), -1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-tba-gray hover:bg-tba-surface hover:text-tba-blue transition-all duration-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="font-semibold text-lg text-tba-blue">
                    {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: fr }) : format(new Date(), 'd MMMM yyyy', { locale: fr })}
                  </h2>
                  <button
                    onClick={() => selectDate(addDays(selectedDate || new Date(), 1))}
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

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#eadfd3] px-5 py-4 sm:px-6">
            <LegendItem color="bg-[#dce8df]" label="Événement" />
            <LegendItem color="bg-[#f4d8d0]" label="Anniversaire" />
            <LegendItem color="bg-[#f5df9e]" label="Jour férié" />
            <LegendItem color="bg-[#a7472d]" label="Aujourd&rsquo;hui" ring />
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

              {selectedDayInfo && (selectedDayInfo.holidays.length > 0 || selectedDayInfo.events.length > 0) ? (
                <div className="space-y-3">
                  {selectedDayInfo.holidays.map((holiday) => (
                    <div key={holiday.date + holiday.localName} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 animate-fade-in">
                      <div className="text-[0.6rem] font-bold uppercase tracking-wide text-tba-yellow mb-1">🇲🇬 Jour Férié</div>
                      <div className="text-sm font-semibold leading-snug">{holiday.localName}</div>
                    </div>
                  ))}
                  {selectedDayInfo.events.map((event) => (
                    <div key={event.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 animate-fade-in">
                      <div className="text-[0.6rem] font-bold uppercase tracking-wide text-tba-cyan mb-1">📅 Événement</div>
                      <div className="text-sm font-semibold leading-snug">{event.title}</div>
                      <Link href="/events" className="inline-flex items-center gap-1 text-[0.6rem] font-semibold mt-2 text-white/50 hover:text-white transition-colors duration-200">
                        VOIR LES DÉTAILS <Info size={10} />
                      </Link>
                    </div>
                  ))}
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
