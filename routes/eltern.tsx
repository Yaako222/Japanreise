import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookOpen, Check, ChevronLeft, Megaphone, Send, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getParentReports } from "@/lib/parent.functions";
import {
  markParentAnnouncementRead,
  parentDesk,
  sendParentMessage,
  type ParentAnnouncement,
  type ParentMessage,
} from "@/lib/parent-desk.functions";
import { formatDateWeekdayLong, formatDayMonth } from "@/lib/date";
import { DocumentList } from "@/components/document-list";
import { ParentTour } from "@/components/parent-tour";
import { clearParentCode, getStoredParentCode, storeParentCode } from "@/lib/parent-storage";
import { listDocuments } from "@/lib/documents.functions";

export const Route = createFileRoute("/eltern")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Elternbereich – BOH Japanreise" },
      { name: "description", content: "Geschützter Einblick in die Tagesberichte des Zimmers Ihres Kindes." },
      { property: "og:title", content: "Elternbereich – BOH Japanreise" },
      { property: "og:description", content: "Tagesberichte der BOH Japanreise für Eltern." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ParentPage,
});

const moods = ["", "😫", "😕", "😐", "🙂", "🤩"];

function ParentPage() {
  const loadReports = useServerFn(getParentReports);
  const loadDocuments = useServerFn(listDocuments);
  const [savedCode, setSavedCode] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    const code = getStoredParentCode();
    setSavedCode(code);
    setInput(code);
  }, []);

  const query = useQuery({
    queryKey: ["parent-reports", savedCode],
    queryFn: () => loadReports({ data: { code: savedCode } }),
    enabled: savedCode.length >= 6,
    retry: false,
  });
  const documents = useQuery({
    queryKey: ["documents", "parent", savedCode],
    queryFn: () => loadDocuments({ data: { parentCode: savedCode } }),
    enabled: savedCode.length >= 6 && query.data?.ok === true,
    staleTime: 5 * 60_000,
  });

  if (!savedCode || query.data?.ok === false || query.isError) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-12">
        <a href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="size-4" /> Zurück
        </a>
        <BookOpen className="size-8 text-primary" />
        <h1 className="font-display mt-4 text-3xl">Elternbereich</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Mit dem persönlichen Elterncode sehen Sie die abgegebenen Berichte des Zimmers Ihres Kindes.
        </p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const code = input.trim().toUpperCase();
            storeParentCode(code);
            setSavedCode(code);
          }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} placeholder="Elterncode" autoComplete="off" className="h-14 text-center font-mono tracking-widest" />
          {(query.data?.ok === false || query.isError) && <p className="text-sm text-destructive">Dieser Elterncode ist nicht gültig.</p>}
          <Button type="submit" className="h-14 w-full rounded-2xl" disabled={input.trim().length < 6}>Berichte öffnen</Button>
        </form>
      </main>
    );
  }

  if (query.isLoading || !query.data?.ok) return <div className="flex min-h-dvh items-center justify-center text-muted-foreground">Berichte werden geladen …</div>;

  return <ParentHome code={savedCode} data={query.data} documents={documents.data ?? []} documentsLoading={documents.isLoading} onLogout={() => { clearParentCode(); setSavedCode(""); setInput(""); }} />;
}

type ParentData = Extract<Awaited<ReturnType<typeof getParentReports>>, { ok: true }>;

function ParentHome({ code, data, documents, documentsLoading, onLogout }: { code: string; data: ParentData; documents: Awaited<ReturnType<typeof listDocuments>>; documentsLoading: boolean; onLogout: () => void }) {
  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const reports = data.reports;
  const activeReport = reports.find((r) => r.id === selectedReport) ?? null;

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-10">
      <ParentTour code={code} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Elternbereich</p>
          <h1 className="font-display mt-2 text-3xl">{data.childName}s Reise</h1>
          <p className="mt-1 text-sm text-muted-foreground">Zimmer {data.roomNumber}{data.roomNickname ? ` · ${data.roomNickname}` : ""}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>Abmelden</Button>
      </div>

      <div className="mt-6">
        <Link
          to="/eltern-einstellungen"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
        >
          <Settings className="size-3.5" /> Einstellungen
        </Link>
      </div>

      <div className="mt-8 space-y-8">
        <section className="space-y-3">
          <h2 className="font-display text-2xl">Tagesberichte</h2>
          <button
            type="button"
            onClick={() => setReportsOpen((v) => !v)}
            className="washi flex w-full items-center gap-4 rounded-3xl p-5 text-left transition-colors hover:bg-secondary/60"
          >
            <BookOpen className="size-7 shrink-0 text-primary" />
            <span>
              <span className="font-display block text-lg">Tagesberichte ansehen</span>
              <span className="text-sm text-muted-foreground">
                {reports.length ? `${reports.length} ${reports.length === 1 ? "Bericht" : "Berichte"} vom Zimmer ${data.roomNumber}` : "Noch keine Berichte"}
              </span>
            </span>
            <ChevronLeft className={`ml-auto size-5 text-muted-foreground transition-transform ${reportsOpen ? "-rotate-90" : "rotate-180"}`} />
          </button>

          {reportsOpen && reports.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Welchen Bericht möchtet ihr lesen?</p>
              <div className="flex flex-wrap gap-2">
                {reports.map((report, i) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReport(report.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      selectedReport === report.id
                        ? "border-primary bg-primary/20 text-foreground"
                        : "border-border bg-card/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tag {report.dayNumber} · {formatDayMonth(report.date)}
                    {i === 0 ? " · neuester" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {reportsOpen && !reports.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">Das Zimmer hat noch keinen Tagesbericht abgegeben.</p>
          )}

          {activeReport && (
            <article key={activeReport.id} className="washi rounded-3xl p-6">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Tag {activeReport.dayNumber}{activeReport.location ? ` · ${activeReport.location}` : ""}</p>
              <h2 className="font-display mt-2 text-xl">{formatDateWeekdayLong(activeReport.date)}</h2>
              <p className="mt-4 text-3xl">{moods[activeReport.moodStart ?? 0] || "–"} → {moods[activeReport.moodEnd ?? 0] || "–"}</p>
              {activeReport.photoUrls.length > 0 && (
                <div className={`mt-5 grid gap-2 ${activeReport.photoUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {activeReport.photoUrls.map((url, i) => (
                    <img
                      key={url}
                      src={url}
                      alt={`Foto ${i + 1} von Tag ${activeReport.dayNumber}`}
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
              <div className="mt-5 space-y-4 text-sm leading-relaxed">
                {activeReport.activities.length > 0 && <ReportPart title="Heute besonders">{activeReport.activities.join(" · ")}</ReportPart>}
                {activeReport.mainMemory && <ReportPart title="Der Moment">„{activeReport.mainMemory}“</ReportPart>}
                {activeReport.mainMemoryWhy && <ReportPart title="Warum">„{activeReport.mainMemoryWhy}“</ReportPart>}
                {activeReport.cultureText && <ReportPart title="Japan hat überrascht">„{activeReport.cultureText}“</ReportPart>}
                {activeReport.encounterText && <ReportPart title="Begegnung">„{activeReport.encounterText}“</ReportPart>}
                {activeReport.bestPart && <ReportPart title="Bester Teil">{activeReport.bestPart}</ReportPart>}
                {activeReport.challengeText && <ReportPart title="Schwierig war">„{activeReport.challengeText}“</ReportPart>}
                {activeReport.tomorrow && <ReportPart title="Morgen">{activeReport.tomorrow}</ReportPart>}
                {activeReport.threeWords.length > 0 && <ReportPart title="Drei Wörter">{activeReport.threeWords.join(" · ").toUpperCase()}</ReportPart>}
                {activeReport.creativeText && <ReportPart title="Erinnerung">„{activeReport.creativeText}“</ReportPart>}
              </div>
            </article>
          )}
        </section>

        <ParentDesk code={code} />

        <section className="space-y-3">
          <h2 className="font-display text-xl">Dokumente</h2>
          <DocumentList docs={documents} loading={documentsLoading} empty="Noch keine Dokumente bereitgestellt." />
        </section>
      </div>
    </main>
  );
}

function ReportPart({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="text-xs tracking-widest text-muted-foreground uppercase">{title}</h3><div className="mt-1">{children}</div></section>;
}

/** Ankündigungen für Eltern und der direkte Draht zur Reiseleitung. */
function ParentDesk({ code }: { code: string }) {
  const load = useServerFn(parentDesk);
  const markRead = useServerFn(markParentAnnouncementRead);
  const send = useServerFn(sendParentMessage);
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<"feedback" | "frage">("feedback");
  const [text, setText] = useState("");

  const q = useQuery({
    queryKey: ["parent-desk", code],
    queryFn: () => load({ data: { code } }),
    enabled: code.length >= 6,
    refetchInterval: 120_000,
  });

  const read = useMutation({
    mutationFn: (announcementId: string) => markRead({ data: { code, announcementId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parent-desk", code] }),
  });

  const post = useMutation({
    mutationFn: () => send({ data: { code, kind, body: text.trim() } }),
    onSuccess: () => {
      toast.success("Danke! Ihre Nachricht ist bei der Reiseleitung angekommen.");
      setText("");
      queryClient.invalidateQueries({ queryKey: ["parent-desk", code] });
    },
    onError: () => toast.error("Konnte nicht gesendet werden."),
  });

  const announcements: ParentAnnouncement[] = q.data?.announcements ?? [];
  const messages: ParentMessage[] = q.data?.messages ?? [];

  return (
    <>
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Kommunikation</h2>
        <p className="text-sm text-muted-foreground">Ankündigungen der Reiseleitung und des Dirigenten.</p>
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">Aktuell gibt es keine Ankündigungen.</p>
        )}
        {announcements.map((a) =>
          a.read ? (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5"
            >
              <Check className="size-3 shrink-0 text-primary" />
              <p className="truncate text-xs text-muted-foreground">{a.title}</p>
              <span className="ml-auto shrink-0 text-[10px] tracking-wide text-muted-foreground uppercase">
                gelesen
              </span>
            </div>
          ) : (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 ${
                a.level === "wichtig" ? "border-primary bg-primary/15" : "border-border bg-card/60"
              }`}
            >
              <p className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
                <Megaphone className="size-3.5" />
                {a.level === "wichtig" ? "Wichtig" : "Ankündigung"} · {formatDayMonth(a.createdAt)}
              </p>
              <p className="font-display mt-1.5 text-base">{a.title}</p>
              {a.body && (
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {a.body}
                </p>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 rounded-full"
                disabled={read.isPending}
                onClick={() => read.mutate(a.id)}
              >
                Gelesen ✓
              </Button>
            </div>
          ),
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Feedback & Ideen zur App</h2>
        <p className="text-sm text-muted-foreground">
          Ideen, Anregungen oder Fehler zur App – oder eine Frage an Takashi und die Reiseleitung. Die
          Antwort erscheint hier unten.
        </p>
        <div className="flex gap-2">
          {(["feedback", "frage"] as const).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={kind === k ? "default" : "secondary"}
              onClick={() => setKind(k)}
            >
              {k === "feedback" ? "Idee zur App" : "Frage an die Reiseleitung"}
            </Button>
          ))}
        </div>
        <Textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            kind === "feedback"
              ? "Was würde Ihnen in der App helfen?"
              : "Ihre Frage an Takashi und die Reiseleitung …"
          }
        />
        <Button
          className="w-full rounded-2xl"
          disabled={text.trim().length < 3 || post.isPending}
          onClick={() => post.mutate()}
        >
          <Send className="size-4" /> Absenden
        </Button>

        {messages.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-xs text-muted-foreground">
              {m.kind === "frage" ? "Frage" : "Idee"} · {formatDayMonth(m.createdAt)}
            </p>
            <p className="mt-1 text-sm whitespace-pre-line">{m.body}</p>
            {m.answer ? (
              <p className="mt-3 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm whitespace-pre-line">
                Antwort der Reiseleitung: {m.answer}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Noch keine Antwort.</p>
            )}
          </div>
        ))}
      </section>
    </>
  );
}