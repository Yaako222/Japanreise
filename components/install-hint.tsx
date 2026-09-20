import { useEffect, useState } from "react";
import { Bell, Share, MoreVertical, X } from "lucide-react";

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (window.navigator as unknown as { standalone?: boolean }).standalone === true;

const isMobile = () => /iphone|ipad|ipod|android/i.test(window.navigator.userAgent);
const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

/**
 * Hinweis-Fenster für Handys: erklärt das Installieren der App.
 * Wer die App schon installiert hat (Startbildschirm/Standalone), sieht es nie.
 */
export function InstallHint() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"ios" | "android">("ios");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone() || !isMobile()) return;
    setTab(isIos() ? "ios" : "android");
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 p-3 backdrop-blur-sm sm:items-center">
      <div className="washi max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-xl text-primary">Wichtig</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Schließen"
            className="rounded-lg border border-border bg-card/70 p-1.5 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <h2 className="font-display mt-1 text-2xl leading-tight">
          Legt die App auf euren Startbildschirm
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          So habt ihr die Japanreise wie eine richtige App auf dem Handy – und nur so kommen
          Mitteilungen zuverlässig an.
        </p>

        <div className="mt-4 inline-flex rounded-full border border-border bg-card/60 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTab("ios")}
            className={`rounded-full px-4 py-1.5 transition ${
              tab === "ios" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            iPhone / Safari
          </button>
          <button
            type="button"
            onClick={() => setTab("android")}
            className={`rounded-full px-4 py-1.5 transition ${
              tab === "android" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Android / Chrome
          </button>
        </div>

        {tab === "ios" ? (
          <ol className="mt-4 space-y-2 text-sm">
            <Step n={1}>
              Diese Seite in <strong>Safari</strong> öffnen (nicht in Chrome).
            </Step>
            <Step n={2}>
              Unten auf das Teilen-Symbol tippen{" "}
              <Share className="inline size-4 align-text-bottom text-primary" />.
            </Step>
            <Step n={3}>
              Etwas nach unten wischen und <strong>„Zum Home-Bildschirm“</strong> wählen.
            </Step>
            <Step n={4}>Mit „Hinzufügen“ bestätigen – fertig, das Symbol liegt auf dem Handy.</Step>
          </ol>
        ) : (
          <ol className="mt-4 space-y-2 text-sm">
            <Step n={1}>
              Diese Seite in <strong>Chrome</strong> öffnen.
            </Step>
            <Step n={2}>
              Oben rechts auf die drei Punkte tippen{" "}
              <MoreVertical className="inline size-4 align-text-bottom text-primary" />.
            </Step>
            <Step n={3}>
              <strong>„App installieren“</strong> oder „Zum Startbildschirm zufügen“ wählen.
            </Step>
            <Step n={4}>Bestätigen – fertig, das Symbol liegt auf dem Handy.</Step>
          </ol>
        )}

        <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/10 p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Bell className="size-4 text-primary" /> Wichtig: Benachrichtigungen aktivieren
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Danach die App vom Startbildschirm öffnen und unter <strong>Einstellungen</strong> die
            Benachrichtigungen einschalten. Nur so bekommt ihr Ankündigungen, Programmänderungen und
            Antworten auf Ausgangs-Anträge sofort aufs Handy.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-4 h-12 w-full rounded-2xl bg-primary text-base font-medium text-primary-foreground"
        >
          Verstanden – weiter zur App
        </button>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
