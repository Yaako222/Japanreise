import React, { useState } from "react";
import {
  Footprints,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  Search,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Info,
  Phone,
  Filter,
} from "lucide-react";
import { useApp } from "../context/useApp";

export const OutingView: React.FC = () => {
  const {
    role,
    currentRoom,
    outingRequests,
    requestOuting,
    updateOutingStatus,
    markOutingReturned,
    participants,
  } = useApp();

  // Musician Form states
  const [destination, setDestination] = useState("");
  const [returnTime, setReturnTime] = useState("21:00");
  const [selectionMode, setSelectionMode] = useState<"full_room" | "half_room" | "custom">(
    "full_room",
  );
  const [selectedCustomIds, setSelectedCustomIds] = useState<string[]>([]);
  const [customSearchQuery, setCustomSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Staff Management filter state
  const [staffFilter, setStaffFilter] = useState<"all" | "pending" | "approved" | "returned">(
    "all",
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Curfew / Nachtruhe beachten oder zu spät.");

  const myRequests = outingRequests.filter((req) => {
    if (!currentRoom) return true;
    return req.room_id === currentRoom.id;
  });

  const handleCustomToggle = (id: string) => {
    if (selectedCustomIds.includes(id)) {
      setSelectedCustomIds(selectedCustomIds.filter((i) => i !== id));
    } else {
      setSelectedCustomIds([...selectedCustomIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom || !destination.trim()) return;

    let groupMembers: string[] = [];

    if (selectionMode === "full_room") {
      groupMembers = participants
        .filter((p) => p.room_id === currentRoom.id)
        .map((p) => `${p.first_name} ${p.last_name}`);
    } else if (selectionMode === "half_room") {
      const roomMates = participants.filter((p) => p.room_id === currentRoom.id);
      groupMembers = roomMates
        .slice(0, Math.ceil(roomMates.length / 2))
        .map((p) => `${p.first_name} ${p.last_name}`);
    } else {
      groupMembers = participants
        .filter((p) => selectedCustomIds.includes(p.id))
        .map((p) => `${p.first_name} ${p.last_name}`);
    }

    if (groupMembers.length < 3) {
      alert("Sicherheitsregel: Ausgang in Japan ist nur ab mindestens 3 Personen gestattet!");
      return;
    }

    requestOuting({
      room_id: currentRoom.id,
      room_number: currentRoom.room_number,
      requester_name: `Zimmer ${currentRoom.room_number}`,
      scope: selectionMode,
      participant_names: groupMembers,
      destination: destination.trim(),
      planned_return: returnTime,
    });

    setDestination("");
    setSelectedCustomIds([]);
    setSuccessMessage("Ausgangsantrag erfolgreich an das Betreuer-Team übermittelt!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Staff quick counts
  const pendingCount = outingRequests.filter((r) => r.status === "pending").length;
  const approvedCount = outingRequests.filter((r) => r.status === "approved").length;
  const returnedCount = outingRequests.filter((r) => r.status === "returned").length;

  const filteredStaffRequests = outingRequests.filter((req) => {
    if (staffFilter === "all") return true;
    return req.status === staffFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner - adapting to role */}
      <div
        className={`p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden ${
          role === "staff"
            ? "bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-emerald-900/60"
            : "bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 border border-rose-900/60"
        }`}
      >
        <div className="absolute right-4 -bottom-6 text-9xl font-bold font-display text-white/[0.04] pointer-events-none select-none">
          出
        </div>

        <div className="relative z-10 max-w-2xl">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 ${
              role === "staff"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>
              {role === "staff" ? "Betreuer-Zentrale · Ausgangs-Monitor" : "Freizeit & Sicherheit"}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
            {role === "staff"
              ? "Ausgangs-Freigaben & Live-Monitor"
              : "Ausgang & Abmeldung (Musiker)"}
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {role === "staff"
              ? "Übersicht aller Ausgangsanträge des BOH-Orchesters. Bitte prüfen Sie vor Genehmigung die 3er-Gruppen-Regel und die geplante Rückkehrzeit (Nachtruhe 22:00 Uhr)."
              : "Abmeldung für freie Zeit in Tokyo und Kyoto. Bitte beachtet stets die 3er-Gruppen-Regel und die vereinbarte Rückkehrzeit."}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. STAFF VIEW: Dedicated Live Monitoring & Approvals     */}
      {/* ======================================================== */}
      {role === "staff" ? (
        <div className="space-y-6">
          {/* Top Quick Stats Grid for Staff */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setStaffFilter("pending")}
              className={`p-4 rounded-3xl border text-left transition-all ${
                staffFilter === "pending"
                  ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Offen zur Prüfung
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {pendingCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Warten auf Bestätigung
              </p>
            </button>

            <button
              onClick={() => setStaffFilter("approved")}
              className={`p-4 rounded-3xl border text-left transition-all ${
                staffFilter === "approved"
                  ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Aktuell unterwegs
                </span>
                <Footprints className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {approvedCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Genehmigt in der Stadt
              </p>
            </button>

            <button
              onClick={() => setStaffFilter("returned")}
              className={`p-4 rounded-3xl border text-left transition-all ${
                staffFilter === "returned"
                  ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Sicher zurück
                </span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {returnedCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Im Hotel zurückgemeldet
              </p>
            </button>

            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Curfew / Nachtruhe
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">22:00</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Alle zurück im Zimmer</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStaffFilter("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  staffFilter === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Alle Anträge ({outingRequests.length})
              </button>
              <button
                onClick={() => setStaffFilter("pending")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  staffFilter === "pending"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Offen zur Prüfung ({pendingCount})
              </button>
              <button
                onClick={() => setStaffFilter("approved")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  staffFilter === "approved"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Aktuell unterwegs ({approvedCount})
              </button>
              <button
                onClick={() => setStaffFilter("returned")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  staffFilter === "returned"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Zurück im Hotel ({returnedCount})
              </button>
            </div>
          </div>

          {/* List of Requests for Staff */}
          <div className="space-y-4">
            {filteredStaffRequests.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Keine Anträge in dieser Ansicht
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sobald Musiker einen Ausgang anmelden, erscheinen die Anträge hier mit Optionen
                  zur Genehmigung oder Ablehnung.
                </p>
              </div>
            ) : (
              filteredStaffRequests.map((req) => {
                const isPending = req.status === "pending";
                const isApproved = req.status === "approved";
                const isRejected = req.status === "rejected";
                const isReturned = req.status === "returned";
                const membersList =
                  req.participant_names ||
                  (req as unknown as { members?: string[] }).members ||
                  [];

                return (
                  <div
                    key={req.id}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 ${
                      isPending
                        ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-sm"
                        : isApproved
                          ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm"
                          : isRejected
                            ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 opacity-75"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-xl bg-slate-900 text-white">
                            Zimmer {req.room_number}
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {req.destination}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Geplante Rückkehr:{" "}
                              <strong className="text-slate-800 dark:text-slate-200">
                                {req.planned_return || "--:--"}
                              </strong>
                            </span>
                          </span>
                          <span>&middot;</span>
                          <span>Eingereicht: {req.created_at}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border self-start sm:self-center ${
                          isPending
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : isApproved
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse"
                              : isRejected
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                        }`}
                      >
                        {isPending
                          ? "Ausstehend"
                          : isApproved
                            ? "Genehmigt / Unterwegs"
                            : isRejected
                              ? "Abgelehnt"
                              : "Im Hotel zurück"}
                      </span>
                    </div>

                    {/* Group Members (Verifying 3+ rule) */}
                    <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Gruppe ({membersList.length} Personen):
                        </span>
                        {membersList.length >= 3 ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            3er-Regel erfüllt
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Unter 3 Personen!
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {membersList.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rejection notice if rejected */}
                    {isRejected && (
                      <div className="p-3 rounded-2xl bg-rose-100/60 dark:bg-rose-950/60 border border-rose-300 text-xs text-rose-800 dark:text-rose-200">
                        <strong>Begründung der Ablehnung:</strong> {req.rejection_reason || "Regeln nicht erfüllt."}
                      </div>
                    )}

                    {/* STAFF ACTION BUTTONS */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => updateOutingStatus(req.id, "approved")}
                            className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>Ausgang freigeben</span>
                          </button>

                          {rejectingId === req.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Grund für Ablehnung..."
                                className="flex-1 text-xs py-1.5 px-3 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                              <button
                                onClick={() => {
                                  updateOutingStatus(req.id, "rejected", rejectReason);
                                  setRejectingId(null);
                                }}
                                className="py-1.5 px-3 rounded-xl text-xs font-bold bg-rose-600 text-white"
                              >
                                Bestätigen
                              </button>
                              <button
                                onClick={() => setRejectingId(null)}
                                className="py-1.5 px-2 text-xs text-slate-500"
                              >
                                Abbrechen
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRejectingId(req.id)}
                              className="py-2 px-4 rounded-xl text-xs font-bold bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 flex items-center gap-1.5 transition-all"
                            >
                              <X className="w-4 h-4" />
                              <span>Ablehnen</span>
                            </button>
                          )}
                        </>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => markOutingReturned(req.id)}
                          className="py-2 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Rückkehr ins Hotel bestätigen</span>
                        </button>
                      )}

                      {isReturned && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Sicher im Hotel &middot; {req.actual_return || "Erfasst"}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. MUSICIAN VIEW: Registration Form & Personal Status     */
        /* ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-rose-600" />
                  <span>Neuen Ausgang beantragen</span>
                </h3>
                {currentRoom && (
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    Zimmer {currentRoom.room_number}
                  </span>
                )}
              </div>

              {successMessage && (
                <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {!currentRoom ? (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                  <p className="font-semibold">
                    Bitte wähle zuerst dein Zimmer in der Zimmeransicht aus.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* Scope Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Wer geht mit? (Mindestens 3 Personen)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectionMode("full_room")}
                        className={`py-2 px-2 text-xs font-semibold rounded-2xl border transition-all text-center ${
                          selectionMode === "full_room"
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Ganzes Zimmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectionMode("half_room")}
                        className={`py-2 px-2 text-xs font-semibold rounded-2xl border transition-all text-center ${
                          selectionMode === "half_room"
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Teilgruppe
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectionMode("custom")}
                        className={`py-2 px-2 text-xs font-semibold rounded-2xl border transition-all text-center ${
                          selectionMode === "custom"
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Gemischt
                      </button>
                    </div>
                  </div>

                  {/* Custom selection list if chosen */}
                  {selectionMode === "custom" && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Musiker suchen..."
                          value={customSearchQuery}
                          onChange={(e) => setCustomSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-2 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {participants
                          .filter((p) =>
                            `${p.first_name} ${p.last_name}`
                              .toLowerCase()
                              .includes(customSearchQuery.toLowerCase()),
                          )
                          .map((p) => {
                            const isSelected = selectedCustomIds.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleCustomToggle(p.id)}
                                className={`w-full text-left p-1.5 rounded-xl text-xs flex items-center justify-between ${
                                  isSelected
                                    ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-semibold"
                                    : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <span>
                                  {p.first_name} {p.last_name} ({p.instrument})
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-rose-600" />}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Wohin geht es? (Ziel & Zweck)
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="z.B. Shibuya Crossing, Ramen-Restaurant, Konbini..."
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  {/* Return Time */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Geplante Rückkehr (Spätestens 22:00 Uhr)
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="time"
                        required
                        max="22:00"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Safety hint */}
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Sicherheitsregel: Mindestens 3 Personen pro Gruppe. Niemals alleine trennen.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ausgang verbindlich anmelden</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Outing Requests List for Musician's Room */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Footprints className="w-4 h-4 text-rose-600" />
                <span>Meine Ausgangsanträge & Status</span>
              </h3>
              <span className="text-xs text-slate-400">{myRequests.length} Anträge</span>
            </div>

            <div className="space-y-3">
              {myRequests.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <Footprints className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Keine offenen Ausgangsanträge für dieses Zimmer
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sobald ein Ausgang angemeldet wird, erscheint der Genehmigungsstatus der Begleiter hier.
                  </p>
                </div>
              ) : (
                myRequests.map((req) => {
                  const isPending = req.status === "pending";
                  const isApproved = req.status === "approved";
                  const isRejected = req.status === "rejected";
                  const isReturned = req.status === "returned";
                  const membersList =
                    req.participant_names ||
                    (req as unknown as { members?: string[] }).members ||
                    [];

                  return (
                    <div
                      key={req.id}
                      className={`p-5 rounded-3xl border transition-all space-y-3 ${
                        isPending
                          ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900"
                          : isApproved
                            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900"
                            : isRejected
                              ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                              Zimmer {req.room_number}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {req.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Rückkehr: {req.planned_return || "--:--"}</span>
                            </span>
                            <span>&middot;</span>
                            <span>{req.created_at}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            isPending
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : isApproved
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse"
                                : isRejected
                                  ? "bg-rose-100 text-rose-800 border-rose-300"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isPending
                            ? "Ausstehend"
                            : isApproved
                              ? "Genehmigt"
                              : isRejected
                                ? "Abgelehnt"
                                : "Zurück im Hotel"}
                        </span>
                      </div>

                      {/* Group members */}
                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Gruppe ({membersList.length} Personen):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {membersList.map((m, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rejection reason */}
                      {isRejected && (
                        <div className="p-3 rounded-2xl bg-rose-100/60 dark:bg-rose-950/60 border border-rose-300 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                          <div className="flex items-center gap-1 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Grund der Ablehnung:</span>
                          </div>
                          <p>{req.rejection_reason || "Regeln für Ausgangszeit überschritten."}</p>
                          <p className="text-[10px] text-rose-600 italic">
                            Hinweis: Abgelehnte Anträge bitte nicht erneut stellen. Bei Fragen Betreuer ansprechen.
                          </p>
                        </div>
                      )}

                      {/* Action button if approved: Mark Returned */}
                      {isApproved && (
                        <button
                          onClick={() => markOutingReturned(req.id)}
                          className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Wir sind sicher zurück im Hotel</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
