import React, { useState } from "react";
import { BookOpen, Mic, Plus, Trash2, FileText, Music, UploadCloud } from "lucide-react";
import { useApp } from "../context/useApp";
import { Instrument } from "../types";

const ALL_INSTRUMENTS: Instrument[] = [
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

export const ConductorDashboard: React.FC = () => {
  const {
    rehearsalNotes,
    addRehearsalNote,
    deleteRehearsalNote,
    concerts,
    addConcert,
    documents,
    addDocument,
  } = useApp();

  // Note creator state
  const [piece, setPiece] = useState("Brahms Sinfonie Nr. 1");
  const [title, setTitle] = useState("");
  const [bars, setBars] = useState("Takt ");
  const [targetInstruments, setTargetInstruments] = useState<string[]>(["Alle"]);
  const [noteContent, setNoteContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSimulated, setVoiceSimulated] = useState(false);

  // Concert creator state
  const [concertTitle, setConcertTitle] = useState("");
  const [concertHall, setConcertHall] = useState("");
  const [concertCity, setConcertCity] = useState("Tokyo");
  const [concertDate, setConcertDate] = useState("2026-09-26");
  const [concertTime, setConcertTime] = useState("19:00");
  const [concertDress, setConcertDress] = useState("Schwarz festlich");

  // Document creator state
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<"noten" | "reise" | "regeln" | "notfall">("noten");
  const [docDesc, setDocDesc] = useState("");

  const toggleTargetInstrument = (inst: string) => {
    if (inst === "Alle") {
      setTargetInstruments(["Alle"]);
      return;
    }
    const withoutAlle = targetInstruments.filter((i) => i !== "Alle");
    if (withoutAlle.includes(inst)) {
      const filtered = withoutAlle.filter((i) => i !== inst);
      setTargetInstruments(filtered.length === 0 ? ["Alle"] : filtered);
    } else {
      setTargetInstruments([...withoutAlle, inst]);
    }
  };

  // Voice dictation simulation (Roadmap item 10: diktierbare Probenhinweise)
  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setNoteContent((prev) =>
        prev
          ? prev +
            " (Diktat: Intonation im Forte sauber halten, Bläser Atemzeichen nach Takt 4 beachten!)"
          : "Diktat: Bitte die Sechzehntel im 4. Satz sehr spitz artikulieren und auf den Einsatz der Pauke hören.",
      );
      setVoiceSimulated(true);
      setTimeout(() => setVoiceSimulated(false), 3000);
    } else {
      setIsRecording(true);
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !noteContent.trim()) return;

    addRehearsalNote({
      trip_id: "trip-jp-2026",
      title,
      pieces: piece,
      bars,
      target_instruments: targetInstruments,
      notes: noteContent,
    });

    setTitle("");
    setNoteContent("");
    setBars("Takt ");
  };

  const handleSaveConcert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concertTitle.trim()) return;

    addConcert({
      title: concertTitle,
      hall: concertHall,
      city: concertCity,
      date: concertDate,
      time: concertTime,
      call_time: "15:30 Uhr",
      tuning_time: "18:00 Uhr",
      dress_code: concertDress,
      notes: "Eingepflegt durch den Dirigenten",
      pieces: [{ title: piece, composer: "Johannes Brahms", duration: "45 min" }],
    });

    setConcertTitle("");
    setConcertHall("");
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    addDocument({
      title: docTitle,
      category: docCategory,
      description: docDesc,
      file_url: "#",
      target_roles: ["musician", "conductor", "staff"],
    });

    setDocTitle("");
    setDocDesc("");
  };

  return (
    <div className="space-y-6">
      {/* Dirigent Header */}
      <div className="p-6 rounded-3xl bg-purple-950 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Künstlerische Leitung & Dirigat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-jp mt-1">Dirigenten-Pult</h2>
          <p className="text-xs text-purple-200/80">
            Diktierbare Probenhinweise erfassen, Konzertablauf pflegen & Partituren verwalten
          </p>
        </div>
      </div>

      {/* Grid: Create Rehearsal Note & List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Create Note with Voice dictation */}
        <form
          onSubmit={handleSaveNote}
          className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-600" />
                <span>Probenhinweis verfassen</span>
              </h3>
              <p className="text-xs text-slate-500">
                Taktstellen & spezifische Instrumentengruppen
              </p>
            </div>

            {/* Voice Dictation Button (Roadmap item 10) */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 hover:bg-purple-200"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRecording ? "Diktat stoppen..." : "Diktieren"}</span>
            </button>
          </div>

          {voiceSimulated && (
            <p className="text-xs text-purple-600 font-medium bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg">
              ✓ Diktat-Erkennung abgeschlossen und in das Textfeld eingefügt!
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Werk / Stück
              </label>
              <input
                type="text"
                value={piece}
                onChange={(e) => setPiece(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Takt / Ziffer
              </label>
              <input
                type="text"
                value={bars}
                onChange={(e) => setBars(e.target.value)}
                placeholder="z.B. Takt 45-60, Buchstabe B"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Kurztitel
            </label>
            <input
              type="text"
              placeholder="z.B. Übergang zum Adagio, Choral-Intonation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          {/* Instrument Multiselect */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Gilt für Instrumente:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              {ALL_INSTRUMENTS.map((inst) => {
                const active = targetInstruments.includes(inst);
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => toggleTargetInstrument(inst)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      active
                        ? "bg-purple-600 text-white font-semibold"
                        : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {inst}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Anweisung / Probenkommentar
            </label>
            <textarea
              rows={3}
              placeholder="z.B. Piano molto espressivo, Hörner leise stützen, Geigen ohne Bogenakzent..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Probenhinweis veröffentlichen</span>
          </button>
        </form>

        {/* Right: Existing Rehearsal Notes */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Aktive Probenhinweise ({rehearsalNotes.length})</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {rehearsalNotes.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                      {n.pieces} ({n.bars})
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  </div>
                  <button
                    onClick={() => deleteRehearsalNote(n.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Hinweis löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.notes}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700 text-[10px] text-slate-400">
                  <span>Zielgruppe: {n.target_instruments.join(", ")}</span>
                  <span>{n.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Concerts & Documents Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concert Program Editor */}
        <form
          onSubmit={handleSaveConcert}
          className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-600" />
            <span>Konzerttermin & Ablauf ergänzen</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Konzerttitel
              </label>
              <input
                type="text"
                placeholder="z.B. Abschlusskonzert Symphony Hall"
                value={concertTitle}
                onChange={(e) => setConcertTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Konzertsaal
                </label>
                <input
                  type="text"
                  placeholder="z.B. Kyoto Concert Hall"
                  value={concertHall}
                  onChange={(e) => setConcertHall(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Stadt
                </label>
                <input
                  type="text"
                  value={concertCity}
                  onChange={(e) => setConcertCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  value={concertDate}
                  onChange={(e) => setConcertDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Konzertbeginn
                </label>
                <input
                  type="time"
                  value={concertTime}
                  onChange={(e) => setConcertTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Konzert im Tourplan speichern
            </button>
          </div>
        </form>

        {/* Document Linking / Upload Manager (Roadmap item 22) */}
        <form
          onSubmit={handleSaveDocument}
          className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-purple-600" />
            <span>Dokument / Noten verlinken</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Dokumenttitel
              </label>
              <input
                type="text"
                placeholder="z.B. Dvorak Notenstimmen PDF / Saalplan"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Kategorie
              </label>
              <select
                value={docCategory}
                onChange={(e) =>
                  setDocCategory(e.target.value as "noten" | "reise" | "regeln" | "notfall")
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="noten">Noten & Stimmen</option>
                <option value="reise">Reiseplan & Ablauf</option>
                <option value="regeln">Vorschriften & Dresscode</option>
                <option value="notfall">Notfallkarte & Kontakte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Beschreibung
              </label>
              <input
                type="text"
                placeholder="z.B. Enthält Stricharten und Fingersätze"
                value={docDesc}
                onChange={(e) => setDocDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Dokument für Musiker & Begleiter freigeben
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
