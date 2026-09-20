import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { clearRoomCode, clearRoomPin } from "@/lib/room-storage";
import { ScrollTabs } from "@/components/scroll-tabs";

const TABS: {
  to: "/programm" | "/tipps" | "/ausgang" | "/putzplan" | "/proben" | "/konzerte" | "/dokumente" | "/vorbereitung" | "/einstellungen" | "/";
  hash?: string;
  search?: { ziel?: "bericht" | "codes" };
  label: string;
}[] = [
  { to: "/programm", label: "Programm" },
  { to: "/", search: { ziel: "bericht" }, label: "Tagesbericht" },
  { to: "/", search: { ziel: "codes" }, label: "Elterncodes" },
  { to: "/proben", label: "Proben" },
  { to: "/konzerte", label: "Konzerte" },
  { to: "/tipps", hash: "infos", label: "Infos" },
  { to: "/tipps", hash: "regeln", label: "Regeln" },
  { to: "/tipps", hash: "checkliste", label: "Checkliste" },
  { to: "/putzplan", label: "Putz- & Essensplan" },
  { to: "/ausgang", label: "Ausgang" },
  { to: "/vorbereitung", label: "Vor der Reise" },
  { to: "/dokumente", label: "Dokumente" },
  { to: "/einstellungen", label: "Einstellungen" },
];

export function MusicianNav({ showTabs = true, home = false }: { showTabs?: boolean; home?: boolean }) {
  const abmelden = () => {
    clearRoomCode();
    clearRoomPin();
    // Vollständiger Neustart: setzt auch den Seitenzustand der Zimmer-Anmeldung zurück.
    window.location.assign("/");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {home ? (
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Zurück
          </Link>
        ) : (
          <Link
            to="/musiker"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Alle Optionen
          </Link>
        )}
        <button
          type="button"
          onClick={abmelden}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
        >
          <LogOut className="size-3.5" /> Abmelden
        </button>
      </div>
      {showTabs && (
        <ScrollTabs ariaLabel="Musiker-Bereiche">
          {TABS.map((t) => (
            <Link
              key={t.label}
              to={t.to}
              {...(t.hash ? { hash: t.hash } : {})}
              {...(t.search ? { search: t.search } : {})}
              className="shrink-0 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
            >
              {t.label}
            </Link>
          ))}
        </ScrollTabs>
      )}
    </div>
  );
}
