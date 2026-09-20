import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileText, LogOut, Pencil, Plus, Settings, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { VoiceField } from "@/components/journal/VoiceField";
import {
  conductorNotes,
  deleteRehearsalNote,
  saveRehearsalNote,
  type RehearsalDay,
  type RehearsalNote,
} from "@/lib/rehearsal.functions";
import { verifyConductorCode } from "@/lib/conductor.functions";
import {
  clearConductorCode,
  getStoredConductorCode,
  storeConductorCode,
} from "@/lib/conductor-storage";
import { formatDateShort } from "@/lib/date";

export const Route = createFileRoute("/dirigent")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Probenbereich – BOH Japanreise" },
      {
        name: "description",
        content: "Der Dirigent trägt ein, woran die Musikerinnen und Musiker arbeiten.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConductorPage,
});

function deviceHint() {
  if (typeof window === "undefined") return undefined;
  return (navigator.userAgent || "").slice(0, 160);
}

function ConductorPage() {
  const verify = useServerFn(verifyConductorCode);
  const [state, setState] = useState<"checking" | "out" | "in">("checking");

  useEffect(() => {
    const stored = getStoredConductorCode();
    if (!stored) {
      setState("out");
      return;
    }
    let cancelled = false;
    verify({ data: { code: stored, device: deviceHint() } })
      .then((res) => {
        if (!cancelled) setState(res.ok ? "in" : "out");
      })
      .catch(() => {
        if (!cancelled) setState("out");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "checking")
    return (
      <p className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </p>
    );

  if (state === "out") return <CodeGate onDone={() => setState("in")} />;

  return (
    <Notes
      onSignOut={() => {
        clearConductorCode();
        setState("out");
      }}
    />
  );
}

function CodeGate({ onDone }: { onDone: () => void }) {
  const verify = useServerFn(verifyConductorCode);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await verify({ data: { code, device: deviceHint() } });
      if (!res.ok) {
        toast.error("Dieser Code gehört nicht zum Probenbereich.");
        return;
      }
      storeConductorCode(res.code);
      onDone();
    } catch {
      toast.error("Anmeldung gerade nicht möglich. Bitte nochmal versuchen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 self-start rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="size-3.5" /> Zurück zur Hauptseite
      </Link>
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">BOH Japanreise</p>
      <h1 className="font-display mt-3 text-3xl leading-tight">Probenbereich</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Für den Dirigenten. Hier tragt ihr ein, woran die Musiker arbeiten – die Musiker sehen es
        sofort in ihrer Proben-Übersicht.
      </p>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        <Input
          autoFocus
          autoComplete="off"
          autoCapitalize="characters"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Dirigenten-Code"
          aria-label="Dirigenten-Code"
          className="h-12 rounded-2xl bg-card/70 text-center text-lg tracking-[0.2em] uppercase"
        />
        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={busy || code.trim().length < 3}>
          {busy ? "Prüfe …" : "Weiter"}
        </Button>
      </form>
    </main>
  );
}

type Draft = {
  id: string | null;
  piece: string;
  measures: string;
  instruction: string;
  instruments: string[];
  tripDayId: string | null;
  done: boolean;
};

const emptyDraft: Draft = {
  id: null,
  piece: "",
  measures: "",
  instruction: "",
  instruments: [],
  tripDayId: null,
  done: false,
};

function toDraft(n: RehearsalNote): Draft {
  return {
    id: n.id,
    piece: n.piece,
    measures: n.measures,
    instruction: n.instruction,
    instruments: n.instruments,
    tripDayId: n.tripDayId,
    done: n.done,
  };
}

function Notes({ onSignOut }: { onSignOut: () => void }) {
  const load = useServerFn(conductorNotes);
  const save = useServerFn(saveRehearsalNote);
  const remove = useServerFn(deleteRehearsalNote);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const q = useQuery({ queryKey: ["conductor", "notes"], queryFn: () => load() });
  const notes: RehearsalNote[] = q.data?.notes ?? [];
  const days: RehearsalDay[] = q.data?.days ?? [];
  const instruments: string[] = q.data?.instruments ?? [];
  const pieces = [...new Set(notes.map((n) => n.piece))];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["conductor"] });

  const saveMutation = useMutation({
    mutationFn: (d: Draft) =>
      save({
        data: {
          id: d.id,
          piece: d.piece.trim(),
          measures: d.measures.trim(),
          instruction: d.instruction.trim(),
          instruments: d.instruments,
          tripDayId: d.tripDayId,
          done: d.done,
        },
      }),
    onSuccess: () => {
      toast.success("Hinweis gespeichert.");
      setDraft(null);
      invalidate();
    },
    onError: () => toast.error("Speichern fehlgeschlagen."),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Hinweis gelöscht.");
      invalidate();
    },
    onError: () => toast.error("Löschen fehlgeschlagen."),
  });

  if (q.isLoading)
    return (
      <p className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </p>
    );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Probenbereich</p>
        <Link
          to="/dirigent-dokumente"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
        >
          <FileText className="size-3.5" /> Dokumente
        </Link>
        <Link
          to="/dirigent-einstellungen"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
        >
          <Settings className="size-3.5" /> Einstellungen
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
        >
          <LogOut className="size-3.5" /> Abmelden
        </button>
      </div>

      <div>
        <h1 className="font-display text-3xl leading-tight">
          Probenhinweise
          <span className="mt-1 block text-lg text-primary">リハーサル</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Was soll bis wann geprobt werden? Am schnellsten geht es über das Mikrofon.
        </p>
      </div>

      {!draft && (
        <Button className="h-12 w-full rounded-2xl" onClick={() => setDraft({ ...emptyDraft })}>
          <Plus className="size-4" /> Neuen Hinweis schreiben
        </Button>
      )}

      {draft && (
        <NoteForm
          draft={draft}
          instruments={instruments}
          pieces={pieces}
          days={days}
          saving={saveMutation.isPending}
          onChange={setDraft}
          onSave={() => saveMutation.mutate(draft)}
          onCancel={() => setDraft(null)}
        />
      )}

      <section className="space-y-3">
        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch ist nichts eingetragen.</p>
        )}
        {notes.map((n) => (
          <div key={n.id} className={`rounded-3xl border border-border bg-card/50 p-5 ${n.done ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl leading-tight">{n.piece}</h2>
              <p className="text-xs text-muted-foreground">
                {n.date ? formatDateShort(n.date) : "ohne Termin"}
              </p>
            </div>
            {n.measures && <p className="mt-1 font-display text-primary">{n.measures}</p>}
            {n.instruction && (
              <p className="mt-2 whitespace-pre-line text-sm">{n.instruction}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {n.instruments.length === 0
                ? "An alle Musiker"
                : `Für: ${n.instruments.join(", ")}`}
              {n.done ? " · erledigt" : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={n.done ? "secondary" : "default"}
                onClick={() => saveMutation.mutate({ ...toDraft(n), done: !n.done })}
                disabled={saveMutation.isPending}
              >
                {n.done ? "Wieder offen" : "Erledigt"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDraft(toDraft(n))}>
                <Pencil className="size-4" /> Bearbeiten
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm(`${n.piece} löschen?`)) removeMutation.mutate(n.id);
                }}
                disabled={removeMutation.isPending}
              >
                <Trash2 className="size-4" /> Löschen
              </Button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function NoteForm({
  draft,
  instruments,
  pieces,
  days,
  saving,
  onChange,
  onSave,
  onCancel,
}: {
  draft: Draft;
  instruments: string[];
  pieces: string[];
  days: RehearsalDay[];
  saving: boolean;
  onChange: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [extra, setExtra] = useState("");

  const toggle = (name: string) =>
    onChange({
      ...draft,
      instruments: draft.instruments.includes(name)
        ? draft.instruments.filter((i) => i !== name)
        : [...draft.instruments, name],
    });

  const addExtra = () => {
    const name = extra.trim();
    if (!name) return;
    if (!draft.instruments.includes(name)) toggle(name);
    setExtra("");
  };

  return (
    <form
      className="washi space-y-4 rounded-3xl p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="piece">Stück</Label>
          <Input
            id="piece"
            list="known-pieces"
            value={draft.piece}
            onChange={(e) => onChange({ ...draft, piece: e.target.value })}
            placeholder="z. B. Finlandia"
            className="bg-background/40"
          />
          <datalist id="known-pieces">
            {pieces.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="measures">Stelle</Label>
          <Input
            id="measures"
            value={draft.measures}
            onChange={(e) => onChange({ ...draft, measures: e.target.value })}
            placeholder="z. B. Takt 112–130"
            className="bg-background/40"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="day">Wann geprobt</Label>
        <select
          id="day"
          value={draft.tripDayId ?? ""}
          onChange={(e) => onChange({ ...draft, tripDayId: e.target.value || null })}
          className="w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm"
        >
          <option value="">ohne Termin</option>
          {days.map((d) => (
            <option key={d.id} value={d.id}>
              Tag {d.dayNumber} · {formatDateShort(d.date)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Wer übt das?</Label>
        <p className="text-xs text-muted-foreground">
          Nichts ausgewählt heißt: an alle Musiker. Eigene Eingaben unten ergänzen Instrumente,
          die noch nicht in der Liste stehen.
        </p>
        <div className="flex flex-wrap gap-2">
          {instruments.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                draft.instruments.includes(name)
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-background/40 text-muted-foreground"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addExtra();
              }
            }}
            placeholder="weiteres Instrument …"
            aria-label="Weiteres Instrument"
            className="max-w-56 bg-background/40"
          />
          <Button type="button" variant="secondary" onClick={addExtra}>
            Hinzufügen
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Was genau üben?</Label>
        <VoiceField
          value={draft.instruction}
          onChange={(v) => onChange({ ...draft, instruction: v })}
          placeholder="Erzählt es – wir schreiben es auf."
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={draft.done}
          onCheckedChange={(v) => onChange({ ...draft, done: v === true })}
        />
        Ist erledigt
      </label>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="h-12 flex-1 rounded-2xl"
          disabled={saving || draft.piece.trim().length === 0}
        >
          {draft.id ? "Änderungen speichern" : "Hinweis speichern"}
        </Button>
        <Button type="button" variant="ghost" className="h-12 rounded-2xl" onClick={onCancel}>
          <X className="size-4" /> Abbrechen
        </Button>
      </div>
    </form>
  );
}
