import React, { useState, useEffect } from "react";
import {
  Music,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Filter,
  Search,
  AlertCircle,
  Mic,
  ChevronRight,
  Volume2,
  Check,
  FileText,
} from "lucide-react";
import { useApp } from "../context/useApp";

export const ProgramRehearsalsView: React.FC = () => {
  const { concerts, rehearsalNotes, selectedInstrument, setSelectedInstrument } = useApp();
  const [subTab, setSubTab] = useState<"concerts" | "rehearsals" | "pieces">("concerts");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 26,
    minutes: 42,
    seconds: 15,
  });

  // Countdown timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const instrumentsList = [
    "Alle",
    "Violine 1",
    "Violine 2",
    "Bratsche",
    "Cello",
    "Kontrabass",
    "Querflöte",
    "Oboe",
    "Klarinette",
    "Fagott",
    "Horn",
    "Trompete",
    "Posaune",
    "Tuba",
    "Schlagwerk",
    "Harfe",
    "Klavier",
  ];

  const pieces = [
    {
      title: "The Sunken Village",
      composer: "Philip Sparke",
      duration: "11:30 min",
      notes: "Haupstück im ersten Konzertteil. Besondere Intonation im Mittelteil beachten!",
      tempo: "Andante maestoso – Allegro vivace",
    },
    {
      title: "First Suite in Eb for Military Band",
      composer: "Gustav Holst",
      duration: "10:45 min",
      notes: "Chaconne: Takt 1-8 Solo Tuba getragen, Intermezzo sehr federnd spielen.",
      tempo: "Chaconne – Intermezzo – March",
    },
    {
      title: "My Neighbor Totoro – Orchestral Fantasy",
      composer: "Joe Hisaishi / arr. Goto",
      duration: "8:20 min",
      notes: "Japanisches Gastgeschenk für das Publikum. Fröhlicher, warmer Klang.",
      tempo: "Vivace giocoso",
    },
    {
      title: "Japanese Folk Song Suite (Warabe-Uta)",
      composer: "Traditional / arr. Kaneda",
      duration: "6:50 min",
      notes: "Zugabe mit japanischen Taiko-Rhythmen im Schlagwerk.",
      tempo: "Moderato cantabile",
    },
    {
      title: "Toccata & Fuge in d-Moll",
      composer: "J.S. Bach / arr. Frackenpohl",
      duration: "9:15 min",
      notes: "Eröffnungswerk. Präzise Achtelläufe in Holz & Trompeten.",
      tempo: "Grave – Allegro",
    },
  ];

  const filteredNotes = rehearsalNotes.filter((note) => {
    const targetInsts = note.target_instruments || [];
    const matchInst =
      selectedInstrument === "Alle" ||
      targetInsts.includes("Alle") ||
      targetInsts.includes(selectedInstrument) ||
      targetInsts.some((inst) =>
        (inst || "").toLowerCase().includes((selectedInstrument || "").toLowerCase()),
      );
    const pieceStr = note.pieces || (note as unknown as { piece?: string }).piece || "";
    const barsStr = note.bars || (note as unknown as { measure?: string }).measure || "";
    const notesStr = note.notes || (note as unknown as { note?: string }).note || "";
    const titleStr = note.title || "";
    const query = (searchQuery || "").toLowerCase();
    const matchSearch =
      pieceStr.toLowerCase().includes(query) ||
      barsStr.toLowerCase().includes(query) ||
      notesStr.toLowerCase().includes(query) ||
      titleStr.toLowerCase().includes(query);
    return matchInst && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Countdown */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 border border-rose-900/60 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-4 -bottom-6 text-9xl font-bold font-display text-white/[0.04] pointer-events-none select-none">
          奏
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Nächstes Konzert · Tournee 2026</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
              Suntory Hall Tokyo · Großer Saal
            </h2>
            <p className="text-xs md:text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Minato City, Akasaka, Tokyo &middot; Anspielprobe 16:30 Uhr</span>
            </p>
          </div>

          {/* Live Countdown Clock */}
          <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3 self-start md:self-auto">
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-bold font-mono text-rose-400 block">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Std</span>
            </div>
            <span className="text-xl font-bold text-rose-500">:</span>
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-bold font-mono text-rose-400 block">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Min</span>
            </div>
            <span className="text-xl font-bold text-rose-500">:</span>
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-bold font-mono text-rose-400 block">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Sek</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Pills */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab("concerts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "concerts"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Konzertplan ({concerts.length})</span>
          </button>

          <button
            onClick={() => setSubTab("rehearsals")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "rehearsals"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Probennotizen ({rehearsalNotes.length})</span>
          </button>

          <button
            onClick={() => setSubTab("pieces")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === "pieces"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Programm-Stücke ({pieces.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Concerts Schedule */}
      {subTab === "concerts" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {concerts.map((c, idx) => (
            <div
              key={c.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                idx === 0
                  ? "bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900 shadow-md ring-2 ring-rose-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300">
                    Konzert #{idx + 1}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">{c.date}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                    {c.hall ||
                      c.title ||
                      (c as unknown as { venue?: string }).venue ||
                      "Konzertsaal"}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{c.city}</span>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Anspielprobe:</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {c.call_time ||
                        (c as unknown as { soundcheck_time?: string }).soundcheck_time ||
                        "16:00 Uhr"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-rose-500" />
                      <span>Konzertbeginn:</span>
                    </span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {c.time ||
                        (c as unknown as { start_time?: string }).start_time ||
                        "19:00 Uhr"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span className="text-slate-500">Dresscode:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {c.dress_code}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    Programm-Ablauf:
                  </span>
                  <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    {(c.pieces || (c as unknown as { program?: unknown[] }).program || []).map(
                      (item: { title: string; composer?: string } | string, i: number) => (
                        <li key={i} className="truncate">
                          {typeof item === "string"
                            ? item
                            : `${item.title}${item.composer ? ` (${item.composer})` : ""}`}
                        </li>
                      ),
                    )}
                  </ol>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block text-center">
                  Transport per Shinkansen & Shuttlebus
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: Rehearsal Notes with Instrument Selector */}
      {subTab === "rehearsals" && (
        <div className="space-y-5">
          {/* Controls: Instrument Filter Pills & Search */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
                  Probennotizen des Dirigenten
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Nach Instrumenten & Takten gefiltert
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Stück oder Takt suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Instrument selector pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {instrumentsList.map((inst) => (
                <button
                  key={inst}
                  onClick={() => setSelectedInstrument(inst)}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    selectedInstrument === inst
                      ? "bg-rose-600 text-white font-semibold shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300">
                      {note.target_instruments?.join(", ") ||
                        (note as unknown as { instrument?: string }).instrument ||
                        "Alle"}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {note.title ? `${note.title} · ` : ""}
                      {note.pieces || (note as unknown as { piece?: string }).piece}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {note.bars || (note as unknown as { measure?: string }).measure}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {note.notes || (note as unknown as { note?: string }).note}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dirigentenpult BOH</span>
                  <span>{note.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Program Pieces Details */}
      {subTab === "pieces" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pieces.map((piece, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                      Werk #{idx + 1} &middot; {piece.duration}
                    </span>
                    <h4 className="text-base font-bold font-display text-slate-900 dark:text-white mt-0.5">
                      {piece.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{piece.composer}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Satzfolge / Tempo:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {piece.tempo}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {piece.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
