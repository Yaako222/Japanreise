import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ColorPicker } from "@/components/color-picker";
import { PushSettings } from "@/components/push-settings";
import { ThemeModePicker } from "@/components/theme-mode-picker";

export const Route = createFileRoute("/dirigent-einstellungen")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Einstellungen – Dirigent | BOH Japanreise" },
      {
        name: "description",
        content: "Farbe der App und Benachrichtigungen für den Probenbereich einstellen.",
      },
      { property: "og:title", content: "Einstellungen – Probenbereich" },
      { property: "og:description", content: "Farbe und Benachrichtigungen einstellen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConductorSettings,
});

function ConductorSettings() {
  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-5">
      <Link
        to="/dirigent"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        <ChevronLeft className="size-3.5" /> Zum Probenbereich
      </Link>
      <header>
        <h1 className="font-display text-2xl">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gilt für dieses Handy. Alles lässt sich jederzeit umstellen.
        </p>
      </header>
      <ColorPicker />
      <ThemeModePicker />
      <PushSettings
        audience="conductor"
        what={["Wichtige Ankündigungen der Reiseleitung", "Programmänderungen"]}
      />
    </main>
  );
}
