import { useEffect, useRef, useState } from "react";
import { Palette, RotateCcw } from "lucide-react";
import { DEFAULT_HUE, applyHue, getStoredHue, hueToCss, storeHue } from "@/lib/theme-color";

const PRESETS = [29, 55, 95, 150, 200, 250, 300, 340];

/** Farbkreis: Tippen oder Ziehen wählt die Akzentfarbe der App. */
export function ColorPicker() {
  const [hue, setHue] = useState(DEFAULT_HUE);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const stored = getStoredHue();
    setHue(stored);
    applyHue(stored);
  }, []);

  const pick = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = clientX - (r.left + r.width / 2);
    const y = clientY - (r.top + r.height / 2);
    const deg = (Math.atan2(y, x) * 180) / Math.PI;
    const next = Math.round((deg + 360) % 360);
    setHue(next);
    applyHue(next);
    storeHue(next);
  };

  return (
    <section className="washi space-y-4 rounded-2xl border border-border/60 p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Palette className="size-4" /> Farbe der App
      </p>
      <p className="text-xs text-muted-foreground">
        Tippt in den Farbkreis – die App färbt sich sofort um. Gilt nur auf diesem Handy.
      </p>

      <div className="flex items-center gap-5">
        <div
          ref={ref}
          role="slider"
          tabIndex={0}
          aria-label="Farbkreis"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={hue}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            pick(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (dragging.current) pick(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            const next = (hue + (e.key === "ArrowRight" ? 6 : -6) + 360) % 360;
            setHue(next);
            applyHue(next);
            storeHue(next);
          }}
          className="relative size-32 shrink-0 touch-none rounded-full"
          style={{
            background:
              "conic-gradient(oklch(0.63 0.19 0), oklch(0.63 0.19 60), oklch(0.63 0.19 120), oklch(0.63 0.19 180), oklch(0.63 0.19 240), oklch(0.63 0.19 300), oklch(0.63 0.19 360))",
          }}
        >
          <div className="absolute inset-6 rounded-full bg-background" />
          <div
            className="absolute size-6 rounded-full border-2 border-background shadow"
            style={{
              background: hueToCss(hue),
              left: `calc(50% + ${Math.cos((hue * Math.PI) / 180) * 48}px - 12px)`,
              top: `calc(50% + ${Math.sin((hue * Math.PI) / 180) * 48}px - 12px)`,
            }}
          />
          <div
            className="absolute inset-0 m-auto size-10 rounded-full"
            style={{ background: hueToCss(hue) }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((h) => (
            <button
              key={h}
              type="button"
              aria-label={`Farbe ${h}`}
              onClick={() => {
                setHue(h);
                applyHue(h);
                storeHue(h);
              }}
              className={`size-8 rounded-full border-2 transition ${
                Math.abs(h - hue) < 4 ? "border-foreground" : "border-transparent"
              }`}
              style={{ background: hueToCss(h) }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setHue(DEFAULT_HUE);
          applyHue(DEFAULT_HUE);
          storeHue(DEFAULT_HUE);
        }}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        <RotateCcw className="size-3.5" /> Wieder Orange
      </button>
    </section>
  );
}
