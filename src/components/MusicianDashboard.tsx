import React, { useState, useEffect } from "react";
import {
  Music,
  Clock,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Bell,
  Users,
  Sparkles,
  CheckCheck,
  Calendar,
} from "lucide-react";
import { useApp } from "../context/useApp";
import { Instrument } from "../types";

const INSTRUMENT_OPTIONS: Instrument[] = [
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
  "Schlagwerk",
];

export const MusicianDashboard: React.FC = () => {
  const {
    currentRoom,
    participants,
    concerts,
    rehearsalNotes,
    announcements,
    duties,
    outingRequests,
    requestOuting,
    markOutingReturned,
    submitDailyReport,
    markAnnouncementAsRead,
    selectedInstrument,
    setSelectedInstrument,
  } = useApp();

  // Outing form state
  const [outingScope, setOutingScope] = useState<"full_room" | "half_room" | "custom">("full_room");
  const [outingDestination, setOutingDestination] = useState("");
  const [outingReturnTime, setOutingReturnTime] = useState("21:30");
  const [customSearchQuery, setCustomSearchQuery] = useState("");
  const [selectedCustomParticipants, setSelectedCustomParticipants] = useState<string[]>([]);
  const [outingSubmittedSuccess, setOutingSubmittedSuccess] = useState(false);

  // Daily report state
  const [reportEncounter, setReportEncounter] = useState("");
  const [reportBestPart, setReportBestPart] = useState("");
  const [reportChallenge, setReportChallenge] = useState("");
  const [reportTomorrow, setReportTomorrow] = useState("");
  const [reportThreeWords, setReportThreeWords] = useState("");
  const [reportSubmittedSuccess, setReportSubmittedSuccess] = useState(false);

  // Roommates for current room
  const roommates = participants.filter((p) => currentRoom && p.room_id === currentRoom.id);

  // Filtered rehearsal notes
  const filteredNotes = rehearsalNotes.filter((n) => {
    if (selectedInstrument === "Alle") return true;
    const targetInsts = n.target_instruments || [];
    return (
      targetInsts.includes("Alle") ||
      targetInsts.includes(selectedInstrument) ||
      targetInsts.some((inst) =>
        (inst || "").toLowerCase().includes((selectedInstrument || "").toLowerCase()),
      )
    );
  });

  // Next concert
  const nextConcert = concerts[0];

  // 3-Minute auto-fade for rejected outing requests (Roadmap item 21)
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const visibleOutingRequests = outingRequests.filter((req) => {
    if (currentRoom && req.room_id !== currentRoom.id) return false;
    if (req.status === "rejected" && req.rejected_at) {
      const elapsedMs = now - new Date(req.rejected_at).getTime();
      return elapsedMs < 3 * 60 * 1000; // 3 minutes
    }
    return true;
  });

  const handleOutingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outingDestination.trim()) return;

    let names: string[] = [];
    if (outingScope === "full_room") {
      names = roommates.map((r) => `${r.first_name} ${r.last_name}`);
      if (names.length === 0) names = ["Zimmer " + (currentRoom?.room_number || "201")];
    } else if (outingScope === "half_room") {
      names = roommates
        .slice(0, Math.ceil(roommates.length / 2))
        .map((r) => `${r.first_name} ${r.last_name}`);
    } else {
      names = selectedCustomParticipants;
    }

    requestOuting({
      room_id: currentRoom?.id || "r1",
      room_number: currentRoom?.room_number || "201",
      requester_name: roommates[0]
        ? `${roommates[0].first_name} ${roommates[0].last_name}`
        : "Zimmer " + (currentRoom?.room_number || "201"),
      scope: outingScope,
      participant_names: names,
      destination: outingDestination,
      planned_return: outingReturnTime,
    });

    setOutingDestination("");
    setSelectedCustomParticipants([]);
    setOutingSubmittedSuccess(true);
    setTimeout(() => setOutingSubmittedSuccess(false), 3000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportBestPart.trim()) return;

    submitDailyReport({
      room_id: currentRoom?.id || "r1",
      room_number: currentRoom?.room_number || "201",
      day_number: 3,
      date: new Date().toISOString().split("T")[0] || "2026-09-20",
      encounter: reportEncounter,
      best_part: reportBestPart,
      challenge: reportChallenge,
      tomorrow: reportTomorrow,
      three_words: reportThreeWords,
      submitted_by: roommates[0]
        ? `${roommates[0].first_name} ${roommates[0].last_name}`
        : `Zimmer ${currentRoom?.room_number}`,
    });

    setReportEncounter("");
    setReportBestPart("");
    setReportChallenge("");
    setReportTomorrow("");
    setReportThreeWords("");
    setReportSubmittedSuccess(true);
    setTimeout(() => setReportSubmittedSuccess(false), 3500);
  };

  const toggleCustomParticipant = (name: string) => {
    if (selectedCustomParticipants.includes(name)) {
      setSelectedCustomParticipants(selectedCustomParticipants.filter((n) => n !== name));
    } else {
      setSelectedCustomParticipants([...selectedCustomParticipants, name]);
    }
  };

  const myDuties = duties.filter(
    (d) =>
      currentRoom &&
      (d.room_number?.includes(currentRoom.room_number) ||
        d.assigned_people.some((p) => p.includes(currentRoom.room_number))),
  );

  return (
    <div className="space-y-6">
      {/* High Priority Announcements Banner */}
      {announcements
        .filter((a) => a.target_audience === "all" || a.target_audience === "musicians")
        .map((ann) => {
          const isRead = currentRoom && ann.read_by_rooms?.includes(currentRoom.room_number);
          return (
            <div
              key={ann.id}
              className={`p-4 rounded-2xl border transition-all ${
                ann.priority === "high"
                  ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900"
                  : "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${ann.priority === "high" ? "bg-rose-500 text-white" : "bg-amber-500 text-white"}`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                        {ann.priority === "high" ? "Wichtige Ankündigung" : "Information"}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        &middot; {ann.created_at}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                      {ann.body}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => markAnnouncementAsRead(ann.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                    isRead
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {isRead ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{isRead ? "Gelesen" : "Gelesen markieren"}</span>
                </button>
              </div>
            </div>
          );
        })}

      {/* Concert Countdown & Top Overview */}
      {nextConcert && (
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                <Music className="w-3.5 h-3.5" />
                <span>Nächstes Konzert</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-jp tracking-tight text-white mt-2">
                {nextConcert.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {nextConcert.hall} ({nextConcert.city})
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  {nextConcert.date} &middot; {nextConcert.time} Uhr
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Anspielprobe: {nextConcert.call_time}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[140px]">
              <span className="block text-[11px] uppercase tracking-wider text-rose-300 font-semibold">
                Dresscode
              </span>
              <span className="text-xs font-medium text-slate-200 block mt-1">
                {nextConcert.dress_code}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Today's Duty banner if assigned */}
      {myDuties.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Heutiger Dienst für dein Zimmer:
            </h4>
          </div>
          {myDuties.map((d) => (
            <div key={d.id} className="text-xs text-amber-900 dark:text-amber-200">
              <strong>
                {d.duty_type === "lunch" ? "Mittagessen Bento-Dienst" : "Reinigungsdienst"}:
              </strong>{" "}
              {d.notes}
            </div>
          ))}
        </div>
      )}

      {/* Grid: Probenhinweise (Filtered by Instrument) & Zimmeransicht */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Probenhinweise */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-rose-500" />
                <span>Probenhinweise</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vom Dirigenten nach Instrumenten gefiltert
              </p>
            </div>
          </div>

          {/* Instrument Filter Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {INSTRUMENT_OPTIONS.map((inst) => (
              <button
                key={inst}
                onClick={() => setSelectedInstrument(inst)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedInstrument === inst
                    ? "bg-rose-600 text-white shadow-sm font-semibold"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {inst}
              </button>
            ))}
          </div>

          {/* List of Notes */}
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Keine spezifischen Probenhinweise für {selectedInstrument}.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {note.pieces}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{note.bars}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{note.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {note.notes}
                  </p>
                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span>Gilt für: {note.target_instruments.join(", ")}</span>
                    <span>{note.created_at}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Zimmeransicht & Mitbewohner (Roadmap item 1: Namen anzeigen, Namenssortierung) */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Mein Zimmer {currentRoom?.room_number || "201"}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentRoom?.hotel_name || "Hotel Keihan Tokyo Yotsuya"} &middot; Etage{" "}
              {currentRoom?.floor || 2}
            </p>
          </div>

          <div className="space-y-2.5">
            {roommates
              .sort((a, b) => a.last_name.localeCompare(b.last_name))
              .map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {p.first_name} {p.last_name}
                    </span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      {p.instrument} &middot; Flug: {p.flight}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {p.phone}
                    </span>
                    {p.note && (
                      <span className="block text-[10px] text-slate-400 italic mt-0.5">
                        {p.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {currentRoom?.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              Zimmer-Hinweis: {currentRoom.notes}
            </p>
          )}
        </div>
      </div>

      {/* Outing Management (Ausgang beantragen & Status) */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Ausgang beantragen (Abmeldung)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Regel: Mindestens zu dritt unterwegs sein & vor 21:30 Uhr zurück im Hotel sein.
          </p>
        </div>

        {/* Active Outing Requests for this room */}
        {visibleOutingRequests.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Aktuelle Ausgangs-Anträge
            </h4>
            {visibleOutingRequests.map((req) => {
              const isApproved = req.status === "approved";
              const isRejected = req.status === "rejected";
              const isReturned = req.status === "returned";
              const isPending = req.status === "pending";

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isApproved
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                      : isRejected
                        ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                        : isReturned
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
                          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            isApproved
                              ? "bg-emerald-600 text-white"
                              : isRejected
                                ? "bg-rose-600 text-white"
                                : isReturned
                                  ? "bg-slate-600 text-white"
                                  : "bg-amber-500 text-white"
                          }`}
                        >
                          {isApproved
                            ? "Genehmigt"
                            : isRejected
                              ? "Abgelehnt"
                              : isReturned
                                ? "Zurückgemeldet"
                                : "Wartet auf Betreuer"}
                        </span>
                        <span className="text-xs text-slate-500">
                          Ziel: <strong>{req.destination}</strong>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Mitglieder: {req.participant_names.join(", ")} &middot; Geplante Rückkehr:{" "}
                        <strong>{req.planned_return}</strong>
                      </p>

                      {isRejected && req.rejection_reason && (
                        <p className="text-xs text-rose-700 dark:text-rose-400 font-medium mt-1">
                          Begründung der Reiseleitung: {req.rejection_reason}
                          <span className="block text-[10px] text-slate-400">
                            (Hinweis: Abgelehnte Anträge bitte nicht sofort neu einreichen, sondern
                            Betreuer ansprechen. Dieser Hinweis verschwindet nach 3 Min.)
                          </span>
                        </p>
                      )}
                    </div>

                    {isApproved && (
                      <button
                        onClick={() => markOutingReturned(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                      >
                        ✓ Zurück im Hotel melden
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Outing Form (Roadmap item 19: Auswahl ganzes/halbes Zimmer oder benutzerdefiniert mit Suche) */}
        <form
          onSubmit={handleOutingSubmit}
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-4"
        >
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Wer geht mit? (Umfang)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOutingScope("full_room")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  outingScope === "full_room"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                Ganzes Zimmer
              </button>
              <button
                type="button"
                onClick={() => setOutingScope("half_room")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  outingScope === "half_room"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                Halbes Zimmer
              </button>
              <button
                type="button"
                onClick={() => setOutingScope("custom")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  outingScope === "custom"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                Benutzerdefiniert
              </button>
            </div>
          </div>

          {/* Custom Search & Multiselect */}
          {outingScope === "custom" && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <input
                type="text"
                placeholder="Musiker nach Name suchen..."
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {participants
                  .filter((p) => !p.is_staff)
                  .filter((p) => {
                    const fullName = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
                    const q = (customSearchQuery || "").toLowerCase();
                    return fullName.includes(q);
                  })
                  .map((p) => {
                    const fullName = `${p.first_name} ${p.last_name}`;
                    const isSelected = selectedCustomParticipants.includes(fullName);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => toggleCustomParticipant(fullName)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-rose-100 text-rose-800 border-rose-400 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {fullName} ({p.instrument})
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Wohin geht es? (Zielort)
              </label>
              <input
                type="text"
                placeholder="z.B. Convenience Store, Shinjuku Park, Ramen-Shop"
                value={outingDestination}
                onChange={(e) => setOutingDestination(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Geplante Rückkehr (Uhrzeit)
              </label>
              <input
                type="time"
                value={outingReturnTime}
                onChange={(e) => setOutingReturnTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ausgangsanfrage an Begleitung senden</span>
          </button>

          {outingSubmittedSuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
              ✓ Ausgangsantrag erfolgreich übermittelt. Bitte auf Bestätigung warten!
            </p>
          )}
        </form>
      </div>

      {/* Daily Report / Tagesbericht eingeben (Roadmap item 4: Tagesbericht-Frage umbenennen) */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Tagesbericht des Zimmers (Abend-Check-in)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Wird für das Reisetagebuch und die sichere Elternansicht gespeichert.
          </p>
        </div>

        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Begegnung des Tages (Mensch, Kultur, Erlebnis)
              </label>
              <textarea
                rows={2}
                placeholder="Wen haben wir heute getroffen oder was hat uns berührt?"
                value={reportEncounter}
                onChange={(e) => setReportEncounter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Highlight des Tages *
              </label>
              <textarea
                rows={2}
                placeholder="Das Schönste oder Lustigste des Tages..."
                value={reportBestPart}
                onChange={(e) => setReportBestPart(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Herausforderung des Tages
              </label>
              <textarea
                rows={2}
                placeholder="Jetlag, Orientierung, Intonation bei der Probe?"
                value={reportChallenge}
                onChange={(e) => setReportChallenge(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Worauf freuen wir uns morgen?
              </label>
              <textarea
                rows={2}
                placeholder="Shinkansen-Fahrt, Schreinbesuch, Konzertsaal?"
                value={reportTomorrow}
                onChange={(e) => setReportTomorrow(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Der heutige Tag in genau 3 Worten
            </label>
            <input
              type="text"
              placeholder="z.B. Atemberaubend, Harmonisch, Köstlich"
              value={reportThreeWords}
              onChange={(e) => setReportThreeWords(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 dark:bg-rose-600 hover:bg-slate-800 dark:hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Tagesbericht abschicken</span>
          </button>

          {reportSubmittedSuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
              ✓ Tagesbericht übermittelt und sicher für Eltern & Reiseleitung freigegeben.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
