import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, BellOff, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getVapidKey,
  savePushSubscription,
  deletePushSubscription,
  sendTestPush,
} from "@/lib/push.functions";

type Audience = "room" | "staff" | "parent" | "conductor";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

function keyToBase64(key: ArrayBuffer | null) {
  if (!key) return "";
  const bytes = new Uint8Array(key);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]!);
  return window.btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (window.navigator as unknown as { standalone?: boolean }).standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

/** Vollständige Ein/Aus-Einstellung für Benachrichtigungen – pro Gerät und Person. */
export function PushSettings({
  audience,
  parentCode,
  what,
}: {
  audience: Audience;
  parentCode?: string | null;
  what: string[];
}) {
  const saveSub = useServerFn(savePushSubscription);
  const removeSub = useServerFn(deletePushSubscription);
  const loadKey = useServerFn(getVapidKey);
  const testPush = useServerFn(sendTestPush);

  const [state, setState] = useState<"loading" | "unsupported" | "ios-hint" | "off" | "on">("loading");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (!cancelled) setState(isIos() && !isStandalone() ? "ios-hint" : "unsupported");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        if (cancelled) return;
        setEndpoint(sub?.endpoint ?? null);
        setState(sub && Notification.permission === "granted" ? "on" : "off");
      } catch {
        if (!cancelled) setState("unsupported");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Das Handy hat Mitteilungen blockiert. Bitte in den Handy-Einstellungen erlauben.");
        return;
      }
      const { key } = await loadKey();
      if (!key) {
        toast.error("Mitteilungen sind gerade nicht eingerichtet.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
        }));
      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      await saveSub({
        data: {
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh ?? keyToBase64(sub.getKey("p256dh")),
          auth: json.keys?.auth ?? keyToBase64(sub.getKey("auth")),
          audience,
          parentCode: parentCode ?? null,
          userAgent: navigator.userAgent.slice(0, 200),
        },
      });
      setEndpoint(sub.endpoint);
      setState("on");
      toast.success("Mitteilungen sind an.");
    } catch (err) {
      console.error(err);
      toast.error("Das hat leider nicht geklappt.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removeSub({ data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setEndpoint(null);
      setState("off");
      toast.success("Mitteilungen sind aus.");
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    if (!endpoint) return;
    setBusy(true);
    try {
      const res = await testPush({ data: { endpoint } });
      if (res.ok) toast.success("Test verschickt – schau auf dein Handy.");
      else toast.error("Test hat nicht geklappt. Bitte aus- und wieder einschalten.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="washi space-y-3 rounded-2xl border border-border/60 p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Bell className="size-4" /> Benachrichtigungen
      </p>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {what.map((w) => (
          <li key={w}>• {w}</li>
        ))}
      </ul>

      {state === "loading" && <p className="text-xs text-muted-foreground">Einen Moment …</p>}

      {state === "unsupported" && (
        <p className="text-xs text-muted-foreground">
          Dieses Gerät kann leider keine Mitteilungen anzeigen.
        </p>
      )}

      {state === "ios-hint" && (
        <p className="text-xs text-muted-foreground">
          Auf dem iPhone zuerst in Safari „Teilen" → „Zum Home-Bildschirm" tippen. Danach lassen sich hier
          Mitteilungen einschalten.
        </p>
      )}

      {state === "off" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Gerade aus.</p>
          <Button size="sm" onClick={enable} disabled={busy}>
            <Bell className="size-4" /> Einschalten
          </Button>
        </div>
      )}

      {state === "on" && (
        <div className="space-y-2">
          <p className="text-xs text-primary">Eingeschaltet auf diesem Gerät.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={test} disabled={busy}>
              <Send className="size-4" /> Test schicken
            </Button>
            <Button size="sm" variant="ghost" onClick={disable} disabled={busy}>
              <BellOff className="size-4" /> Ausschalten
            </Button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        Wichtige Ankündigungen vibrieren kräftiger und länger und bleiben stehen, bis ihr sie wegtippt.
      </p>
    </section>
  );
}
