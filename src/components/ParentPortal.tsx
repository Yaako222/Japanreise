import React, { useState } from "react";
import {
  UserCheck,
  Send,
  CheckCheck,
  CheckCircle,
  Bell,
  Sparkles,
  Phone,
  MessageSquare,
  Heart,
  Calendar,
} from "lucide-react";
import { useApp } from "../context/useApp";

export const ParentPortal: React.FC = () => {
  const {
    currentParentCode,
    participants,
    rooms,
    dailyReports,
    announcements,
    markAnnouncementAsRead,
    parentMessages,
    sendParentMessage,
  } = useApp();

  const [questionText, setQuestionText] = useState("");
  const [questionSent, setQuestionSent] = useState(false);

  // Find the child associated with this parent code
  const child = participants.find(
    (p) => p.parent_access_code.toUpperCase() === (currentParentCode || "").toUpperCase(),
  );

  // Find child's room
  const childRoom = rooms.find((r) => r.id === child?.room_id);

  // Filter daily reports for child's room
  const childReports = dailyReports.filter(
    (r) => childRoom && r.room_number === childRoom.room_number,
  );

  // Filter announcements for parents
  const parentAnnouncements = announcements.filter(
    (a) => a.target_audience === "all" || a.target_audience === "parents",
  );

  // Filter questions asked with this parent code
  const myQuestions = parentMessages.filter((m) => m.parent_code === currentParentCode);

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !child) return;

    sendParentMessage({
      parent_code: currentParentCode || "JP-ELT-201A",
      child_name: `${child.first_name} ${child.last_name}`,
      room_number: childRoom?.room_number || "201",
      body: questionText,
    });

    setQuestionText("");
    setQuestionSent(true);
    setTimeout(() => setQuestionSent(false), 3000);
  };

  if (!child) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mx-auto flex items-center justify-center">
          <UserCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Eltern-Zugang erforderlich
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Bitte geben Sie in den Einstellungen oben rechts Ihren persönlichen Eltern-Zugangscode
          (z.B. <code>JP-ELT-201A</code>) ein, um die geschützten Berichte Ihres Kindes einzusehen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child Status Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-900 via-slate-900 to-rose-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-amber-400" />
            <span>Geschütztes Eltern-Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            {child.first_name} {child.last_name}
          </h2>
          <p className="text-xs text-slate-300">
            {child.instrument} &middot; Zimmer {childRoom?.room_number || "201"} (
            {childRoom?.hotel_name})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[120px]">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 block">
              Flug & Transfer
            </span>
            <span className="font-semibold block mt-0.5">{child.flight}</span>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[120px]">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 block">
              Notfall-Leitung
            </span>
            <span className="font-mono font-semibold block mt-0.5">+49 171 4920192</span>
          </div>
        </div>
      </div>

      {/* Announcements with "Read" Confirmation (Roadmap item 27) */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Bell className="w-4 h-4 text-amber-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Wichtige Eltern-Informationen & Reise-Updates
          </h3>
        </div>

        <div className="space-y-3">
          {parentAnnouncements.map((ann) => {
            const isRead = currentParentCode && ann.read_by_parents?.includes(currentParentCode);
            return (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {ann.title}
                    </span>
                    <span className="text-[11px] text-slate-400">&middot; {ann.created_at}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {ann.body}
                  </p>
                </div>

                <button
                  onClick={() => markAnnouncementAsRead(ann.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-colors whitespace-nowrap ${
                    isRead
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
                  }`}
                >
                  {isRead ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{isRead ? "Als gelesen markiert" : "Gelesen bestätigen"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Reports of Child's Room (Roadmap item 3 & 4) */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tagesberichte aus Zimmer {childRoom?.room_number}
            </h3>
            <p className="text-xs text-slate-500">
              Direkte Eindrücke der Jugendlichen aus erster Hand
            </p>
          </div>
        </div>

        {childReports.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Für heute liegt noch kein Zimmerbericht vor. Die Schüler füllen diesen meist vor der
            Nachtruhe aus.
          </p>
        ) : (
          <div className="space-y-4">
            {childReports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Tag {rep.day_number} &middot; {rep.date}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Eingereicht {rep.submitted_at}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      Highlight des Tages:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {rep.best_part}
                    </p>
                  </div>

                  {rep.encounter && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        Besondere Begegnung:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {rep.encounter}
                      </p>
                    </div>
                  )}

                  {rep.tomorrow && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        Worauf freuen wir uns morgen?
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {rep.tomorrow}
                      </p>
                    </div>
                  )}

                  {rep.three_words && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        Der Tag in 3 Worten:
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 text-sm">
                        &bdquo;{rep.three_words}&ldquo;
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ideen und Fragen an die Reiseleitung (Roadmap item 27) */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <MessageSquare className="w-4 h-4 text-amber-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ideen und Fragen an die Reiseleitung
            </h3>
            <p className="text-xs text-slate-500">
              Direkter Draht zum Betreuer-Team. Antworten werden hier angezeigt.
            </p>
          </div>
        </div>

        {/* Existing Q&A */}
        {myQuestions.length > 0 && (
          <div className="space-y-3">
            {myQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Ihre Nachricht</span>
                  <span>{q.created_at}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200">{q.body}</p>

                {q.answer ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl mt-2">
                    <strong className="text-emerald-800 dark:text-emerald-300 block mb-0.5">
                      Antwort der Reiseleitung ({q.answered_at}):
                    </strong>
                    <p className="text-slate-700 dark:text-slate-300">{q.answer}</p>
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-600 font-medium block">
                    ⏳ Antwort der Reiseleitung steht noch aus...
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Question form */}
        <form onSubmit={handleSendQuestion} className="space-y-3">
          <textarea
            rows={3}
            placeholder="Ihre Frage an Frau Wagner oder Dr. Klein (z.B. Allergien, Ankunft, Proben-Besuch)..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <button
            type="submit"
            className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nachricht an Reiseleitung senden</span>
          </button>

          {questionSent && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Frage übermittelt. Das Betreuer-Team antwortet baldmöglichst.
            </p>
          )}
        </form>
      </div>

      {/* Emergency Contacts Card */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-500" />
          <span>Wichtige Tournee-Notfallkontakte vor Ort</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">
              Dr. Thomas Klein (Reiseleitung)
            </span>
            <span className="text-slate-500 font-mono text-[11px] block">
              +49 171 4920192 (auch WhatsApp)
            </span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">
              Japanisches Tournee-Büro (Tokyo)
            </span>
            <span className="text-slate-500 font-mono text-[11px] block">
              +81 3 5555 0192 (Englisch & Japanisch)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
