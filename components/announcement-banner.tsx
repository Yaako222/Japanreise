import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Megaphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDayMonth } from "@/lib/date";
import {
  markAnnouncementRead,
  myAnnouncementReads,
  publicAnnouncements,
  type Announcement,
} from "@/lib/content.functions";
import {
  getStoredRoomCode,
  getStoredRoomPin,
  storeRoomCode,
  storeRoomPin,
} from "@/lib/room-storage";

/** Ankündigungen der Begleitpersonen – sichtbar für alle Teilnehmenden. */
export function AnnouncementBanner({ limit = 3 }: { limit?: number }) {
  const load = useServerFn(publicAnnouncements);
  const loadReads = useServerFn(myAnnouncementReads);
  const mark = useServerFn(markAnnouncementRead);
  const queryClient = useQueryClient();

  // Raum-Anmeldung kann nach dem Markieren hinzukommen (Neu-Render via State)
  const [auth, setAuth] = useState<{ code: string; pin: string } | null>(() => {
    const code = getStoredRoomCode();
    const pin = getStoredRoomPin();
    return code && pin ? { code, pin } : null;
  });
  const [askFor, setAskFor] = useState<string | null>(null);
  const [roomInput, setRoomInput] = useState("");
  const [pinInput, setPinInput] = useState("");

  const q = useQuery({
    queryKey: ["announcements"],
    queryFn: () => load({}),
    refetchInterval: 60_000,
  });

  const reads = useQuery({
    queryKey: ["announcement-reads", auth?.code],
    queryFn: () => loadReads({ data: auth! }),
    enabled: Boolean(auth),
  });

  const confirm = useMutation({
    mutationFn: (input: { announcementId: string; code: string; pin: string }) =>
      mark({ data: input }),
    onSuccess: (res, vars) => {
      if (!res.ok) {
        toast.error("Zimmernummer oder PIN stimmt nicht.");
        return;
      }
      storeRoomCode(vars.code);
      storeRoomPin(vars.pin);
      setAuth({ code: vars.code, pin: vars.pin });
      setAskFor(null);
      setRoomInput("");
      setPinInput("");
      queryClient.invalidateQueries({ queryKey: ["announcement-reads"] });
    },
    onError: () => toast.error("Konnte nicht gespeichert werden."),
  });

  const items: Announcement[] = (q.data?.announcements ?? []).slice(0, limit);
  if (!items.length) return null;

  const readIds = new Set(reads.data?.ids ?? []);

  return (
    <div className="space-y-2">
      {items.map((a) => {
        const isRead = auth !== null && readIds.has(a.id);
        if (isRead) {
          // Verkleinerte Ansicht für bereits gelesene Ankündigungen
          return (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5"
            >
              <Check className="size-3 shrink-0 text-primary" />
              <p className="truncate text-xs text-muted-foreground">{a.title}</p>
              <span className="ml-auto shrink-0 text-[10px] tracking-wide text-muted-foreground uppercase">
                gelesen
              </span>
            </div>
          );
        }
        return (
          <div
            key={a.id}
            className={`rounded-2xl border p-4 ${
              a.level === "wichtig"
                ? "border-primary bg-primary/15"
                : "border-border bg-card/60"
            }`}
          >
            <p className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
              <Megaphone className="size-3.5" />
              {a.level === "wichtig" ? "Wichtig" : "Ankündigung"} ·{" "}
              {formatDayMonth(a.createdAt)}
            </p>
            <p className="font-display mt-1.5 text-base">{a.title}</p>
            {a.body && (
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {a.body}
              </p>
            )}

            {auth ? (
              <button
                type="button"
                onClick={() =>
                  confirm.mutate({ announcementId: a.id, code: auth.code, pin: auth.pin })
                }
                disabled={confirm.isPending}
                className="mt-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                Gelesen ✓
              </button>
            ) : askFor === a.id ? (
              <form
                className="mt-3 flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!/^\d{1,3}$/.test(roomInput.trim()) || !/^\d{4}$/.test(pinInput)) return;
                  confirm.mutate({
                    announcementId: a.id,
                    code: roomInput.trim(),
                    pin: pinInput,
                  });
                }}
              >
                <input
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="Zimmer"
                  aria-label="Zimmernummer"
                  inputMode="numeric"
                  className="w-20 rounded-full border border-border bg-background px-3 py-1 text-xs"
                />
                <input
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="PIN"
                  aria-label="Zimmer-PIN"
                  inputMode="numeric"
                  type="password"
                  className="w-20 rounded-full border border-border bg-background px-3 py-1 text-xs"
                />
                <button
                  type="submit"
                  disabled={confirm.isPending}
                  className="rounded-full border border-primary bg-primary/15 px-3 py-1 text-xs"
                >
                  Bestätigen
                </button>
                <button
                  type="button"
                  onClick={() => setAskFor(null)}
                  className="text-xs text-muted-foreground"
                >
                  Abbrechen
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setAskFor(a.id)}
                className="mt-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                Gelesen ✓
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
