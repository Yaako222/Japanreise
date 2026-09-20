import { createFileRoute } from "@tanstack/react-router";
import { RoomOnly } from "@/components/room-only";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MusicianNav } from "@/components/musician-nav";
import { ConcertCard } from "@/components/concert-card";
import { publicConcerts, type Concert } from "@/lib/concert.functions";

export const Route = createFileRoute("/konzerte")({
  head: () => ({
    meta: [
      { title: "Konzerte & Ablauf – BOH Japanreise" },
      {
        name: "description",
        content:
          "Wann und wo wir auftreten: Treffpunkt, Stimmzeit, Kleidung und die Reihenfolge unserer Stücke.",
      },
      { property: "og:title", content: "Konzerte & Ablauf – BOH Japanreise" },
      {
        property: "og:description",
        content: "Treffpunkt, Stimmzeit, Kleidung und Programmfolge unserer Auftritte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  component: () => (
    <RoomOnly>
      <ConcertsPage />
    </RoomOnly>
  ),
});

function ConcertsPage() {
  const load = useServerFn(publicConcerts);
  const q = useQuery({ queryKey: ["concerts", "public"], queryFn: () => load() });

  const concerts: Concert[] = q.data?.concerts ?? [];
  const now = Date.now();
  const upcoming = concerts.filter((c) => new Date(c.startsAt).getTime() >= now);
  const past = concerts.filter((c) => new Date(c.startsAt).getTime() < now);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-6 py-10">
      <MusicianNav />

      <div>
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Auf der Bühne
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight">
          Konzerte
          <span className="mt-1 block text-lg text-primary">コンサート</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Alle Zeiten in japanischer Uhrzeit. Die Begleitpersonen halten den Ablauf aktuell.
        </p>
      </div>

      {q.isLoading && <p className="text-sm text-muted-foreground">Einen Moment …</p>}

      {!q.isLoading && concerts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Es ist noch kein Konzert eingetragen. Sobald der Ablauf feststeht, steht er hier.
        </p>
      )}

      {upcoming.map((c, i) => (
        <ConcertCard key={c.id} concert={c} showCountdown={i === 0} />
      ))}

      {past.length > 0 && (
        <section className="space-y-3 pt-2">
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
            War schon – danke!
          </p>
          {past.map((c) => (
            <ConcertCard key={c.id} concert={c} />
          ))}
        </section>
      )}
    </main>
  );
}
