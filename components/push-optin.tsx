import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getVapidKey, savePushSubscription, deletePushSubscription } from "@/lib/push.functions";

type Audience = "room" | "staff" | "parent";

const DISMISS_KEY = "jj_push_dismissed";

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

export function PushOptIn({
  audience,
  parentCode,
  className,
}: {
  audience: Audience;
  parentCode?: string | null;
  className?: string;
}) {
  const saveSub = useServerFn(savePushSubscription);
  const removeSub = useServerFn(deletePushSubscription);
  const loadKey = useServerFn(getVapidKey);

  const [state, setState] = useState<"loading" | "unsupported" | "ios-hint" | "off" | "on">("loading");
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (!cancelled) setState(isIos() && !isStandalone() ? "ios-hint" : "unsupported");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setState(sub && Notification.permission === "granted" ? "on" : "off");
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
        toast.error("Das Handy hat Mitteilungen blockiert. Bitte in den Einstellungen erlauben.");
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
      setState("off");
      toast.success("Mitteilungen sind aus.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading" || state === "unsupported") return null;

  if (state === "ios-hint") {
    if (dismissed) return null;
    return (
      <div className={`washi rounded-2xl border border-border/60 p-4 text-sm ${className ?? ""}`}>
        <p className="font-medium">Mitteilungen aufs iPhone</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Öffne diese Seite in Safari, tippe auf „Teilen" und dann auf „Zum Home-Bildschirm". Danach kannst du
          hier Mitteilungen einschalten.
        </p>
        <button
          className="mt-2 text-xs text-muted-foreground underline"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
        >
          Nicht mehr anzeigen
        </button>
      </div>
    );
  }

  if (state === "on") {
    return (
      <button
        onClick={disable}
        disabled={busy}
        className={`inline-flex items-center gap-2 text-xs text-muted-foreground underline ${className ?? ""}`}
      >
        <BellOff className="size-3.5" /> Mitteilungen ausschalten
      </button>
    );
  }

  if (dismissed) {
    return (
      <button
        onClick={enable}
        disabled={busy}
        className={`inline-flex items-center gap-2 text-xs text-muted-foreground underline ${className ?? ""}`}
      >
        <Bell className="size-3.5" /> Mitteilungen einschalten
      </button>
    );
  }

  return (
    <div className={`washi rounded-2xl border border-border/60 p-4 ${className ?? ""}`}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Bell className="size-4" /> Benachrichtigungen einschalten?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Dann erfährst du sofort, wenn es Neuigkeiten, Programmänderungen oder eine Antwort auf einen Ausgang
        gibt.
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={enable} disabled={busy}>
          Ja, einschalten
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
        >
          Später
        </Button>
      </div>
    </div>
  );
}
