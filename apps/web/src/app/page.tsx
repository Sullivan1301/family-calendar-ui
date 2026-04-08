"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PartyPopper, Users, Clock, CheckCircle, ShieldCheck, AlertCircle, Calendar as CalendarIcon, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/ui/StatusBadge";
import { getMadagascarHolidays, Holiday } from "../lib/holidays";
import { Calendar } from "../components/ui/calendar";
import { fr } from "date-fns/locale";
import { format, isSameDay, startOfWeek, addDays, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("Mois");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    getMadagascarHolidays(2026).then(setHolidays);
  }, []);

  const familyEvents = useMemo(() => [
    { id: '1', date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7), title: '🎂 Anniversaire de Yasina', type: 'birthday' },
    { id: '2', date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 14), title: '🐣 Réunion famille Pâques', type: 'event' },
    { id: '3', date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()), title: '💒 Mariage de Rina', type: 'event' },
  ], []);

  // Fonction pour obtenir les événements d'une date spécifique
  const getEventsForDate = (date: Date) => {
    return familyEvents.filter(event => isSameDay(event.date, date));
  };

  // Calculer les jours de la semaine pour la vue semaine
  const daysOfWeek = useMemo(() => {
    const start = startOfWeek(month, { weekStartsOn: 1 });
    return eachDayOfInterval({
      start: start,
      end: addDays(start, 6)
    });
  }, [month]);

  const monthStr = format(month, 'yyyy-MM');
  const currentMonthHolidays = holidays.filter(h => h.date.startsWith(monthStr));
  const currentMonthEvents = familyEvents.filter(e => format(e.date, 'yyyy-MM') === monthStr);

  // Mise à jour de selectedDayInfo pour s'assurer qu'il fonctionne avec toutes les vues
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
              Aujourd'hui nous sommes le <span className="font-bold text-tba-blue">{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </p>
          </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-muted p-1.5 rounded-2xl gap-1 shadow-inner">
            {["Mois", "Semaine", "Jour"].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setCurrentView(v);
                  // Réinitialiser la sélection à aujourd'hui quand on change de vue
                  setSelectedDate(new Date());
                }}
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
            {currentView === 'Mois' ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={month}
                onMonthChange={setMonth}
                locale={fr}
                className="rounded-md border shadow-none w-fit mx-auto"
                components={{
                }}
              />
            ) : currentView === 'Semaine' ? (
              <div className="bg-white rounded-lg border border-border shadow-sm p-4 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                  <button 
                    onClick={() => setMonth(subMonths(month, 1))}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    &lt;
                  </button>
                  <h2 className="font-bold text-tba-blue">
                    Semaine du {format(startOfWeek(month, { weekStartsOn: 1 }), 'd MMM yyyy')} - {format(addDays(startOfWeek(month, { weekStartsOn: 1 }), 6), 'd MMM yyyy')}
                  </h2>
                  <button 
                    onClick={() => setMonth(addMonths(month, 1))}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    &gt;
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                    <div key={index} className="text-center text-xs font-bold text-tba-gray py-2 border-b border-gray-100">
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
                        className={`min-h-24 p-1 border rounded cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-tba-blue/30 border-tba-blue shadow-inner' 
                            : isToday 
                              ? 'bg-tba-blue/10 border-tba-blue' 
                              : 'border-transparent hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className={`text-right pr-1 text-sm font-medium ${
                          isToday ? 'font-bold text-tba-blue' : isSelected ? 'text-tba-blue' : ''
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                          {isHoliday && <span className="w-2 h-2 rounded-full bg-tba-yellow" />}
                          {events.slice(0, 2).map((event, idx) => ( // Limiter à 2 événements pour ne pas encombrer
                            <span key={idx} className={`w-2 h-2 rounded-full ${event.type === 'birthday' ? 'bg-tba-red' : 'bg-tba-cyan'}`} />
                          ))}
                          {events.length > 2 && (
                            <span className="text-[0.6rem] text-gray-500">+{events.length - 2}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-border shadow-sm p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                  <button 
                    onClick={() => setSelectedDate(addDays(selectedDate || new Date(), -1))}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    &lt;
                  </button>
                  <h2 className="font-bold text-xl text-tba-blue">
                    {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: fr }) : format(new Date(), 'd MMMM yyyy', { locale: fr })}
                  </h2>
                  <button 
                    onClick={() => setSelectedDate(addDays(selectedDate || new Date(), 1))}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    &gt;
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDate && (() => {
                    const dStr = format(selectedDate, 'yyyy-MM-dd');
                    const dayHolidays = holidays.filter(h => h.date === dStr);
                    const dayEvents = getEventsForDate(selectedDate);
                    
                    if (dayHolidays.length === 0 && dayEvents.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                          <p className="font-medium">Aucun événement pour cette journée</p>
                          <p className="text-sm mt-1">Sélectionnez un autre jour ou créez un nouvel événement</p>
                        </div>
                      );
                    }
                    
                    return [
                      ...dayHolidays.map((holiday, idx) => (
                        <div key={`holiday-${idx}`} className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                              <div className="w-3 h-3 rounded-full bg-tba-yellow"></div>
                            </div>
                            <div>
                              <div className="font-bold text-tba-yellow text-sm uppercase tracking-wide">Jour férié</div>
                              <div className="font-medium text-gray-800">{holiday.localName}</div>
                            </div>
                          </div>
                        </div>
                      )),
                      ...dayEvents.map((event, idx) => (
                        <div key={`event-${idx}`} className="p-4 border rounded-lg bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                              <div className={`w-3 h-3 rounded-full ${event.type === 'birthday' ? 'bg-tba-red' : 'bg-tba-cyan'}`}></div>
                            </div>
                            <div>
                              <div className="font-bold text-tba-cyan text-sm uppercase tracking-wide">
                                {event.type === 'birthday' ? 'Anniversaire' : 'Événement'}
                              </div>
                              <div className="font-medium text-gray-800">{event.title}</div>
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