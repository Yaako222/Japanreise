import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  ClipboardList,
  CalendarDays,
  CircleAlert,
  Footprints,
  HandHeart,
  KeyRound,
  ListChecks,
  Music2,
  NotebookPen,
  Settings,
  Sparkles,
  FileText,
} from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { PushOptIn } from "@/components/push-optin";
import { MusicianNav } from "@/components/musician-nav";
import { ConcertCountdown } from "@/components/concert-card";
import { publicConcerts, type Concert } from "@/lib/concert.functions";
import { formatJapanDateTime } from "@/lib/date";
import { useEffect, useState } from "react";
import { RoomGate } from "@/components/room-gate";
import { getStoredRoomCode, getStoredRoomPin } from "@/lib/room-storage";

export const Route = createFileRoute("/musiker")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Für die BOH-Musiker – BOH Japanreise" },
      {
        name: "description",
        content:
          "Programm mit Uhrzeiten, wichtige Infos, Verhaltensregeln, Reise-Checkliste und der abendliche Tagesbericht eures Zimmers.",
      },
      { property: "og:title", content: "Für die BOH-Musiker – BOH Japanreise" },
      {
        property: "og:description",
        content: "Alles, was ihr auf der Japanreise braucht – an einem Ort.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MusicianArea,
});

/** Einmalige Zimmer-Anmeldung – sie bleibt bis zum Abmelden bestehen. */
function MusicianArea() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getStoredRoomCode() && getStoredRoomPin()));
    setReady(true);
  }, []);

  if (!ready)
    return (
      <p className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </p>
    );

  if (!loggedIn)
    return (
      <RoomGate
        title="Kurz anmelden"
        intro="Zimmernummer und PIN eingeben – danach bleibt ihr angemeldet, bis ihr auf „Abmelden“ tippt."
        onDone={() => setLoggedIn(true)}
      />
    );

  return <MusicianPage />;
}

function NextConcert() {
  const load = useServerFn(publicConcerts);
  const q = useQuery({ queryKey: ["concerts", "public"], queryFn: () => load() });
  const concerts: Concert[] = q.data?.concerts ?? [];
  const next = concerts.find((c) => new Date(c.startsAt).getTime() >= Date.now());
  if (!next) return null;

  return (
    <Link
      to="/konzerte"
      className="mt-6 block rounded-2xl border border-primary/40 bg-primary/10 p-4 transition-colors hover:bg-primary/20"
    >
      <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
        Nächstes Konzert
      </p>
      <p className="font-display mt-1 text-lg leading-tight">{next.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{formatJapanDateTime(next.startsAt)}</p>
      <div className="mt-2">
        <ConcertCountdown startsAt={next.startsAt} />
      </div>
    </Link>
  );
}

function MusicianPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 py-10">
      <MusicianNav home showTabs={false} />
      <p className="mt-6 text-sm tracking-[0.3em] text-muted-foreground uppercase">
        Für die BOH-Musiker
      </p>
      <h1 className="font-display mt-3 text-3xl leading-tight">
        Was brauchst du?
        <span className="mt-1 block text-lg text-primary">日本の旅</span>
      </h1>

      <div className="mt-6">
        <AnnouncementBanner />
      </div>

      <div className="mt-4">
        <PushOptIn audience="room" />
      </div>

      <NextConcert />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Tile to="/programm" icon={<CalendarClock className="size-6 text-primary" />} label="Programm" hint="Alle Tage mit Uhrzeiten" />
        <Tile to="/" search={{ ziel: "bericht" }} icon={<NotebookPen className="size-6 text-primary" />} label="Tagesbericht" hint="Zimmernummer & PIN eingeben" />
        <Tile to="/proben" icon={<Music2 className="size-6 text-primary" />} label="Proben" hint="Woran ihr mit eurem Instrument arbeitet" />
        <Tile to="/konzerte" icon={<CalendarDays className="size-6 text-primary" />} label="Konzerte" hint="Treffpunkt, Kleidung, Programm" />
        <Tile to="/" search={{ ziel: "codes" }} icon={<KeyRound className="size-6 text-primary" />} label="Elterncodes" hint="Nach Zimmer-Login sichtbar" />
        <Tile to="/tipps" hash="infos" icon={<CircleAlert className="size-6 text-primary" />} label="Wichtige Infos" hint="Notfall, Geld, Hotel" />
        <Tile to="/tipps" hash="regeln" icon={<HandHeart className="size-6 text-primary" />} label="Regeln" hint="Was gilt für alle" />
        <Tile to="/tipps" hash="checkliste" icon={<ListChecks className="size-6 text-primary" />} label="Checklisten" hint="Packen & Technik" />
        <Tile to="/ausgang" icon={<Footprints className="size-6 text-primary" />} label="Ausgang" hint="Abmelden – immer zu zweit" />
        <Tile to="/putzplan" icon={<Sparkles className="size-6 text-primary" />} label="Putz- & Essensplan" hint="Reinigung & Mittagessen" />
        <Tile to="/vorbereitung" icon={<ClipboardList className="size-6 text-primary" />} label="Vor der Reise" hint="Reservierung, Fluglisten, Geschenke" />
        <Tile to="/dokumente" icon={<FileText className="size-6 text-primary" />} label="Dokumente" hint="PDFs, Fotos & wichtige Unterlagen" />
        <Tile to="/einstellungen" icon={<Settings className="size-6 text-primary" />} label="Einstellungen" hint="Farbe & Benachrichtigungen" />
      </div>
    </main>
  );
}

function Tile({
  to,
  hash,
  search,
  icon,
  label,
  hint,
}: {
  to: "/programm" | "/tipps" | "/ausgang" | "/putzplan" | "/proben" | "/konzerte" | "/dokumente" | "/vorbereitung" | "/einstellungen" | "/";
  hash?: string;
  search?: { ziel?: "bericht" | "codes" };
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      {...(hash ? { hash } : {})}
      {...(search ? { search } : {})}
      className="flex min-h-28 flex-col justify-between rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:bg-secondary"
    >
      {icon}
      <span>
        <span className="font-display block text-base">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </Link>
  );
}
