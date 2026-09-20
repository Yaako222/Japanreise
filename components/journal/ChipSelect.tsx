import { cn } from "@/lib/utils";

export function Chip({
  label,
  selected,
  onClick,
  size = "md",
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  size?: "md" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-2xl border text-left transition-all active:scale-[0.97]",
        size === "lg" ? "px-4 py-4 text-base" : "px-4 py-3 text-sm",
        selected
          ? "border-primary bg-primary/20 text-foreground"
          : "border-border bg-card/60 text-foreground/90",
      )}
    >
      {label}
    </button>
  );
}

export function ChipGrid({
  options,
  selected,
  onToggle,
  columns = 2,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1")}>
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          selected={selected.includes(option)}
          onClick={() => onToggle(option)}
          size="lg"
        />
      ))}
    </div>
  );
}
