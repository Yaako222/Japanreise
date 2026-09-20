import { createFileRoute } from "@tanstack/react-router";
import { RoomOnly } from "@/components/room-only";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, CircleAlert, ListChecks, HandHeart } from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { MusicianNav } from "@/components/musician-nav";
import { publicContent, type InfoBlock } from "@/lib/content.functions";

export const Route = createFileRoute("/tipps")({
  head: () => ({
    meta: [
      { title: "Tipps & Checkliste – BOH Japanreise" },
      {
        name: "description",
        content:
          "Regeln, Packliste, Geld & Suica, japanische Sätze und Notfallnummern für die BOH Japan-Tour 2026.",
      },
      { property: "og:title", content: "Tipps & Checkliste – BOH Japanreise" },
      {
        property: "og:description",
        content: "Alles Wichtige für unterwegs: Regeln, Checkliste, Sprache und Notfallnummern.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  component: () => (
    <RoomOnly>
      <TipsPage />
    </RoomOnly>
  ),
});

type Section = "infos" | "checkliste" | "regeln";

const SECTIONS: { id: Section; label: string; icon: typeof CircleAlert }[] = [
  { id: "infos", label: "Wichtige Infos", icon: CircleAlert },
  { id: "checkliste", label: "Reise-Checkliste", icon: ListChecks },
  { id: "regeln", label: "Verhaltensregeln", icon: HandHeart },
];

function lines(body: string) {
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function TipsPage() {
  const [section, setSection] = useState<Section>("infos");
  const load = useServerFn(publicContent);
  const q = useQuery({ queryKey: ["content"], queryFn: () => load({}) });

  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.replace("#", "");
      if (SECTIONS.some((s) => s.id === h)) setSection(h as Section);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const blocks = ((q.data?.blocks ?? []) as InfoBlock[]).filter((b) => b.section === section);
  const label = SECTIONS.find((s) => s.id === section)?.label ?? "";

  return (
    <div className="flex min-h-dvh flex-col gap-8 px-6 py-10">
      <div>
        <MusicianNav />
        <p className="mt-6 text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Für unterwegs
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight">
          Tipps & Checkliste
          <span className="mt-1 block text-lg text-primary">日本のヒント</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Wählt einen Bereich – die Details erscheinen direkt darunter.
        </p>
        <nav className="mt-6 grid grid-cols-3 gap-2" aria-label="Bereiche">
          {SECTIONS.map((s) => {
            const active = section === s.id;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                aria-pressed={active}
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center text-xs transition ${
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-card/60 text-muted-foreground"
                }`}
              >
                <Icon className={`size-5 ${active ? "text-primary" : ""}`} /> {s.label}
              </button>
            );
          })}
        </nav>
      </div>

      <AnnouncementBanner limit={2} />

      <section>
        <h2 className="mb-3 text-xs tracking-[0.25em] text-muted-foreground uppercase">{label}</h2>

        {q.isLoading && <p className="text-sm text-muted-foreground">Lade …</p>}

        {section === "regeln" ? (
          <div className="space-y-2">
            {blocks.map((b) => (
              <Accordion key={b.id} title={b.title}>
                {b.body}
              </Accordion>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((b) => {
              const items = lines(b.body);
              return (
                <div key={b.id} className="washi rounded-3xl p-5">
                  <p className="font-display text-base">{b.title}</p>
                  {items.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed">
                          <span className="text-primary">
                            {section === "checkliste" ? "▢" : "·"}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!q.isLoading && !blocks.length && (
          <p className="text-sm text-muted-foreground">
            Hier steht noch nichts – die Begleitpersonen füllen diesen Bereich.
          </p>
        )}
      </section>

      <p className="pb-4 text-center text-xs leading-relaxed text-muted-foreground">
        Diese Reise kommt nur durch die Unterstützung vieler Menschen zustande.
        <br />
        Seid allen gegenüber dankbar und respektvoll.
      </p>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm">{title}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="px-4 pb-4 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {children}
        </p>
      )}
    </div>
  );
}
