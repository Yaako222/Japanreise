import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Mail,
  Send,
  Sparkles,
  MessageSquare,
  Search,
  Plus,
} from "lucide-react";
import { useApp } from "../context/useApp";

export const StaffDashboard: React.FC = () => {
  const {
    outingRequests,
    updateOutingStatus,
    participants,
    duties,
    toggleDutyComplete,
    addDuty,
    parentMessages,
    answerParentMessage,
    sendAnnouncement,
    dailyReports,
    toggleCheckinOut,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "outings" | "checklist" | "duties" | "mailbox" | "reports"
  >("outings");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // New announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annAudience, setAnnAudience] = useState<"all" | "musicians" | "parents" | "staff">("all");
  const [annPriority, setAnnPriority] = useState<"normal" | "high">("normal");
  const [annSentFeedback, setAnnSentFeedback] = useState(false);

  // New duty form
  const [dutyDate, setDutyDate] = useState("Morgen (Tag 4)");
  const [dutyType, setDutyType] = useState<"lunch" | "cleaning" | "instrument_transport">("lunch");
  const [dutyPeople, setDutyPeople] = useState("");
  const [dutyNotes, setDutyNotes] = useState("");

  // Mailbox answer
  const [answeringMsgId, setAnsweringMsgId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  // Participant search
  const [searchQuery, setSearchQuery] = useState("");

  const pendingOutings = outingRequests.filter((o) => o.status === "pending");
  const activeOutings = outingRequests.filter((o) => o.status === "approved");

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) return;
    updateOutingStatus(id, "rejected", rejectReason);
    setRejectId(null);
    setRejectReason("");
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;
    sendAnnouncement({
      title: annTitle,
      body: annBody,
      priority: annPriority,
      target_audience: annAudience,
    });
    setAnnTitle("");
    setAnnBody("");
    setAnnSentFeedback(true);
    setTimeout(() => setAnnSentFeedback(false), 3000);
  };

  const handleAddDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dutyPeople.trim()) return;
    addDuty({
      date: dutyDate,
      duty_type: dutyType,
      assigned_people: dutyPeople.split(",").map((p) => p.trim()),
      notes: dutyNotes,
    });
    setDutyPeople("");
    setDutyNotes("");
  };

  const handleAnswerSubmit = (msgId: string) => {
    if (!answerText.trim()) return;
    answerParentMessage(msgId, answerText);
    setAnsweringMsgId(null);
    setAnswerText("");
  };

  // Group outing history per person (Roadmap item 16: "Abmelde-Historie: nur noch die Liste pro Person")
  const personHistoryMap = new Map<string, number>();
  outingRequests.forEach((req) => {
    req.participant_names.forEach((name) => {
      personHistoryMap.set(name, (personHistoryMap.get(name) || 0) + 1);
    });
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-emerald-950 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Reisebegleitung & Betreuer-Leitstand</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-jp mt-1">Tour-Aufsicht & Betreuung</h2>
          <p className="text-xs text-emerald-200/80">
            Ausgangsfreigabe, Teilnehmer-Checkliste, Elternkontakt & Putzplan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-900/60 rounded-2xl border border-emerald-800 text-center">
            <span className="text-lg font-bold text-white block leading-none">
              {pendingOutings.length}
            </span>
            <span className="text-[10px] text-emerald-300">Offene Anträge</span>
          </div>
          <div className="p-3 bg-emerald-900/60 rounded-2xl border border-emerald-800 text-center">
            <span className="text-lg font-bold text-white block leading-none">
              {activeOutings.length}
            </span>
            <span className="text-[10px] text-emerald-300">Aktuell unterwegs</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("outings")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === "outings"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Ausgang & Abmeldungen ({pendingOutings.length})
        </button>

        <button
          onClick={() => setActiveTab("checklist")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === "checklist"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Teilnehmer & Elterncodes
        </button>

        <button
          onClick={() => setActiveTab("duties")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === "duties"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Putz- & Essensplan
        </button>

        <button
          onClick={() => setActiveTab("mailbox")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === "mailbox"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Elternpost & Ankündigungen
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
            activeTab === "reports"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Tagesberichte ({dailyReports.length})
        </button>
      </div>

      {/* TAB 1: Outings Management */}
      {activeTab === "outings" && (
        <div className="space-y-6">
          {/* Pending Approval Section */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Neu eingegangene Ausgangsanträge ({pendingOutings.length})</span>
            </h3>

            {pendingOutings.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Keine ausstehenden Ausgangsanträge im Moment.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingOutings.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                            Zimmer {req.room_number} &middot; {req.requester_name}
                          </span>
                          <span className="text-[11px] text-slate-500">{req.created_at}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                          Ziel: <strong>{req.destination}</strong> &middot; Geplante Rückkehr:{" "}
                          <strong>{req.planned_return}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Gruppe: {req.participant_names.join(", ")} ({req.participant_names.length}{" "}
                          Personen)
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateOutingStatus(req.id, "approved")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Genehmigen</span>
                        </button>
                        <button
                          onClick={() => setRejectId(req.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Ablehnen</span>
                        </button>
                      </div>
                    </div>

                    {rejectId === req.id && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-300 dark:border-rose-800 space-y-2">
                        <label className="block text-xs font-bold text-rose-700 dark:text-rose-400">
                          Grund der Ablehnung (wird Schülern angezeigt):
                        </label>
                        <input
                          type="text"
                          placeholder="z.B. Nur 2 Personen (mind. 3 erforderlich) / Unmittelbar vor der Probe"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setRejectId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            Abbrechen
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-1 text-xs bg-rose-600 text-white font-semibold rounded-lg"
                          >
                            Ablehnung bestätigen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Abmelde-Historie pro Person (Roadmap item 16) */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Abmelde-Historie pro Person</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gesamte Anzahl an registrierten Ausgängen während der Japan-Tournee
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {participants
                .filter((p) => !p.is_staff)
                .map((p) => {
                  const fullName = `${p.first_name} ${p.last_name}`;
                  const count = personHistoryMap.get(fullName) || 0;
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {fullName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {p.instrument} &middot; Zmr.{" "}
                          {participants.find((r) => r.id === p.id)?.room_id?.replace("r", "20") ||
                            "201"}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {count} {count === 1 ? "Ausgang" : "Ausgänge"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Participant Checklist & Parent Codes (Roadmap items 2, 9, 11) */}
      {activeTab === "checklist" && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Teilnehmendenliste, Instrumente & Elterncodes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flugstatus, Passdaten, Eltern-Telefon und individuelle Eltern-Zugangscodes
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Teilnehmer oder Instrument suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Name & Instrument</th>
                  <th className="py-2.5 px-3">Flug & Sitz</th>
                  <th className="py-2.5 px-3">Elternteil & Tel.</th>
                  <th className="py-2.5 px-3">Elterncode</th>
                  <th className="py-2.5 px-3">Hinflug Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {participants
                  .filter((p) => {
                    const str =
                      `${p.first_name || ""} ${p.last_name || ""} ${p.instrument || ""}`.toLowerCase();
                    const q = (searchQuery || "").toLowerCase();
                    return str.includes(q);
                  })
                  .map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {p.first_name} {p.last_name}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {p.instrument} &middot; {p.age} Jahre
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{p.flight}</td>
                      <td className="py-3 px-3">
                        <span className="text-slate-900 dark:text-white block font-medium">
                          {p.parent_name}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {p.parent_phone}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                          {p.parent_access_code}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleCheckinOut(p.id)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                            p.checkin_out
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {p.checkin_out ? "✓ Eingecheckt" : "Ausstehend"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Duties / Putz- & Essensplan (Roadmap item 8) */}
      {activeTab === "duties" && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Putz- & Essensplan (Reinigung + Mittagessen)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verteilt auf Musikerzimmer und Begleitpersonen
            </p>

            <div className="space-y-3">
              {duties.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {d.duty_type === "lunch"
                          ? "Mittagessen Bento-Dienst"
                          : d.duty_type === "cleaning"
                            ? "Reinigungsdienst"
                            : "Transport"}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {d.date}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Eingeteilt: {d.assigned_people.join(", ")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{d.notes}</p>
                  </div>

                  <button
                    onClick={() => toggleDutyComplete(d.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                      d.completed
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {d.completed ? "✓ Erledigt" : "Offen markieren"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add new duty */}
          <form
            onSubmit={handleAddDuty}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Neuen Dienst einteilen</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Tag / Datum
                </label>
                <input
                  type="text"
                  value={dutyDate}
                  onChange={(e) => setDutyDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Dienst-Art
                </label>
                <select
                  value={dutyType}
                  onChange={(e) =>
                    setDutyType(e.target.value as "lunch" | "cleaning" | "instrument_transport")
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="lunch">Mittagessen Bento</option>
                  <option value="cleaning">Probenraum-Reinigung</option>
                  <option value="instrument_transport">Instrumententransport</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Eingeteilte Personen/Zimmer
                </label>
                <input
                  type="text"
                  placeholder="z.B. Zimmer 201, Herr Klein"
                  value={dutyPeople}
                  onChange={(e) => setDutyPeople(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Aufgaben-Details
              </label>
              <input
                type="text"
                placeholder="z.B. Notenpulte abbauen, Müll trennen nach japanischem Standard"
                value={dutyNotes}
                onChange={(e) => setDutyNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Dienst speichern
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Mailbox & Announcements (Roadmap item 28) */}
      {activeTab === "mailbox" && (
        <div className="space-y-6">
          {/* Create Announcement */}
          <form
            onSubmit={handleSendAnnouncement}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Ankündigung verfassen (pro Zielgruppe)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Zielgruppe
                </label>
                <select
                  value={annAudience}
                  onChange={(e) =>
                    setAnnAudience(e.target.value as "all" | "musicians" | "parents" | "staff")
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="all">Alle (Musiker, Eltern & Begleiter)</option>
                  <option value="musicians">Nur Musiker</option>
                  <option value="parents">Nur Eltern</option>
                  <option value="staff">Nur Begleiter-Team</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Dringlichkeit
                </label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as "normal" | "high")}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="normal">Normal</option>
                  <option value="high">Hoch (Push-Benachrichtigung an alle)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Titel
              </label>
              <input
                type="text"
                placeholder="z.B. Programmänderung für den Nachmittag"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Nachricht
              </label>
              <textarea
                rows={3}
                placeholder="Inhalt der Mitteilung..."
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
            >
              Ankündigung senden
            </button>

            {annSentFeedback && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Ankündigung wurde erfolgreich an die Zielgruppe übermittelt!
              </p>
            )}
          </form>

          {/* Parent Mailbox Messages */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Elternpost: Fragen & Ideen von Eltern ({parentMessages.length})</span>
            </h3>

            <div className="space-y-4">
              {parentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Frage zu {msg.child_name} (Zimmer {msg.room_number})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">
                        Code: {msg.parent_code} &middot; {msg.created_at}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    {msg.body}
                  </p>

                  {msg.answer ? (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <strong className="text-emerald-800 dark:text-emerald-300">
                        Antwort der Reiseleitung ({msg.answered_at}):
                      </strong>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">{msg.answer}</p>
                    </div>
                  ) : answeringMsgId === msg.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Antwort an die Eltern eingeben..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setAnsweringMsgId(null)}
                          className="px-3 py-1 text-xs text-slate-600 rounded-lg hover:bg-slate-200"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={() => handleAnswerSubmit(msg.id)}
                          className="px-3 py-1 text-xs bg-emerald-600 text-white font-semibold rounded-lg"
                        >
                          Antwort senden
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAnsweringMsgId(msg.id);
                        setAnswerText("");
                      }}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Elternfrage beantworten</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Daily Reports (Roadmap item 3) */}
      {activeTab === "reports" && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Abgegebene Tagesberichte der Zimmer</span>
          </h3>

          <div className="space-y-3">
            {dailyReports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Zimmer {rep.room_number} &middot; Tag {rep.day_number} ({rep.date})
                  </span>
                  <span className="text-[11px] text-slate-400">{rep.submitted_at}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>Highlight:</strong> {rep.best_part}
                </p>
                {rep.encounter && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Begegnung:</strong> {rep.encounter}
                  </p>
                )}
                {rep.challenge && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Herausforderung:</strong> {rep.challenge}
                  </p>
                )}
                {rep.three_words && (
                  <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    &bdquo;{rep.three_words}&ldquo;
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
