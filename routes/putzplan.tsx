import { createFileRoute } from "@tanstack/react-router";
import { RoomOnly } from "@/components/room-only";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MusicianNav } from "@/components/musician-nav";
import { RoomGate } from "@/components/room-gate";
import { Button } from "@/components/ui/button";
import { roomDuties } from "@/lib/duty.functions";
import { formatDateShort } from "@/lib/date";
import { getStoredRoomCode, getStoredRoomPin } from "@/lib/room-storage";

export const Route = createFileRoute("/putzplan")({
  head: () => ({
    meta: [
      { title: "Putz- & Essensplan – BOH Japanreise" },
      {
        name: "description",
        content:
          "Wer putzt welchen Klassenraum und wo gibt es Mittagessen? Der Plan für euer Zimmer an den Schultagen in Inage.",
      },
      { property: "og:title", content: "Putz- & Essensplan – BOH Japanreise" },
      {
        property: "og:description",
        content: "Reinigung und Mittagessen für euer Zimmer – nach Zimmer-Anmeldung sichtbar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  component: () => (
    <RoomOnly>
      <DutyPage />
    </RoomOnly>
  ),
});

function DutyPage() {
  const load = useServerFn(roomDuties);
  const [auth, setAuth] = useState<{ code: string; pin: string } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const code = getStoredRoomCode();
    const pin = getStoredRoomPin();
    if (code && pin) setAuth({ code, pin });
    setChecked(true);
  }, []);

  const q = useQuery({
    queryKey: ["duties", auth?.code],
    queryFn: () => load({ data: auth! }),
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
        title="Putz- & Essensplan"
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

  const data = q.data!;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-6 py-10">
      <MusicianNav />

      <div>
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Zimmer {data.roomNumber}
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight">
          Putz- & Essensplan
          <span className="mt-1 block text-lg text-primary">掃除と昼食</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An den Schultagen in Inage putzt ihr gemeinsam mit einer Klasse (SHR) und esst mittags in
          einer Klasse. Die Reinigung bleibt an allen Schultagen dieselbe.
        </p>
      </div>

      <section className="space-y-3">
        {data.people.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Für euer Zimmer ist noch nichts eingetragen.
          </p>
        )}
        {data.people.map((p) => (
          <div key={p.participantId} className="washi rounded-3xl p-5">
            <p className="font-display text-lg">{p.name}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-muted-foreground">Reinigung</dt>
                <dd className="font-display text-primary">{p.reinigung || "—"}</dd>
              </div>
              {p.lunches.map((l) => (
                <div key={l.dayId} className="flex gap-3">
                  <dt className="w-32 shrink-0 text-muted-foreground">
                    Mittag {formatDateShort(l.date)}
                  </dt>
                  <dd className="font-display text-primary">{l.label || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </section>
    </main>
  );
}
