import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, Shirt, Sparkles } from "lucide-react";
import type { Concert } from "@/lib/concert.functions";
import { formatJapanDateTime, formatJapanTime } from "@/lib/date";

/** Zählt in Japan-Ortszeit bis zum Konzertbeginn. */
export function ConcertCountdown({ startsAt }: { startsAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (now === null) return null;
  const diff = new Date(startsAt).getTime() - now;
  if (diff <= 0) {
    return <p className="font-display text-lg text-primary">Jetzt wird gespielt.</p>;
  }
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const text =
    days > 0
      ? `noch ${days} ${days === 1 ? "Tag" : "Tage"}, ${hours} Std.`
      : hours > 0
        ? `noch ${hours} Std. ${minutes} Min.`
        : `noch ${minutes} Min.`;
  return <p className="font-display text-2xl text-primary">{text}</p>;
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-display text-foreground">{value}</span>
    </div>
  );
}

/** Ein Konzert mit allen Zeiten, Kleidung und Programmfolge. */
export function ConcertCard({
  concert,
  showCountdown = false,
}: {
  concert: Concert;
  showCountdown?: boolean;
}) {
  return (
    <div className="washi rounded-3xl p-5">
      <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Konzert</p>
      <h2 className="font-display mt-1 text-2xl leading-tight">{concert.title}</h2>
      {showCountdown && (
        <div className="mt-2">
          <ConcertCountdown startsAt={concert.startsAt} />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Row
          icon={<CalendarDays className="size-4" />}
          label="Wann"
          value={formatJapanDateTime(concert.startsAt)}
        />
        {concert.venue && (
          <Row
            icon={<MapPin className="size-4" />}
            label="Wo"
            value={concert.venue}
          />
        )}
        {concert.meetingAt && (
          <Row
            icon={<Clock className="size-4" />}
            label="Treffpunkt"
            value={`${formatJapanTime(concert.meetingAt)} Uhr${
              concert.meetingPoint ? ` · ${concert.meetingPoint}` : ""
            }`}
          />
        )}
        {concert.tuningAt && (
          <Row
            icon={<Sparkles className="size-4" />}
            label="Stimmen"
            value={formatJapanTime(concert.tuningAt)}
          />
        )}
        {concert.dress && (
          <Row icon={<Shirt className="size-4" />} label="Kleidung" value={concert.dress} />
        )}
      </div>

      {concert.program.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Programm</p>
          <ol className="mt-2 space-y-1 text-sm">
            {concert.program.map((piece, i) => (
              <li key={`${piece}-${i}`} className="flex gap-2">
                <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                <span className="font-display">{piece}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {concert.notes && (
        <p className="mt-3 whitespace-pre-line border-t border-border pt-3 text-sm text-muted-foreground">
          {concert.notes}
        </p>
      )}
    </div>
  );
}
