import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MusicianNav } from "@/components/musician-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveRoom, setRoomPin } from "@/lib/journal.functions";
import { storeRoomCode, storeRoomPin } from "@/lib/room-storage";

/** Kleine Zimmer-Anmeldung direkt auf einer Unterseite – ohne Umweg über die Hauptseite. */
export function RoomGate({
  title,
  intro,
  onDone,
}: {
  title: string;
  intro: string;
  onDone: (a: { code: string; pin: string }) => void;
}) {
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
        <h1 className="font-display text-3xl leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{intro}</p>
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
