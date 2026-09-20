import React, { useState } from "react";
import {
  UtensilsCrossed,
  Trash2,
  Truck,
  CheckCircle2,
  Circle,
  Calendar,
  Building2,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/useApp";

export const DutyRosterView: React.FC = () => {
  const { duties, toggleDutyComplete, currentRoom, role } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const completedCount = duties.filter((d) => d.completed).length;
  const pendingCount = duties.length - completedCount;

  const categories = [
    { id: "all", label: "Alle Dienste" },
    { id: "lunch", label: "Mittagessen Bento", icon: UtensilsCrossed },
    { id: "cleaning", label: "Raumreinigung", icon: Trash2 },
    { id: "instrument_transport", label: "Instrumententransport", icon: Truck },
  ];

  const filteredDuties = duties.filter((d) => {
    if (selectedFilter === "all") return true;
    return d.duty_type === selectedFilter;
  });

  const getDutyIcon = (type: string) => {
    switch (type) {
      case "lunch":
        return <UtensilsCrossed className="w-4 h-4 text-amber-500" />;
      case "cleaning":
        return <Trash2 className="w-4 h-4 text-emerald-500" />;
      case "instrument_transport":
        return <Truck className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-rose-500" />;
    }
  };

  const getDutyBadge = (type: string) => {
    switch (type) {
      case "lunch":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900";
      case "cleaning":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
      case "instrument_transport":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-4 -bottom-6 text-9xl font-bold font-display text-white/[0.03] pointer-events-none select-none">
          役
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Orchester-Organisation</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
            Putz- & Essensplan
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Gemeinsame Verantwortung für Sauberkeit und Verpflegung. Mülltrennung erfolgt nach
            japanischem Standard (PET-Flaschen, Dosen, Brennbar).
          </p>
        </div>
      </div>

      {/* Role-Specific Stats Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            {completedCount}/{duties.length}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {role === "staff" ? "Dienstplan-Kontrolle (Begleiter)" : "Gesamtfortschritt"}
            </div>
            <div className="text-[11px] text-slate-500">
              {pendingCount === 0 ? "Alle Aufgaben abgeschlossen!" : `${pendingCount} Aufgaben noch offen`}
            </div>
          </div>
        </div>

        {currentRoom && role === "musician" && (
          <div className="w-full sm:w-auto px-3.5 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 font-semibold flex items-center justify-between gap-2">
            <span>Mein Zimmer ({currentRoom.room_number}):</span>
            <span className="font-bold">
              {duties.some((d) => !d.completed && (d.room_number === currentRoom.room_number || String(d.assigned_people || "").includes(currentRoom.room_number)))
                ? "1 offener Dienst anstehend"
                : "Alles erledigt 🎉"}
            </span>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === cat.id
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Duties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDuties.map((duty) => {
          const isMyDuty = Boolean(
            currentRoom &&
            (duty.room_number === currentRoom.room_number ||
              (Array.isArray(duty.assigned_people)
                ? duty.assigned_people.some((p) => p.includes(currentRoom.room_number))
                : String(duty.assigned_people || "").includes(currentRoom.room_number))),
          );

          return (
            <div
              key={duty.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                duty.completed
                  ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75"
                  : isMyDuty
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 shadow-md ring-2 ring-rose-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${getDutyBadge(
                      duty.duty_type,
                    )}`}
                  >
                    {getDutyIcon(duty.duty_type)}
                    <span>
                      {duty.duty_type === "lunch"
                        ? "Mittagessen Bento"
                        : duty.duty_type === "cleaning"
                          ? "Raum-Reinigung"
                          : "Instrumententransport"}
                    </span>
                  </span>

                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{duty.date}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  {(duty as unknown as { time?: string }).time && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{(duty as unknown as { time?: string }).time}</span>
                    </div>
                  )}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {Array.isArray(duty.assigned_people)
                      ? duty.assigned_people.join(" · ")
                      : duty.assigned_people}
                  </h4>
                  {duty.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {duty.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {duty.completed ? "Abgeschlossen" : "Ausstehend"}
                </span>

                <button
                  onClick={() => toggleDutyComplete(duty.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    duty.completed
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {duty.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Erledigt</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-slate-400" />
                      <span>Als erledigt markieren</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
