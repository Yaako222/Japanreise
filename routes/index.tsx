import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTodayState, resolveRoom, setRoomPin } from "@/lib/journal.functions";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { BackToOptions } from "@/components/back-to-options";
import { MusicianNav } from "@/components/musician-nav";
import { formatDateWeekdayLong, formatDayMonth } from "@/lib/date";
import {
  clearRoomCode,
  clearRoomPin,
  getStoredRoomCode,
  getStoredRoomPin,
  storeRoomCode,
  storeRoomPin,
} from "@/lib/room-storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BOH Japanreise – Unser Tagebuch" },
      {
        name: "description",
        content:
          "Jedes Zimmer hält den Tag in zwei Minuten fest: Stimmung, Erlebnisse und der eine Moment, den wir nicht vergessen wollen.",
      },
      { property: "og:title", content: "BOH Japanreise – Unser Tagebuch" },
      {
        property: "og:description",
        content: "Das gemeinsame Reisetagebuch unseres Kulturaustauschs in Japan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { code?: string; ziel?: "bericht" | "codes" } => ({
    ...(typeof search["code"] === "string" ? { code: search["code"] } : {}),
    ...(search["ziel"] === "bericht" || search["ziel"] === "codes"
      ? { ziel: search["ziel"] as "bericht" | "codes" }
      : {}),
  }),
  component: Index,
});

const MOOD_EMOJI = ["", "😫", "😕", "😐", "🙂", "🤩"];

function deviceHint() {
  if (typeof window === "undefined") return undefined;
  return (navigator.userAgent || "").slice(0, 160);
}

type Screen =
  | { kind: "code" }
  | {
      kind: "pin";
      code: string;
      roomNumber?: string | undefined;
      roomNames?: string[] | undefined;
      reportSubmitted?: boolean | undefined;
      reportDayNumber?: number | undefined;
    }
  | { kind: "locked"; code: string; minutes: number }
  | {
      kind: "choose";
      code: string;
      roomNumber?: string | undefined;
      roomNames?: string[] | undefined;
      reportSubmitted?: boolean | undefined;
      reportDayNumber?: number | undefined;
    }
  | { kind: "confirm"; code: string; first: string }
  | { kind: "room"; code: string };

function PinDial({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-label={label}
      autoFocus
      placeholder="••••"
      className="h-16 w-full rounded-2xl border border-border bg-card/70 text-center text-3xl tracking-[0.5em] text-foreground outline-none focus:border-primary"
    />
  );
}

function Screen({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
        Kulturaustausch
      </p>
      <h1 className="font-display mt-3 text-3xl leading-tight">{title}</h1>
      {hint && <p className="mt-3 text-muted-foreground">{hint}</p>}
      <div className="mt-8 space-y-3">{children}</div>
    </div>
  );
}

function RoomConfirmation({
  screen,
}: {
  screen: {
    roomNumber?: string | undefined;
    roomNames?: string[] | undefined;
    reportSubmitted?: boolean | undefined;
    reportDayNumber?: number | undefined;
  };
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 px-4 py-4">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Zimmer {screen.roomNumber ?? ""}
      </p>
      {screen.roomNames?.length ? (
        <div className="mt-2 space-y-0.5 font-display text-lg">
          {screen.roomNames.map((name) => (
            <p key={name}>{name}</p>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Für dieses Zimmer sind keine Namen hinterlegt.</p>
      )}
      <p className="mt-3 border-t border-border pt-3 text-sm">
        {screen.reportSubmitted ? "✓ Tagesbericht abgegeben" : "Tagesbericht noch offen"}
        {screen.reportDayNumber ? ` · Tag ${screen.reportDayNumber}` : ""}
      </p>
    </div>
  );
}

function Index() {
  const { code: searchCode, ziel } = Route.useSearch();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>({ kind: "code" });
  const [input, setInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [ready, setReady] = useState(false);

  const resolve = useServerFn(resolveRoom);
  const today = useServerFn(getTodayState);
  const choosePin = useServerFn(setRoomPin);

  const openRoom = useCallback(
    async (rawCode: string, rawPin?: string) => {
      const code = rawCode.trim().toUpperCase();
      const res = await resolve({
        data: { code, device: deviceHint(), ...(rawPin ? { pin: rawPin } : {}) },
      });

      if (!res.ok) {
        if (res.reason === "unknown") {
          clearRoomCode();
          clearRoomPin();
          setScreen({ kind: "code" });
          toast.error("Diese Zimmernummer kennen wir nicht.");
        } else if (res.reason === "locked") {
          setScreen({ kind: "locked", code, minutes: res.retryInMinutes ?? 10 });
        } else if (res.reason === "setup") {
          setScreen({
            kind: "choose",
            code,
            roomNumber: res.roomNumber,
            roomNames: res.roomNames,
            reportSubmitted: res.reportSubmitted,
            reportDayNumber: res.reportDayNumber,
          });
        } else {
          clearRoomPin();
          setPinInput("");
          setScreen({
            kind: "pin",
            code,
            roomNumber: res.roomNumber,
            roomNames: res.roomNames,
            reportSubmitted: res.reportSubmitted,
            reportDayNumber: res.reportDayNumber,
          });
        }
        return res;
      }

      storeRoomCode(code);

      if (res.needsPinSetup) {
        clearRoomPin();
        setPinInput("");
        setScreen({
          kind: "choose",
          code,
          roomNumber: res.room.roomNumber,
          roomNames: res.roomNames,
          reportSubmitted: res.reportSubmitted,
          reportDayNumber: res.reportDayNumber,
        });
        return res;
      }

      if (rawPin) storeRoomPin(rawPin);
      setPinInput("");
      setScreen({ kind: "room", code });
      return res;
    },
    [resolve],
  );

  useEffect(() => {
    const stored = searchCode ?? getStoredRoomCode();
    if (!stored) {
      setReady(true);
      return;
    }
    openRoom(stored, getStoredRoomPin() ?? undefined).finally(() => setReady(true));
  }, [searchCode, openRoom]);

  const activeCode = screen.kind === "room" ? screen.code : null;

  const state = useQuery({
    queryKey: ["today", activeCode],
    enabled: Boolean(activeCode),
    queryFn: () =>
      today({
        data: { code: activeCode as string, pin: getStoredRoomPin() ?? undefined },
      }),
  });

  // Die PIN passt nicht mehr (z. B. von den Begleitpersonen gelöscht): neu eingeben.
  useEffect(() => {
    const data = state.data;
    if (!data || data.ok || !activeCode) return;
    if (data.reason === "no_day") return;
    clearRoomPin();
    if (data.reason === "setup") {
      setScreen({ kind: "choose", code: activeCode });
      return;
    }
    setScreen(
      data.reason === "locked"
        ? { kind: "locked", code: activeCode, minutes: 10 }
        : { kind: "pin", code: activeCode },
    );
  }, [state.data, activeCode]);

  const openByCode = useMutation({
    mutationFn: (value: string) => openRoom(value),
  });

  const openByPin = useMutation({
    mutationFn: (value: string) =>
      openRoom(screen.kind === "pin" ? screen.code : "", value),
  });

  const savePin = useMutation({
    mutationFn: (value: { code: string; pin: string }) =>
      choosePin({ data: { code: value.code, pin: value.pin } }),
    onSuccess: (res, value) => {
      if (!res.ok) {
        toast.error("Diese PIN konnten wir nicht speichern. Bitte nochmal versuchen.");
        setScreen({ kind: "pin", code: value.code });
        return;
      }
      storeRoomPin(value.pin);
      setPinInput("");
      setScreen({ kind: "room", code: value.code });
      toast.success("PIN gespeichert. Nur ihr kennt sie.");
    },
    onError: () => toast.error("Speichern hat nicht geklappt. Bitte nochmal versuchen."),
  });

  const resetToCode = () => {
    clearRoomCode();
    clearRoomPin();
    setPinInput("");
    setInput("");
    setScreen({ kind: "code" });
  };

  if (!ready) return <div className="min-h-dvh" />;

  if (screen.kind === "code" && ziel) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-6 py-10">
        <BackToOptions />
        <div>
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
            {ziel === "codes" ? "Elterncodes" : "Tagesbericht"}
          </p>
          <h1 className="font-display mt-3 text-3xl leading-tight">Euer Zimmer öffnen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Zimmernummer eingeben, danach kommt eure PIN.
          </p>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = input.trim();
            if (value.length >= 1) openByCode.mutate(value);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="Zimmernummer"
            inputMode="numeric"
            autoComplete="off"
            aria-label="Zimmernummer"
            className="h-16 rounded-2xl bg-card/70 text-center text-3xl tracking-[0.3em]"
          />
          <Button
            type="submit"
            size="lg"
            className="h-14 w-full rounded-2xl text-base"
            disabled={input.trim().length < 1 || openByCode.isPending}
          >
            Weiter
          </Button>
        </form>
      </main>
    );
  }

  if (screen.kind === "code") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 py-10">
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Kulturaustausch</p>
        <h1 className="font-display mt-3 text-4xl leading-tight">
          BOH Japanreise
          <span className="mt-1 block text-xl text-primary">日本の旅</span>
        </h1>
        <div className="mt-8 space-y-3">
          <Link
            to="/musiker"
            className="block rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:bg-secondary"
          >
            <h2 className="font-display text-xl">Für BOH-Musiker</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Wichtige Infos, Regeln, Checklisten, Tagesberichte – ihr euch abmelden und Ankündigungen
              bekommen →
            </p>
          </Link>

          <Link
            to="/auth"
            className="block rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:bg-secondary"
          >
            <h2 className="font-display text-xl">Für BOH-Begleiter</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Programm, Checklisten und Zimmer verwalten – Abmeldungen im Blick und Ankündigungen senden →
            </p>
          </Link>

          <Link
            to="/eltern"
            className="block rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:bg-secondary"
          >
            <h2 className="font-display text-xl">Für Eltern</h2>
            <p className="mt-1 text-sm text-muted-foreground">Die Berichte des Zimmers Ihres Kindes ansehen →</p>
          </Link>

          <Link
            to="/dirigent"
            className="block rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:bg-secondary"
          >
            <h2 className="font-display text-xl">Für den Dirigenten</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Probenhinweise eintragen – gesprochen oder getippt →
            </p>
          </Link>
        </div>

        <p className="mt-auto pt-10 text-center text-[11px] text-muted-foreground">created by OZ</p>
      </main>

    );
  }

  if (screen.kind === "pin") {
    const label = screen.roomNumber ? `Zimmer ${screen.roomNumber}` : screen.code;
    return (
      <Screen
        title={`${label}: eure PIN`}
        hint="Die vier Ziffern, die ihr euch als Zimmer ausgesucht habt."
      >
        <RoomConfirmation screen={screen} />
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (pinInput.length === 4) openByPin.mutate(pinInput);
          }}
        >
          <PinDial value={pinInput} onChange={setPinInput} label="Zimmer-PIN" />
          <Button
            type="submit"
            size="lg"
            className="h-14 w-full rounded-2xl text-base"
            disabled={pinInput.length !== 4 || openByPin.isPending}
          >
            Weiter
          </Button>
        </form>
        <p className="pt-2 text-xs text-muted-foreground">
          PIN vergessen? Die Begleitpersonen können sie löschen – dann wählt ihr einfach eine neue.
        </p>
        <button
          type="button"
          onClick={resetToCode}
          className="text-center text-xs text-muted-foreground underline underline-offset-4"
        >
          Anderes Zimmer
        </button>
      </Screen>
    );
  }

  if (screen.kind === "locked") {
    return (
      <Screen
        title="Einen Moment Pause"
        hint={`Nach so vielen Fehlversuchen ist ${
          screen.code ? `Zimmer ${screen.code}` : "dieses Zimmer"
        } für rund ${screen.minutes} Minuten zu. Probiert es gleich nochmal – oder fragt die Begleitpersonen.`}
      >
        <Button
          variant="secondary"
          className="h-14 w-full rounded-2xl text-base"
          onClick={() => {
            setPinInput("");
            setScreen({ kind: "pin", code: screen.code });
          }}
        >
          PIN nochmal eingeben
        </Button>
        <button
          type="button"
          onClick={resetToCode}
          className="text-center text-xs text-muted-foreground underline underline-offset-4"
        >
          Anderes Zimmer
        </button>
      </Screen>
    );
  }

  if (screen.kind === "choose") {
    return (
      <Screen
        title="Wählt eure PIN"
        hint="Vier Ziffern, die ihr euch zu zweit merken könnt. Ab jetzt öffnet ihr euer Zimmer nur noch damit – sie bleibt auf diesem Handy."
      >
        <RoomConfirmation screen={screen} />
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (pinInput.length !== 4) return;
            setPinInput("");
            setScreen({ kind: "confirm", code: screen.code, first: pinInput });
          }}
        >
          <PinDial value={pinInput} onChange={setPinInput} label="Neue Zimmer-PIN" />
          <Button
            type="submit"
            size="lg"
            className="h-14 w-full rounded-2xl text-base"
            disabled={pinInput.length !== 4}
          >
            Weiter
          </Button>
        </form>
        <button
          type="button"
          onClick={resetToCode}
          className="text-center text-xs text-muted-foreground underline underline-offset-4"
        >
          Anderes Zimmer
        </button>
      </Screen>
    );
  }

  if (screen.kind === "confirm") {
    return (
      <Screen
        title="Noch einmal tippen"
        hint="So schreibt ihr euch die PIN nicht irgendwohin."
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (pinInput.length !== 4) return;
            if (pinInput !== screen.first) {
              toast.error("Die beiden PINs sind unterschiedlich. Nochmal von vorn.");
              setPinInput("");
              setScreen({ kind: "choose", code: screen.code });
              return;
            }
            savePin.mutate({ code: screen.code, pin: screen.first });
          }}
        >
          <PinDial value={pinInput} onChange={setPinInput} label="Zimmer-PIN bestätigen" />
          <Button
            type="submit"
            size="lg"
            className="h-14 w-full rounded-2xl text-base"
            disabled={pinInput.length !== 4 || savePin.isPending}
          >
            PIN speichern
          </Button>
        </form>
      </Screen>
    );
  }

  if (state.isLoading || !state.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </div>
    );
  }

  if (!state.data.ok) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p>Für dieses Zimmer ist noch kein Reisetag angelegt.</p>
        <Button variant="secondary" onClick={resetToCode}>
          Zimmer wechseln
        </Button>
      </div>
    );
  }

  const { room, day, submitted, stats } = state.data;
  const days = state.data.days ?? [];
  const dateLabel = formatDateWeekdayLong(day.date);
  const shortDate = (d: string) => formatDayMonth(d);

  if (ziel === "codes") {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-6 py-10">
        <MusicianNav />
        <div>
          <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">Elterncodes</p>
          <h1 className="font-display mt-3 text-3xl">Zimmer {room.roomNumber}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Schickt den Code euren Eltern – sie melden sich auf der Hauptseite unter „Für Eltern“ an.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4">
          {room.roomMembers.some((m) => m.parentCode) ? (
            <div className="space-y-2">
              {room.roomMembers.map((m) =>
                m.parentCode ? (
                  <p key={m.name} className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{m.name}</span>
                    <code className="rounded-md bg-background/60 px-2 py-0.5 font-mono text-foreground">
                      {m.parentCode}
                    </code>
                  </p>
                ) : null,
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Für dieses Zimmer sind noch keine Elterncodes hinterlegt.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={resetToCode}
          className="text-center text-xs text-muted-foreground underline underline-offset-4"
        >
          Anderes Zimmer
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col gap-8 px-6 py-10">
      <MusicianNav />
      <AnnouncementBanner limit={2} />
      <div>
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Tag {day.dayNumber}
          {day.location ? ` · ${day.location}` : ""}
        </p>
        <h1 className="font-display mt-4 text-3xl leading-snug">
          Guten Abend,
          <br />
          Zimmer {room.roomNumber} 🇯🇵
        </h1>
        {room.roomNames.length > 0 && (
          <p className="mt-2 text-lg text-foreground">{room.roomNames.join(" & ")}</p>
        )}
        {room.roomMembers.some((m) => m.parentCode) && (
          <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Elterncode – damit sehen eure Eltern eure Tagesberichte
            </p>
            <div className="mt-2 space-y-1.5">
              {room.roomMembers.map((m) =>
                m.parentCode ? (
                  <p key={m.name} className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{m.name}</span>
                    <code className="rounded-md bg-background/60 px-2 py-0.5 font-mono text-foreground">
                      {m.parentCode}
                    </code>
                  </p>
                ) : null,
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Schickt den Code euren Eltern – sie melden sich auf der Hauptseite unter „Für Eltern“
              an.
            </p>
          </div>
        )}
        <p className="mt-3 text-muted-foreground">{dateLabel}</p>
      </div>

      <div className="washi rounded-3xl p-6">
        {submitted ? (
          <>
            <p className="font-display text-xl">Tag {day.dayNumber} ist festgehalten ✓</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {stats.submitted} von {stats.total} Zimmern haben heute erzählt.
            </p>
            <Button
              variant="secondary"
              className="mt-5 h-12 w-full rounded-2xl"
              onClick={() => navigate({ to: "/tagebuch", search: { day: day.id } })}
            >
              Eintrag noch einmal ansehen
            </Button>
          </>
        ) : (
          <>
            <p className="font-display text-xl">Wie war Japan heute?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              2 Minuten. Haltet den Tag fest, bevor er verschwindet.
            </p>
            <Button
              size="lg"
              className="mt-5 h-14 w-full rounded-2xl text-base"
              onClick={() => navigate({ to: "/tagebuch", search: { day: day.id } })}
            >
              Unsere Geschichte von Tag {day.dayNumber}
            </Button>
          </>
        )}
        {stats.total > 0 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Heute schon dabei: {stats.submitted}/{stats.total} Zimmer{" "}
            {submitted ? MOOD_EMOJI[4] : ""}
          </p>
        )}
      </div>

      {days.length > 0 && (
        <div>
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
            Unsere Reisetage
          </p>
          <div className="mt-3 space-y-2">
            {days.map((d) => {
              const locked = d.submitted;
              return (
                <button
                  key={d.id}
                  type="button"
                  disabled={d.isFuture && !locked}
                  onClick={() => navigate({ to: "/tagebuch", search: { day: d.id } })}
                  className="flex w-full items-center justify-between rounded-2xl border border-border bg-card/60 px-4 py-3 text-left disabled:opacity-40"
                >
                  <span>
                    <span className="font-display text-base">Tag {d.dayNumber}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {shortDate(d.date)}
                      {d.location ? ` · ${d.location}` : ""}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {locked ? "✓ erzählt" : d.isFuture ? "kommt noch" : "offen"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
