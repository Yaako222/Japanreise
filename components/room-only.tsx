import { useEffect, useState, type ReactNode } from "react";
import { RoomGate } from "@/components/room-gate";
import { getStoredRoomCode, getStoredRoomPin } from "@/lib/room-storage";

/**
 * Schützt alle Musiker-Seiten: ohne Zimmernummer und PIN kommt man nicht hinein.
 * Die Anmeldung bleibt bis zum Abmelden bestehen.
 */
export function RoomOnly({ children }: { children: ReactNode }) {
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

  return <>{children}</>;
}
