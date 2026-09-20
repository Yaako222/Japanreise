import { getStoredParentCode } from "@/lib/parent-storage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { ColorPicker } from "@/components/color-picker";
import { PushSettings } from "@/components/push-settings";
import { ThemeModePicker } from "@/components/theme-mode-picker";

export const Route = createFileRoute("/eltern-einstellungen")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Einstellungen – Eltern | BOH Japanreise" },
      {
        name: "description",
        content: "Farbe der App und Benachrichtigungen für Eltern auf diesem Handy einstellen.",
      },
      { property: "og:title", content: "Einstellungen – Elternbereich" },
      { property: "og:description", content: "Farbe und Benachrichtigungen einstellen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ParentSettings,
});

function ParentSettings() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    setCode(getStoredParentCode() || null);
  }, []);

  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-5">
      <Link
        to="/eltern"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        <ChevronLeft className="size-3.5" /> Zum Elternbereich
      </Link>
      <header>
        <h1 className="font-display text-2xl">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gilt für dieses Handy. Sie können alles jederzeit wieder ändern.
        </p>
      </header>
      <ColorPicker />
      <ThemeModePicker />
      <PushSettings
        audience="parent"
        parentCode={code}
        what={["Neue Ankündigungen der Reiseleitung", "Wichtige Hinweise zur Reise"]}
      />
    </main>
  );
}
