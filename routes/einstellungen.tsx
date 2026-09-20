import { createFileRoute } from "@tanstack/react-router";
import { RoomOnly } from "@/components/room-only";
import { MusicianNav } from "@/components/musician-nav";
import { PushSettings } from "@/components/push-settings";
import { ColorPicker } from "@/components/color-picker";
import { ThemeModePicker } from "@/components/theme-mode-picker";

export const Route = createFileRoute("/einstellungen")({
  head: () => ({
    meta: [
      { title: "Einstellungen – BOH Japanreise" },
      {
        name: "description",
        content: "Benachrichtigungen der BOH Japanreise-App auf diesem Handy ein- oder ausschalten.",
      },
      { property: "og:title", content: "Einstellungen – BOH Japanreise" },
      {
        property: "og:description",
        content: "Benachrichtigungen ein- oder ausschalten und einen Test verschicken.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  component: () => (
    <RoomOnly>
      <SettingsPage />
    </RoomOnly>
  ),
});

function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-5">
      <MusicianNav />
      <header>
        <h1 className="font-display text-2xl">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gilt für dieses Handy. Du kannst jederzeit wieder umschalten.
        </p>
      </header>
      <ColorPicker />
      <ThemeModePicker />
      <PushSettings
        audience="room"
        what={[
          "Neue Ankündigungen der Reiseleitung",
          "Programmänderungen (z. B. Mittagessen früher)",
          "Antwort auf euren Ausgangs-Antrag",
          "Abends die Erinnerung an den Tagesbericht",
        ]}
      />
    </main>
  );
}
