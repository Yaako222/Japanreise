import { createFileRoute } from "@tanstack/react-router";
import { RoomOnly } from "@/components/room-only";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MusicianNav } from "@/components/musician-nav";
import { OutingRule } from "@/components/outing-rule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cancelOuting,
  MAX_MEMBERS,
  outingState,
  reportOutingReturn,
  submitOuting,
} from "@/lib/outing.functions";
import { resolveRoom, setRoomPin } from "@/lib/journal.functions";
import {
  getStoredRoomCode,
  getStoredRoomPin,
  storeRoomCode,
  storeRoomPin,
} from "@/lib/room-storage";

export const Route = createFileRoute("/ausgang")({
  head: () => ({
    meta: [
      { title: "Ausgang beantragen – BOH Japanreise" },
      {
        name: "description",
        content:
          "Zu zweit losziehen: Uhrzeit und Rückkehr eintragen, eine Begleitperson bestätigt den Antrag.",
      },
      { property: "og:title", content: "Ausgang beantragen – BOH Japanreise" },
      {
        property: "og:description",
        content: "Antrag für den Abend – erst nach Bestätigung durch eine Begleitperson gültig.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  component: () => (
    <RoomOnly>
      <OutingPage />
    </RoomOnly>
  ),
});

const STATUS_LABEL = {
  pending: "Wartet auf Bestätigung",
  approved: "✓ Bestätigt – ihr dürft los",
  rejected: "✕ Abgelehnt",
} as const;

function OutingPage() {
  const queryClient = useQueryClient();
  const load = useServerFn(outingState);
  const send = useServerFn(submitOuting);
  const drop = useServerFn(cancelOuting);
  const back = useServerFn(reportOutingReturn);


  const [auth, setAuth] = useState<{ code: string; pin: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<"room" | "half" | "custom">("room");
  const [search, setSearch] = useState("");
  const toggleMember = (id: string) =>
    setMemberIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_MEMBERS
          ? prev
          : [...prev, id],
    );
  const [leaveTime, setLeaveTime] = useState("18:00");
  const [returnTime, setReturnTime] = useState("20:30");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const code = getStoredRoomCode();
    const pin = getStoredRoomPin();
    if (code && pin) setAuth({ code, pin });
    setChecked(true);
  }, []);

  const q = useQuery({
    queryKey: ["outing", auth?.code],
    queryFn: () => {
      if (!auth) throw new Error("Zimmer-Anmeldung fehlt");
      return load({ data: auth });
    },
    enabled: Boolean(auth),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const create = useMutation({
    mutationFn: () =>
      send({
        data: { ...(auth ?? { code: "", pin: "" }), memberIds, leaveTime, returnTime, reason },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Antrag abgeschickt – eine Begleitperson schaut gleich drauf.");
      setReason("");
      setMemberIds([]);
      queryClient.invalidateQueries({ queryKey: ["outing"] });
    },
    onError: () => toast.error("Das hat nicht geklappt."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { ...(auth ?? { code: "", pin: "" }), id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outing"] }),
    onError: () => toast.error("Zurückziehen hat nicht geklappt."),
  });

  const reportBack = useMutation({
    mutationFn: (id: string) => back({ data: { ...(auth ?? { code: "", pin: "" }), id } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Danke – eure Rückkehr ist vermerkt.");
      queryClient.invalidateQueries({ queryKey: ["outing"] });
    },
    onError: () => toast.error("Das hat nicht geklappt."),
  });


  if (!checked)
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </div>
    );

  if (!auth) return <RoomGate onDone={(a) => setAuth(a)} />;

  if (q.isLoading)
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Einen Moment …
      </div>
    );

  if (q.isError)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p>Bitte meldet euch noch einmal mit Zimmernummer und PIN an.</p>
        <Button onClick={() => setAuth(null)}>Zur Anmeldung</Button>
      </div>
    );

  if (!q.data) return null;

  const data = q.data;
  const selected = data.everyone.filter((p) => memberIds.includes(p.id));
  const minors = selected.filter((p) => p.age != null && p.age < 16);
  const groupLatest = selected.length
    ? selected.reduce((min, p) => (p.returnLatest < min ? p.returnLatest : min), "23:59")
    : data.returnLatest;
  const showTime = (t: string) => (t === "23:59" ? "24:00" : t);
  const canSubmit =
    memberIds.length >= 2 && memberIds.length <= MAX_MEMBERS && !data.deadlinePassed;
  const visibleRequests = data.requests.filter(
    (r) =>
      r.status !== "rejected" ||
      !r.decidedAt ||
      Date.now() - new Date(r.decidedAt).getTime() < 3 * 60 * 1000,
  );
  const selectablePeople = selectionMode === "custom" ? data.everyone : data.members;
  const filteredPeople = selectablePeople.filter((person) =>
    person.name.toLocaleLowerCase("de").includes(search.trim().toLocaleLowerCase("de")),
  );

  const chooseMode = (mode: "room" | "half" | "custom") => {
    setSelectionMode(mode);
    setSearch("");
    setMemberIds(mode === "room" ? data.members.slice(0, MAX_MEMBERS).map((person) => person.id) : []);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-6 py-10">
      <MusicianNav />

      <div>
        <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Zimmer {data.room.roomNumber}
          {data.day ? ` · Tag ${data.day.dayNumber}` : ""}
        </p>
        <h1 className="font-display mt-3 text-3xl leading-tight">Ausgang beantragen</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nie allein – bis zu {MAX_MEMBERS} Personen. Antrag bis {data.deadline} Uhr. Zurück
          spätestens: unter 16 Jahren 22:00 Uhr, ab 16 Jahren 24:00 Uhr.
          Erst wenn eine Begleitperson bestätigt, dürft ihr los.
        </p>
      </div>


      {visibleRequests.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">Heute</p>
          {visibleRequests.map((r) => {
            const own = r.roomId === data.room.id;
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-card/60 p-4">
                <p className="font-display text-base">{r.memberNames.join(", ")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.leaveTime} – {r.returnTime} Uhr{r.reason ? ` · ${r.reason}` : ""}
                </p>
                {!own && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Beantragt von Zimmer {r.roomNumber}
                  </p>
                )}
                <p
                  className={`mt-2 text-sm ${
                    r.status === "approved"
                      ? "text-primary"
                      : r.status === "rejected"
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {STATUS_LABEL[r.status]}
                </p>
                {r.decisionNote && (
                  <p className="mt-1 rounded-xl border border-border bg-background/40 p-3 text-sm">
                    {r.status === "rejected" ? "Begründung: " : "Hinweis: "}
                    {r.decisionNote}
                  </p>
                )}
                {r.status === "approved" &&
                  (r.returnedAt ? (
                    <p className="mt-2 text-sm text-primary">
                      ✓ Zurückgemeldet – die Begleitpersonen sehen das.
                    </p>
                  ) : (
                    <Button
                      size="sm"
                      className="mt-3 h-11 w-full rounded-xl"
                      disabled={reportBack.isPending}
                      onClick={() => reportBack.mutate(r.id)}
                    >
                      Wir sind zurück im Hotel
                    </Button>
                  ))}
                {r.status === "pending" &&
                  (own ? (
                    <button
                      type="button"
                      onClick={() => remove.mutate(r.id)}
                      className="mt-2 text-xs text-muted-foreground underline underline-offset-4"
                    >
                      Antrag zurückziehen
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Zurückziehen kann nur Zimmer {r.roomNumber}.
                    </p>
                  ))}
              </div>
            );
          })}
        </section>
      )}

      <OutingRule rejected={visibleRequests.some((r) => r.status === "rejected")} />

      {data.deadlinePassed ? (
        <p className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          Es ist nach {data.deadline} Uhr – heute geht kein Antrag mehr. Sprecht eine Begleitperson
          direkt an.
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              Wer geht mit? (mindestens 2, höchstens {MAX_MEMBERS})
            </span>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Personenauswahl">
              <Button type="button" size="sm" variant={selectionMode === "room" ? "default" : "secondary"} onClick={() => chooseMode("room")}>
                Ganzes Zimmer
              </Button>
              <Button type="button" size="sm" variant={selectionMode === "half" ? "default" : "secondary"} onClick={() => chooseMode("half")}>
                Halbes Zimmer
              </Button>
              <Button type="button" size="sm" variant={selectionMode === "custom" ? "default" : "secondary"} onClick={() => chooseMode("custom")}>
                Eigene Gruppe
              </Button>
            </div>
            {selectionMode === "custom" && (
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Namen suchen …"
                aria-label="Person suchen"
                className="h-11 bg-background/40"
              />
            )}
            {selectionMode === "half" && (
              <p className="text-xs text-muted-foreground">Wählt hier die Personen aus eurem Zimmer aus.</p>
            )}
            <div className="flex flex-wrap gap-2">
              {filteredPeople.map((p) => {
                const active = memberIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleMember(p.id)}
                    className={`rounded-full border px-3 py-2 text-sm transition ${
                      active
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-background/40 text-muted-foreground"
                    }`}
                  >
                    {active ? "✓ " : ""}
                    {p.name}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{memberIds.length} ausgewählt</p>
          </div>


          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm text-muted-foreground">Los um</span>
              <Input
                type="time"
                value={leaveTime}
                onChange={(e) => setLeaveTime(e.target.value)}
                className="h-12 rounded-xl bg-background/40 text-base"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-muted-foreground">Zurück um</span>
              <Input
                type="time"
                value={returnTime}
                max={groupLatest}
                onChange={(e) => setReturnTime(e.target.value)}
                className="h-12 rounded-xl bg-background/40 text-base"
              />
              <span className="block text-[11px] text-muted-foreground">
                Spätestens {showTime(groupLatest)} Uhr
                {minors.length
                  ? ` – ${minors.map((p) => p.name).join(", ")} ${
                      minors.length === 1 ? "ist" : "sind"
                    } unter 16.`
                  : ""}
              </span>
            </label>

          </div>

          <label className="block space-y-1.5">
            <span className="text-sm text-muted-foreground">Wohin / warum?</span>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 300))}
              placeholder="z. B. Konbini um die Ecke"
              className="h-12 rounded-xl bg-background/40 text-base"
            />
          </label>

          <Button
            type="submit"
            size="lg"
            className="h-14 w-full rounded-2xl text-base"
            disabled={!canSubmit || create.isPending}
          >
            Antrag abschicken
          </Button>
        </form>
      )}
    </main>
  );
}


/** Kleine Anmeldung direkt auf der Ausgang-Seite – ohne Umweg über die Hauptseite. */
function RoomGate({ onDone }: { onDone: (a: { code: string; pin: string }) => void }) {
  const resolve = useServerFn(resolveRoom);
  const choosePin = useServerFn(setRoomPin);

  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await resolve({ data: { code: code.trim(), pin: pin || undefined } });
      if (!res.ok) {
        setError(
          res.reason === "unknown"
            ? "Diese Zimmernummer kennen wir nicht."
            : res.reason === "locked"
              ? `Zu viele Fehlversuche – bitte in ${res.retryInMinutes ?? 10} Minuten noch einmal.`
              : "Das war die falsche PIN.",
        );
        return;
      }
      if (res.needsPinSetup) {
        setNeedsSetup(true);
        return;
      }
      storeRoomCode(code.trim());
      storeRoomPin(pin);
      onDone({ code: code.trim(), pin });
    } catch {
      setError("Das hat nicht geklappt – bitte noch einmal versuchen.");
    } finally {
      setBusy(false);
    }
  };

  const setup = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await choosePin({ data: { code: code.trim(), pin: newPin } });
      if (!res.ok) {
        setError("Die PIN konnte nicht gespeichert werden – bitte noch einmal.");
        return;
      }
      storeRoomCode(code.trim());
      storeRoomPin(newPin);
      onDone({ code: code.trim(), pin: newPin });
    } catch {
      setError("Das hat nicht geklappt – bitte noch einmal versuchen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-6 py-10">
      <MusicianNav />
      <div>
        <h1 className="font-display text-3xl leading-tight">Ausgang beantragen</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dafür braucht ihr euer Zimmer: Zimmernummer eingeben, dann eure PIN.
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (needsSetup) void setup();
          else void open();
        }}
      >
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
          placeholder="Zimmernummer"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Zimmernummer"
          disabled={needsSetup}
          className="h-14 rounded-xl bg-background/40 text-center text-2xl tracking-[0.3em]"
        />
        {needsSetup ? (
          <>
            <p className="text-sm text-muted-foreground">
              Euer Zimmer hat noch keine PIN – wählt jetzt gemeinsam vier Ziffern.
            </p>
            <Input
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Neue PIN (4 Ziffern)"
              inputMode="numeric"
              autoComplete="off"
              aria-label="Neue PIN"
              className="h-14 rounded-xl bg-background/40 text-center text-2xl tracking-[0.3em]"
            />
          </>
        ) : (
          <Input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="PIN (4 Ziffern)"
            inputMode="numeric"
            autoComplete="off"
            aria-label="Zimmer-PIN"
            className="h-14 rounded-xl bg-background/40 text-center text-2xl tracking-[0.3em]"
          />
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          size="lg"
          className="h-14 w-full rounded-2xl text-base"
          disabled={busy || !code.trim() || (needsSetup ? newPin.length !== 4 : pin.length !== 4)}
        >
          {needsSetup ? "PIN speichern & weiter" : "Weiter"}
        </Button>
      </form>
    </main>
  );
}
