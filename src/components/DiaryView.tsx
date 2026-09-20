import React, { useState } from "react";
import {
  BookHeart,
  Sparkles,
  Send,
  Smile,
  Calendar,
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  Heart,
  MessageSquareQuote,
  Flame,
  Award,
} from "lucide-react";
import { useApp } from "../context/useApp";

export interface DiaryEntry {
  id: string;
  dayNumber: number;
  date: string;
  location: string;
  roomNumber: string;
  authorName: string;
  mood: "🤩" | "🙂" | "😐" | "😕" | "😫";
  highlight: string;
  story: string;
  likes: number;
  submittedAt: string;
}

const INITIAL_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "d1",
    dayNumber: 3,
    date: "20. Sept. 2026",
    location: "Tokyo · Suntory Hall & Akihabara",
    roomNumber: "201",
    authorName: "Lukas & Felix (Trompete)",
    mood: "🤩",
    highlight: "Die unglaubliche Akustik in der Suntory Hall beim Fortissimo im Schlusssatz!",
    story:
      "Nach der ersten Anspielprobe waren wir noch alle geflasht. Vor dem Saal haben uns japanische Musikstudenten mit Gastgeschenken begrüßt. Danach in Akihabara die buntesten Straßen der Welt erkundet und echtes Tonkotsu-Ramen geschlürft.",
    likes: 24,
    submittedAt: "Vor 1 Stunde",
  },
  {
    id: "d2",
    dayNumber: 3,
    date: "20. Sept. 2026",
    location: "Tokyo · Asakusa Senso-ji",
    roomNumber: "305",
    authorName: "Elena, Sarah & Mia (Flöte / Oboe)",
    mood: "🤩",
    highlight:
      "Der Moment, als wir am Senso-ji Schrein ein traditionelles Taiko-Ensemble getroffen haben.",
    story:
      "Die Mönche und Besucher waren so freundlich, als sie erfuhren, dass wir ein deutsches Orchester auf Tournee sind. Wir haben Matcha-Eis probiert und Glückszettel (Omikuji) gezogen – Bestes Glück (Daikichi) für unser Konzert morgen!",
    likes: 19,
    submittedAt: "Vor 2 Stunden",
  },
  {
    id: "d3",
    dayNumber: 2,
    date: "19. Sept. 2026",
    location: "Tokyo · Prince Hotel & Shibuya",
    roomNumber: "104",
    authorName: "Jonas & David (Posaune / Tuba)",
    mood: "🙂",
    highlight: "Shibuya Crossing bei Nacht – pure Energie!",
    story:
      "Trotz Jetlag nach dem 13-Stunden-Flug haben wir als 3er-Gruppe die Shibuya-Kreuzung überquert. Die Disziplin der Japaner ist faszinierend: Selbst bei tausenden Menschen rempelt niemand.",
    likes: 15,
    submittedAt: "Gestern",
  },
];

export const DiaryView: React.FC = () => {
  const { currentRoom, role } = useApp();
  const [entries, setEntries] = useState<DiaryEntry[]>(INITIAL_DIARY_ENTRIES);
  const [activeDay, setActiveDay] = useState<number>(3);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Form state
  const [selectedMood, setSelectedMood] = useState<"🤩" | "🙂" | "😐" | "😕" | "😫">("🤩");
  const [highlightText, setHighlightText] = useState("");
  const [storyText, setStoryText] = useState("");
  const [authorName, setAuthorName] = useState(
    currentRoom ? `Zimmer ${currentRoom.room_number}` : "BOH Musiker",
  );
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);

  const moods: Array<{ emoji: "🤩" | "🙂" | "😐" | "😕" | "😫"; label: string; desc: string }> = [
    { emoji: "🤩", label: "Großartig", desc: "Unvergesslicher Tag!" },
    { emoji: "🙂", label: "Gut", desc: "Schöne Erlebnisse" },
    { emoji: "😐", label: "Geht so", desc: "Etwas müde / Jetlag" },
    { emoji: "😕", label: "Anstrengend", desc: "Lange Wege / Proben" },
    { emoji: "😫", label: "Erschöpft", desc: "Brauche Schlaf" },
  ];

  const handleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const isLiked = likedMap[id];
          return { ...e, likes: isLiked ? e.likes - 1 : e.likes + 1 };
        }
        return e;
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightText.trim()) return;

    const newEntry: DiaryEntry = {
      id: `d_${Date.now()}`,
      dayNumber: activeDay,
      date: "Heute",
      location: "Tokyo · Konzertreise",
      roomNumber: currentRoom?.room_number || "Gast",
      authorName: authorName.trim() || "Musiker",
      mood: selectedMood,
      highlight: highlightText.trim(),
      story: storyText.trim() || "Keine weiteren Notizen",
      likes: 1,
      submittedAt: "Gerade eben",
    };

    setEntries([newEntry, ...entries]);
    setHighlightText("");
    setStoryText("");
    setIsSubmittedToday(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - BOH Japanreise Tagebuch */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 text-white shadow-xl relative overflow-hidden">
        {/* Japanese Watermark Accent */}
        <div className="absolute right-4 -bottom-6 text-9xl font-bold font-display text-white/[0.04] pointer-events-none select-none">
          日記
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Kulturaustausch & Orchester-Chronik</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
            Unser Tagebuch
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed font-light">
            Stimmung, Erlebnisse und der eine Moment, den wir nicht vergessen wollen. Jeden Abend
            festgehalten von den Musikern des BOH Blasorchesters.
          </p>

          {/* Quick Tour Timeline Days */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeDay === day
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105"
                    : "bg-white/10 text-slate-300 hover:bg-white/15"
                }`}
              >
                Tag {day}
                {day === 3 && " (Heute)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Role-Tailored Panel */}
        <div className="lg:col-span-5 space-y-6">
          {role === "musician" ? (
            /* MUSICIAN FORM */
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BookHeart className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tageseintrag verfassen · Tag {activeDay}
                  </h3>
                </div>
                {currentRoom && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold">
                    Zimmer {currentRoom.room_number}
                  </span>
                )}
              </div>

              {isSubmittedToday ? (
                <div className="mt-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Tageseintrag eingereicht!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Vielen Dank! Dein Highlight wurde im gemeinsamen Tagebuch festgehalten.
                  </p>
                  <button
                    onClick={() => setIsSubmittedToday(false)}
                    className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 underline pt-2"
                  >
                    Weiteren Eintrag hinzufügen
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* 1. Mood Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                      Wie war eure Stimmung heute?
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {moods.map((m) => (
                        <button
                          type="button"
                          key={m.emoji}
                          onClick={() => setSelectedMood(m.emoji)}
                          className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                            selectedMood === m.emoji
                              ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 scale-105 shadow-sm"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="text-2xl leading-none">{m.emoji}</span>
                          <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                            {m.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Highlight text */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Der eine Moment, den wir nicht vergessen wollen:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={highlightText}
                      onChange={(e) => setHighlightText(e.target.value)}
                      placeholder="z.B. Der tosender Applaus in der Suntory Hall oder die Aussicht vom Tokyo Skytree..."
                      className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* 3. Detailed story */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Geschichte / Anekdote des Tages:
                    </label>
                    <textarea
                      rows={3}
                      value={storyText}
                      onChange={(e) => setStoryText(e.target.value)}
                      placeholder="Was ist euch passiert? Welches japanische Essen hat geschmeckt? Besondere Begegnungen..."
                      className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* 4. Author Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Name / Zimmer-Angabe:
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="z.B. Jonas & Max (Zimmer 204)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Im Tagebuch verewigen</span>
                  </button>
                </form>
              )}
            </div>
          ) : role === "staff" ? (
            /* STAFF TOUR MANAGEMENT PANEL */
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Reiseleitungs-Chronik · Tag {activeDay}
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Begleiter-Modus
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Aktueller Stand der Tagesberichte:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Bisher wurden {entries.length} Berichte aus verschiedenen Zimmern eingereicht.
                  Alle Beiträge wurden automatisch für das Tagebuch und das geschützte Eltern-Portal freigeschaltet.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Offizielle Notiz der Reiseleitung hinzufügen:
                </label>
                <textarea
                  rows={2}
                  required
                  value={highlightText}
                  onChange={(e) => setHighlightText(e.target.value)}
                  placeholder="z.B. Alle Ensembles pünktlich an der Suntory Hall eingetroffen..."
                  className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Als Reiseleitung veröffentlichen
                </button>
              </form>
            </div>
          ) : role === "conductor" ? (
            /* CONDUCTOR OVERVIEW PANEL */
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Maestro-Tagebuch · Tag {activeDay}
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  Dirigent
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200 space-y-2">
                <h4 className="font-bold">Musikalische Eindrücke & Feedback</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Hier lesen Sie die ungefilterten Eindrücke der Musiker nach den Proben und Ausflügen.
                  Nutzen Sie die Stimmungen, um Schwerpunkte für die morgige Probe anzusetzen.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block">Konzert-Fokus:</span>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Suntory Hall Tokyo &middot; 1. Aufführung
                </p>
                <p className="text-[11px] text-slate-500">
                  Philip Sparke "The Sunken Village" &amp; Gustav Holst Suite in Es.
                </p>
              </div>
            </div>
          ) : (
            /* PARENT OVERVIEW PANEL */
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tagebuch für Eltern · Tag {activeDay}
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Eltern-Blick
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <h4 className="font-bold">Grüße aus Tokyo an alle Eltern!</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Auf dieser Seite können Sie die täglichen Erlebnisse, Proben und Ausflüge aller Reisegruppen
                  mitverfolgen. Alle Teilnehmer sind wohlauf und voller Vorfreude auf die anstehenden Konzerte.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200">
                  <span>Wetter in Tokyo:</span>
                  <span className="font-mono">24°C, sonnig</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Orchester-Status:</span>
                  <span className="text-emerald-600 font-bold">Vollzählig & aktiv</span>
                </div>
              </div>
            </div>
          )}

          {/* Daily Quick Stats Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Orchester-Stimmungsbarometer
              </span>
              <span className="text-xs font-bold text-rose-600">Tag {activeDay}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                94%
              </div>
              <div className="text-xs text-slate-500">
                <span className="text-emerald-600 font-bold">Hervorragende Stimmung</span> im
                Orchester. Keine Ausfälle.
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
              <div className="bg-emerald-500 h-2.5 w-[75%]" title="75% Großartig" />
              <div className="bg-blue-400 h-2.5 w-[19%]" title="19% Gut" />
              <div className="bg-amber-400 h-2.5 w-[6%]" title="6% Geht so" />
            </div>
          </div>
        </div>

        {/* Right Column: Diary Entries Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4 text-rose-600" />
              <span>Erinnerungen & Highlights ({entries.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Chronologisch sortiert</span>
          </div>

          <div className="space-y-4">
            {entries.map((entry) => {
              const isLiked = likedMap[entry.id];
              return (
                <article
                  key={entry.id}
                  className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3 relative group"
                >
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                        {entry.mood}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {entry.authorName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>{entry.location}</span>
                          </span>
                          <span>&middot;</span>
                          <span>{entry.submittedAt}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Tag {entry.dayNumber}
                    </span>
                  </div>

                  {/* Highlight Callout */}
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                    <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>Der eine unvergessliche Moment</span>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100 italic">
                      "{entry.highlight}"
                    </p>
                  </div>

                  {/* Story Text */}
                  {entry.story && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {entry.story}
                    </p>
                  )}

                  {/* Bottom Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span>BOH Tournee-Archiv 2026</span>
                    </div>

                    <button
                      onClick={() => handleLike(entry.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all text-xs font-semibold ${
                        isLiked
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-600 text-rose-600" : ""}`}
                      />
                      <span>{entry.likes}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
