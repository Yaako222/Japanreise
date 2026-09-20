import { createFileRoute, Link } from "@tanstack/react-router";
import { RoomOnly } from "@/components/room-only";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MusicianNav } from "@/components/musician-nav";
import { RoomGate } from "@/components/room-gate";
import { Button } from "@/components/ui/button";
import { roomRehearsalNotes, type RehearsalNote } from "@/lib/rehearsal.functions";
import { formatDateShort } from "@/lib/date";
import { getStoredRoomCode, getStoredRoomPin } from "@/lib/room-storage";

export const Route = createFileRoute("/proben")({
  head: () => ({
    meta: [
      { title: "Proben – BOH Japanreise" },
      {
        name: "description",
        content:
          "Woran ihr mit eurem Instrument arbeitet: Stück, Takt und die Anweisung des Dirigenten.",
      },
      { property: "og:title", content: "Proben – BOH Japanreise" },
      {
        property: "og:description",
        content: "Die Probenhinweise des Dirigenten – für euer Instrument.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  component: () => (
    <RoomOnly>
      <RehearsalPage />
    </RoomOnly>
  ),
});

function RehearsalPage() {
  const load = useServerFn(roomRehearsalNotes);
  const [auth, setAuth] = useState<{ code: string; pin: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const code = getStoredRoomCode();
    const pin = getStoredRoomPin();
    if (code && pin) setAuth({ code, pin });
    setChecked(true);
  }, []);

  const q = useQuery({
    queryKey: ["rehearsal", auth?.code],
    queryFn: () => {
      if (!auth) throw new Error("Zimmer-Anmeldung fehlt");
      return load({ data: auth });
    },
    enabled: Boolean(auth),
  });

  if (!checked)
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </div>
    );

  if (!auth)
    return (
      <RoomGate
        title="Proben"
        intro="Dafür braucht ihr euer Zimmer: Zimmernummer eingeben, dann eure PIN."
        onDone={setAuth}
      />
    );

  if (q.isLoading)
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </div>
    );

  if (q.isError)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p>Bitte meldet euch noch einmal mit Zimmernummer und PIN an.</p>
        <Button onClick={() => setAuth(null)}>Zur Anmeldung</Button>
      </div>
    );

  if (!q.data) return null;

  const data = q.data;
  const roomNumber: string = data.roomNumber;
  const instruments: string[] = data.instruments ?? [];
  const notes: RehearsalNote[] = data.notes ?? [];
  const mine = new Set(instruments);
  const visible = showAll
    ? notes
    : notes.filter(
        (n) => n.instruments.length === 0 || n.instruments.some((i) => mine.has(i)),
      );
  const open = visible.filter((n) => !n.done);
  const doneNotes = visible.filter((n) => n.done);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-6 py-10">
      <MusicianNav />

      <div>
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Zimmer {roomNumber}
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight">
          Proben
          <span className="mt-1 block text-lg text-primary">リハーサル</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {instruments.length
            ? `Für euer Zimmer eingetragen: ${instruments.join(", ")}.`
            : "Für euer Zimmer ist noch kein Instrument eingetragen – sagt den Begleitpersonen Bescheid, dann sehen wir alle Hinweise."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={showAll ? "secondary" : "outline"}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Nur unsere Instrumente" : "Alle Instrumente anzeigen"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {open.length} offen
          {doneNotes.length ? ` · ${doneNotes.length} erledigt` : ""}
        </span>
      </div>
      <Button asChild variant="secondary" className="w-full">
        <Link to="/dokumente">Dokumente öffnen</Link>
      </Button>

      {notes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Der Dirigent hat noch nichts eingetragen.
        </p>
      )}
      {notes.length > 0 && visible.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Für euch ist gerade nichts offen. Tippt oben auf „Alle Instrumente anzeigen“, um zu
          sehen, was die anderen proben.
        </p>
      )}

      <section className="space-y-3">
        {open.map((n) => (
          <div key={n.id} className="washi rounded-3xl p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl leading-tight">{n.piece}</h2>
              <p className="text-xs text-muted-foreground">
                {n.date ? formatDateShort(n.date) : "ohne Termin"}
              </p>
            </div>
            {n.measures && (
              <p className="mt-1 font-display text-primary">{n.measures}</p>
            )}
            <p className="mt-3 whitespace-pre-line text-sm">{n.instruction}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {n.instruments.length === 0
                ? "An alle Musiker"
                : `Für: ${n.instruments.join(", ")}`}
            </p>
          </div>
        ))}
      </section>

      {doneNotes.length > 0 && (
        <section className="space-y-2 pt-2">
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Erledigt</p>
          {doneNotes.map((n) => (
            <div key={n.id} className="rounded-2xl border border-border bg-card/40 p-4 opacity-70">
              <p className="font-display text-base line-through">{n.piece}</p>
              {n.measures && <p className="text-xs text-muted-foreground">{n.measures}</p>}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
