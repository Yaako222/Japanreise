import { useEffect, useState } from "react";
import { Check, Compass, FileText, KeyRound, Lock, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: Compass,
    title: "Willkommen",
    confirm: "Verstanden",
    text: "Diese App soll Schüler, Reisebegleiter, Dirigenten und Eltern während unserer Orchesterreise unterstützen. Sie bündelt wichtige Informationen und ermöglicht den Schülern, ihre Erlebnisse jeden Tag unkompliziert in einem kleinen Reisebericht festzuhalten. Die App ergänzt die Organisation durch Takashi und das Begleiterteam. Offizielle Informationen und Entscheidungen der Reiseleitung haben immer Vorrang.",
  },
  {
    icon: FileText,
    title: "Reiseberichte",
    confirm: "Verstanden",
    text: "Die täglichen Reiseberichte werden gemeinsam pro Zimmer erstellt. Sie sollen persönliche Eindrücke, besondere Momente und Erfahrungen des Kulturaustauschs festhalten – und müssen nicht jeden Programmpunkt vollständig dokumentieren. Als Eltern könnt ihr die Berichte des Zimmers lesen, für das ihr einen Eltern-Code erhalten habt. Bitte berücksichtigt dabei: Die Berichte geben die persönlichen Eindrücke der Jugendlichen wieder.",
  },
  {
    icon: KeyRound,
    title: "Eltern-Code & Privatsphäre",
    confirm: "Ich habe verstanden, wie der Zugang funktioniert",
    text: "Jedes Zimmer erhält einen eigenen Eltern-Code. Mit diesem Code bekommt ihr Zugriff auf die Reiseberichte dieses Zimmers, nicht auf die Berichte anderer Zimmer. Die Jugendlichen erhalten den Eltern-Code und können ihn an ihre Eltern weitergeben. Sie entscheiden damit auch selbst, wem sie Zugang zu den Berichten ihres Zimmers ermöglichen. Wer den Code erhält, kann die Berichte dieses Zimmers lesen. Bitte behandelt ihn deshalb entsprechend vertraulich und gebt ihn nicht ohne Rücksprache mit den Jugendlichen weiter.",
  },
  {
    icon: Lock,
    title: "Was die App kann – und was nicht",
    confirm: "Verstanden",
    text: "Die App soll informieren, Organisation erleichtern und Erinnerungen festhalten. Sie ist kein Echtzeit-Tracking der Schüler, kein Notfallkanal und keine Garantie dafür, dass jede Information jederzeit vollständig oder aktuell ist. Bei wichtigen, dringenden oder persönlichen Anliegen gelten weiterhin die von Takashi und dem Begleiterteam festgelegten Kommunikationswege.",
  },
  {
    icon: MessageCircle,
    title: "Ankündigungen, Fragen & Feedback",
    confirm: "Ich weiß, wo ich Informationen und Hilfe finde",
    text: "In der App können aktuelle Ankündigungen und Informationen der Reiseleitung und der Dirigenten bereitgestellt werden. Außerdem gibt es einen Feedback-Bereich. Dort könnt ihr Fragen zur Nutzung stellen, Fehler melden, Ideen und Verbesserungsvorschläge einreichen und Ideen für eine mögliche zukünftige BOH-App vorschlagen. Maxim unterstützt uns als First Level Support und hilft dabei, Fragen und Feedback zu bündeln. Der Feedback-Bereich ist kein Kanal für dringende Anliegen während der Reise. Dafür nutzt bitte die vorgesehenen Kommunikationswege der Reiseleitung.",
  },
  {
    icon: Sparkles,
    title: "Ein gemeinsames Projekt",
    confirm: "Alles verstanden",
    text: "Diese App ist zunächst als Unterstützung für unsere Orchesterreise entstanden und wurde in meiner Freizeit als Beitrag zum BOH entwickelt. Dahinter steht kein kommerzieller Anbieter und kein professionelles Entwickler- oder Supportteam. Feedback, Fehlerhinweise und gute Ideen sind ausdrücklich willkommen. Bitte habt gleichzeitig Verständnis dafür, dass wir nicht jeden Wunsch umsetzen oder während der Reise laufend neue Funktionen entwickeln können. Wenn sich die App bewährt und für Schüler, Eltern, Dirigenten und Begleiter einen echten Mehrwert bietet, kann sie sich perspektivisch zu einer App für das BOH insgesamt weiterentwickeln. Was daraus entsteht, möchten wir auch von den Erfahrungen und Ideen während dieser Reise abhängig machen. Für den Moment ist das Ziel klar: Weniger Organisationsaufwand. Gute Information. Schöne Erinnerungen. Und mehr Zeit für eine besondere Reise.",
  },
];

function storageKey(code: string) {
  return `jj_parent_tour_v2_${code}`;
}

/** Einmalige Mini-Anleitung nach dem ersten Login eines Elterncodes. */
export function ParentTour({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!code) return;
    try {
      if (localStorage.getItem(storageKey(code)) !== "done") setOpen(true);
    } catch {
      /* ignore */
    }
  }, [code]);

  if (!open) return null;

  const allSeen = seen.length === STEPS.length;
  const Step = STEPS[current] ?? STEPS[0]!;
  const Icon = Step.icon;

  const markSeen = (index: number) => {
    setCurrent(index);
    setSeen((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  const finish = () => {
    try {
      localStorage.setItem(storageKey(code), "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/90 p-4 backdrop-blur-sm sm:items-center">
      <div className="washi w-full max-w-md rounded-3xl p-6">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Kurze Einführung · {seen.length} von {STEPS.length}
        </p>
        <h2 className="font-display mt-2 text-2xl">Willkommen im Elternbereich</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bitte lest alle sechs Punkte und bestätigt jeden – danach geht es los.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {STEPS.map((s, i) => {
            const done = seen.includes(i);
            const active = current === i;
            return (
              <button
                key={s.title}
                type="button"
                onClick={() => setCurrent(i)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/20 text-foreground"
                    : done
                      ? "border-border bg-card/50 text-muted-foreground"
                      : "border-primary/50 bg-card/70 text-foreground"
                }`}
              >
                {done ? <Check className="size-3 text-primary" /> : <s.icon className="size-3.5" />}
                {i + 1} · {s.title}
              </button>
            );
          })}
        </div>

        {
          <div className="mt-5 rounded-2xl border border-border bg-card/60 p-4">
            <p className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
              <Icon className="size-3.5" /> {current + 1} · {Step.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{Step.text}</p>
            {seen.includes(current) ? (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs text-primary">
                <Check className="size-3.5" /> Bestätigt
              </p>
            ) : (
              <Button
                variant="outline"
                className="mt-3 h-10 w-full rounded-xl text-sm"
                onClick={() => markSeen(current)}
              >
                ☐ {Step.confirm}
              </Button>
            )}
          </div>
        }

        <Button className="mt-5 h-12 w-full rounded-2xl" disabled={!allSeen} onClick={finish}>
          {allSeen ? "Weiter zum Elternbereich" : `Noch ${STEPS.length - seen.length} Punkte bestätigen`}
        </Button>
      </div>
    </div>
  );
}
