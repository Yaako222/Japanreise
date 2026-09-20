import { MOODS } from "@/lib/journal-types";
import { cn } from "@/lib/utils";

export function MoodPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            "flex aspect-3/4 flex-col items-center justify-center gap-1 rounded-2xl border transition-all active:scale-95",
            value === mood.value
              ? "border-primary bg-primary/15 shadow-[0_0_0_3px_var(--primary)]"
              : "border-border bg-card/70",
          )}
          aria-pressed={value === mood.value}
          aria-label={mood.label}
        >
          <span className="text-3xl">{mood.emoji}</span>
          <span className="text-[10px] text-muted-foreground">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
