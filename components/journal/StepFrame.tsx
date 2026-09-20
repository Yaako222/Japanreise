import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function StepFrame({
  progress,
  eyebrow,
  question,
  hint,
  children,
  onBack,
  onNext,
  nextLabel = "Weiter",
  nextDisabled,
  onSkip,
  steps,
  stepIndex,
  onJump,
}: {
  progress: number;
  eyebrow: string;
  question: string;
  hint?: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onSkip?: () => void;
  steps?: { key: string; label: string }[];
  stepIndex?: number;
  onJump?: (index: number) => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 bg-background/80 px-5 pt-5 pb-3 backdrop-blur">
        {steps && steps.length > 0 && onJump ? (
          <div className="flex w-full gap-1">
            {steps.map((s, i) => (
              <button
                key={s.key}
                type="button"
                title={s.label}
                aria-label={`Zu Schritt ${i + 1}: ${s.label}`}
                aria-current={i === stepIndex ? "step" : undefined}
                onClick={() => onJump(i)}
                className="group flex-1 py-2"
              >
                <span
                  className={`block h-1.5 rounded-full transition-colors ${
                    i === stepIndex
                      ? "bg-primary ring-2 ring-primary/40"
                      : i < (stepIndex ?? 0)
                        ? "bg-primary/70"
                        : "bg-muted"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
        <div className="mt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <ArrowLeft className="size-4" /> Zurück
          </button>
          <span className="text-xs tracking-widest text-muted-foreground uppercase">{eyebrow}</span>
        </div>
        {steps && steps.length > 0 && onJump && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Schritt {(stepIndex ?? 0) + 1} von {steps.length} · tippt oben auf einen Balken, um zu
            springen
          </p>
        )}
      </header>


      <main className="flex-1 px-5 pb-40">
        <h1 className="font-display mt-6 text-2xl leading-snug">{question}</h1>
        {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
        <div className="mt-6">{children}</div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 space-y-2 bg-linear-to-t from-background via-background/95 to-transparent px-5 pt-6 pb-6">
        <Button
          size="lg"
          className="h-14 w-full rounded-2xl text-base"
          onClick={onNext}
          disabled={nextDisabled}
        >
          {nextLabel} <ArrowRight className="ml-1 size-4" />
        </Button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-1 text-center text-sm text-muted-foreground"
          >
            Überspringen
          </button>
        )}
      </footer>
    </div>
  );
}
