import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackToOptions({ to = "/musiker" }: { to?: "/musiker" }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 self-start rounded-xl border border-border bg-card/70 px-3 py-2 text-sm text-foreground"
    >
      <ChevronLeft className="size-4" /> Zurück zu allen Optionen
    </Link>
  );
}
