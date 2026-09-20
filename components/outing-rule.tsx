import { Info } from "lucide-react";

/**
 * Stehender Hinweis bei den Abmeldungen: Abgelehnte Anträge werden nicht einfach
 * neu gestellt, sondern direkt mit einer Begleitperson besprochen.
 */
export function OutingRule({ rejected }: { rejected: boolean }) {
  return (
    <section
      aria-label="Hinweis zu abgelehnten Anträgen"
      className={`rounded-2xl border p-4 ${
        rejected ? "border-primary bg-primary/10" : "border-border bg-card/40"
      }`}
    >
      <p className="flex items-center gap-2 text-xs tracking-[0.25em] text-muted-foreground uppercase">
        <Info className="size-4 shrink-0" />
        Wichtig
      </p>
      <p className="mt-2 text-sm leading-relaxed">
        Falls ein Antrag abgelehnt wurde, bitte nicht einfach erneut stellen. Bitte sprecht die
        Begleitpersonen direkt an – falls ihr mit der Ablehnung nicht einverstanden seid. Hier soll
        kein PingPong entstehen – es soll die Begleitpersonen unterstützen.
      </p>
    </section>
  );
}
