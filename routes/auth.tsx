import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyStaffCode } from "@/lib/staff.functions";
import { getStoredStaffCode, storeStaffCode } from "@/lib/staff-storage";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Anmeldung Begleitpersonen – BOH Japanreise" },
      {
        name: "description",
        content: "Geschützter Bereich für die Reisebegleitung des Kulturaustauschs.",
      },
      { property: "og:title", content: "Anmeldung Begleitpersonen – BOH Japanreise" },
      {
        property: "og:description",
        content: "Geschützter Bereich für die Reisebegleitung des Kulturaustauschs.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const verify = useServerFn(verifyStaffCode);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // Gespeicherter Code: automatisch anmelden, ohne erneute Eingabe.
  useEffect(() => {
    const stored = getStoredStaffCode();
    if (!stored) return;
    let cancelled = false;
    setBusy(true);
    verify({
      data: { code: stored, device: typeof navigator !== "undefined" ? navigator.userAgent : undefined },
    })
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          storeStaffCode(result.code);
          navigate({ to: "/admin" });
        } else {
          setBusy(false);
        }
      })
      .catch(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await verify({
        data: { code, device: typeof navigator !== "undefined" ? navigator.userAgent : undefined },
      });
      if (!result.ok) {
        toast.error("Dieser Code stimmt nicht.");
        return;
      }
      storeStaffCode(result.code);
      navigate({ to: "/admin" });
    } catch {
      toast.error("Anmeldung gerade nicht möglich. Bitte nochmal versuchen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1 self-start text-xs text-muted-foreground underline-offset-4"
      >
        <ChevronLeft className="size-4" /> Zurück
      </Link>
      <p className="text-sm tracking-[0.3em] text-muted-foreground uppercase">BOH Japanreise</p>
      <h1 className="font-display mt-3 text-3xl">Bereich für Begleitpersonen</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bitte den Begleiter-Code eingeben. Den Code bekommt ihr von der Reiseleitung.
      </p>

      <form className="mt-8 space-y-4" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="staff-code">Begleiter-Code</Label>
          <Input
            id="staff-code"
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-12 rounded-2xl bg-card/70 text-center text-lg tracking-[0.2em] uppercase"
          />
        </div>
        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={busy || code.trim().length < 3}>
          {busy ? "Prüfe …" : "Weiter"}
        </Button>
      </form>
    </div>
  );
}
