"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PartyPopper, Users, Clock, CheckCircle, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("Mois");
  const { user, isAdmin } = useAuth();

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-tba-blue tracking-tight">Bonjour, {user?.name || 'Sullivan'} 👋</h1>
            <p className="text-base text-tba-gray mt-2 font-sans font-normal">Mars 2026 · 4 événements ce mois</p>
          </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-muted p-1 rounded-xl gap-1">
            {["Mois", "Semaine", "Jour"].map((v) => (
              <button
                key={v}
                onClick={() => setCurrentView(v)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  currentView === v
                    ? "bg-white text-tba-blue shadow-tba"
                    : "text-tba-gray hover:bg-white/50"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Link href="/new-event" className="btn-primary flex items-center gap-2">
            <span>+</span> Événement
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🎉" color="bg-tba-blue/10 text-tba-blue" value="12" label="Événements cette année" />
        <StatCard icon="👨‍👩‍👧‍👦" color="bg-tba-cyan/10 text-tba-cyan" value="7" label="Membres actifs" />
        {isAdmin ? (
          <StatCard icon="🛡️" color="bg-tba-yellow/20 text-tba-text" value="2" label="Validations en attente" />
        ) : (
          <StatCard icon="⏳" color="bg-tba-red/10 text-tba-red" value="4" label="RSVP en attente" />
        )}
        <StatCard icon="✅" color="bg-green-100 text-green-600" value="71%" label="Disponibilité moy." />
      </div>

      {/* Calendar + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Mini Calendar Card */}
        <div className="standard-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-bold text-tba-blue">📅 Calendrier — Mars 2026</h3>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-tba-gray hover:bg-tba-blue hover:text-white transition-all"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-tba-gray hover:bg-tba-blue hover:text-white transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
                <div key={d} className="text-center text-xs font-bold text-muted-foreground py-1 uppercase">{d}</div>
              ))}
              
              {/* Previous month */}
              {[24, 25, 26, 27, 28].map((d) => (
                <div key={d} className="aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted hover:text-tba-blue transition-all">
                  {d}
                </div>
              ))}
              <div className="aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted hover:text-tba-blue transition-all relative after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:rounded-full after:bg-tba-cyan">1</div>
              <div className="aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold text-muted-foreground cursor-pointer hover:bg-muted hover:text-tba-blue transition-all">2</div>

              {/* Current month */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const hasEvent = [8, 20, 29].includes(d);
                const isBirthday = d === 18;
                const isToday = d === 20;

                return (
                  <div
                    key={d}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-semibold cursor-pointer transition-all relative ${
                      isToday ? "bg-tba-blue text-white shadow-lg" : "hover:bg-muted hover:text-tba-blue"
                    } ${isBirthday ? "text-tba-red" : ""}`}
                  >
                    {d}
                    {hasEvent && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                        isToday ? "bg-tba-red" : isBirthday ? "bg-tba-red" : "bg-tba-cyan"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-4 mt-6 pt-4 border-t border-border">
              <LegendItem color="bg-tba-cyan" label="Événement" />
              <LegendItem color="bg-tba-red" label="Anniversaire" />
              <LegendItem color="bg-tba-blue" label="Aujourd'hui" />
            </div>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="standard-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-bold text-tba-blue">🗓️ Prochains événements</h3>
            <Link href="/events" className="btn-ghost text-xs">
              Voir tout
            </Link>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <EventItem 
              day="18" 
              month="mars" 
              title="🎂 Anniversaire de Yasina" 
              meta="📍 Antananarivo · 12 ans" 
              status="approved"
              dateColor="bg-tba-red"
            />
            <EventItem 
              day="29" 
              month="mars" 
              title="🐣 Réunion famille Pâques" 
              meta="📍 Toamasina · Invités : 12" 
              status="approved"
              dateColor="bg-tba-cyan"
            />
            <EventItem 
              day="15" 
              month="juin" 
              title="💒 Mariage de Rina" 
              meta="📍 Antananarivo · En attente de validation" 
              status="pending"
              dateColor="bg-tba-blue"
            />
            <EventItem 
              day="20" 
              month="avr." 
              title="👶 Baptême de Nayah" 
              meta="📍 Antsirabe · En attente de validation" 
              status="pending"
              dateColor="bg-tba-blue"
            />
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div className="standard-card mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-tba-blue">📊 Disponibilités des membres — Mars 2026</h3>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Mois en cours</span>
        </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <AvailabilityBar initials="SL" name="Sullivan" pct={85} color="from-tba-blue to-tba-cyan" />
              <AvailabilityBar initials="AN" name="Anja" pct={40} color="from-tba-red to-rose-400" />
              <AvailabilityBar initials="TH" name="Tahina" pct={60} color="from-amber-500 to-amber-300" />
            <AvailabilityBar initials="NY" name="Nayah" pct={90} color="from-tba-cyan to-blue-400" />
            <AvailabilityBar initials="YS" name="Yasina" pct={72} color="from-tba-blue to-indigo-400" />
            <AvailabilityBar initials="RI" name="Rina" pct={55} color="from-slate-600 to-slate-400" />
          </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, value, label }: { icon: string, color: string, value: string, label: string }) {
  return (
    <div className="bg-white rounded-tba p-5 shadow-tba flex items-center gap-4 hover:-translate-y-1 hover:shadow-tba-lg transition-all group border border-border">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-tba-blue leading-none">{value}</div>
        <div className="text-xs font-semibold text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function EventItem({ day, month, title, meta, status, dateColor = "bg-tba-blue" }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 cursor-pointer hover:translate-x-1 hover:shadow-tba border-l-4 border-transparent hover:border-l-tba-blue transition-all">
      <div className={`min-w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white shrink-0 ${dateColor}`}>
        <div className="text-lg font-bold leading-none">{day}</div>
        <div className="text-[0.6rem] font-bold uppercase tracking-wider">{month}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-tba-blue truncate">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{meta}</div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function AvailabilityBar({ initials, name, pct, color }: any) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white bg-linear-to-br ${color}`}>
        {initials}
      </div>
      <span className="text-sm font-semibold min-w-[80px] text-tba-blue">{name}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-linear-to-r from-tba-blue to-tba-cyan transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-muted-foreground min-w-[34px] text-right">{pct}%</span>
    </div>
  );
}
