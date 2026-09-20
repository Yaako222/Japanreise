import { createFileRoute } from "@tanstack/react-router";
import { RoomOnly } from "@/components/room-only";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { MusicianNav } from "@/components/musician-nav";
import { publicProgram, type ProgramDay } from "@/lib/program.functions";
import { formatDateShort } from "@/lib/date";

const programQuery = queryOptions({
  queryKey: ["public", "programm"],
  queryFn: () => publicProgram(),
});

export const Route = createFileRoute("/programm")({
  head: () => ({
    meta: [
      { title: "Programm mit Uhrzeiten – BOH Japanreise" },
      {
        name: "description",
        content:
          "Tagesprogramm der BOH Japan-Tour 2026 vom 18. bis 28. Oktober mit allen Uhrzeiten und den Flugzeiten von SAS und Finnair.",
      },
      { property: "og:title", content: "Programm mit Uhrzeiten – BOH Japanreise" },
      {
        property: "og:description",
        content: "Alle Reisetage mit Uhrzeiten, Treffpunkten und Flügen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(programQuery),
  ssr: false,
  component: () => (
    <RoomOnly>
      <ProgramPage />
    </RoomOnly>
  ),
});

const TIME_RE = /^(\d{1,2}[:.]\d{2})\s+(.*)$/;

const formatDate = formatDateShort;

function parseDay(day: ProgramDay) {
  const lines = day.description
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const title = lines[0] ?? day.location ?? `Tag ${day.dayNumber}`;
  const items = lines.slice(1).map((line) => {
    const m = TIME_RE.exec(line);
    return m ? { time: m[1], text: m[2] } : { time: undefined, text: line };
  });
  return { title, items };
}

function ProgramPage() {
  const { data } = useSuspenseQuery(programQuery);
  const days = data.days;

  return (
    <div className="flex min-h-dvh flex-col gap-8 px-6 py-10">
      <div>
        <MusicianNav />
        <p className="mt-6 text-sm tracking-[0.3em] text-muted-foreground uppercase">
          18.–28. Oktober 2026
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight">
          Programm
          <span className="mt-1 block text-lg text-primary">スケジュール</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Alle Tage mit Uhrzeiten und Flügen. Änderungen der Begleitpersonen erscheinen hier sofort.
        </p>
      </div>

      <div className="space-y-4">
        {days.length === 0 && (
          <p className="text-sm text-muted-foreground">Das Programm wird gerade vorbereitet.</p>
        )}
        {days.map((day) => {
          const { title, items } = parseDay(day);
          return (
            <section key={day.id} className="washi rounded-3xl p-5">
              <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
                {formatDate(day.date)}
                {day.location ? ` · ${day.location}` : ""}
              </p>
              <h2 className="font-display mt-1 text-lg leading-snug">{title}</h2>
              <ul className="mt-3 space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="font-display w-12 shrink-0 text-primary">
                      {item.time ?? "·"}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
