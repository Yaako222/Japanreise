import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoredThemeMode, storeThemeMode, type ThemeMode } from "@/lib/theme-mode";

export function ThemeModePicker() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredThemeMode());

  const choose = (next: ThemeMode) => {
    setMode(next);
    storeThemeMode(next);
  };

  return (
    <section className="washi space-y-3 rounded-2xl p-4">
      <p className="text-sm font-medium">Darstellung</p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Darstellung wählen">
        <Button
          type="button"
          variant={mode === "light" ? "default" : "secondary"}
          onClick={() => choose("light")}
        >
          <Sun className="size-4" /> Hell
        </Button>
        <Button
          type="button"
          variant={mode === "dark" ? "default" : "secondary"}
          onClick={() => choose("dark")}
        >
          <Moon className="size-4" /> Dunkel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Die gewählte Akzentfarbe bleibt erhalten.</p>
    </section>
  );
}