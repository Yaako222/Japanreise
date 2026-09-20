import { Mic, Square } from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function countSentences(text: string): number {
  return text
    .split(/[.!?…]+/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 1).length;
}

export function VoiceField({
  value,
  onChange,
  placeholder = "Schreibt oder erzählt einfach drauflos.",
  minSentences,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minSentences?: number;
}) {
  const { supported, listening, error, interim, start, stop } = useSpeech((text) => {
    onChange(value ? `${value} ${text}` : text);
  });

  const sentences = minSentences ? countSentences(value) : 0;
  const tooShort =
    minSentences != null && value.trim().length > 0 && sentences < minSentences;

  return (
    <div className="space-y-3">
      {supported && (
        <button
          type="button"
          onClick={() => (listening ? stop() : start())}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-2xl border px-4 py-5 text-base font-medium transition-all active:scale-[0.98]",
            listening
              ? "border-primary bg-primary/25 animate-pulse"
              : "border-border bg-card/70 hover:border-primary/60",
          )}
        >
          {listening ? <Square className="size-5" /> : <Mic className="size-5" />}
          {listening ? "Aufnahme läuft – zum Beenden tippen" : "Erzählen (Mikrofon)"}
        </button>
      )}

      {listening && interim && (
        <p className="px-1 text-sm text-muted-foreground italic">{interim} …</p>
      )}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="rounded-2xl bg-card/70 text-base"
      />

      {minSentences != null && (
        <p
          className={cn(
            "text-[11px] leading-snug",
            tooShort ? "text-primary" : "text-muted-foreground",
          )}
        >
          {tooShort
            ? `Noch zu kurz: Bitte mindestens ${minSentences} Sätze schreiben oder sagen (bisher ${sentences}). Denkt daran: Was ist passiert, wer war dabei, wie hat es sich angefühlt?`
            : `Mindestens ${minSentences} Sätze – schreibt oder erzählt ruhig etwas ausführlicher.`}
        </p>
      )}

      {(error || !supported) && (
        <p className="text-xs text-muted-foreground">
          {error ?? "Dieses Gerät unterstützt kein Diktieren – tippt euren Text einfach ein."}
        </p>
      )}
    </div>
  );
}
