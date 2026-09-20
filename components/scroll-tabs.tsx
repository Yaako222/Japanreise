import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontal scrollbarer Menüstreifen mit Pfeilen an den Rändern,
 * sobald es in die jeweilige Richtung noch mehr zu sehen gibt.
 */
export function ScrollTabs({
  children,
  ariaLabel,
  className = "gap-2",
}: {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const nudge = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * 180, behavior: "smooth" });

  const arrowCls =
    "absolute top-0 bottom-1 z-10 flex w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          aria-label="Weitere Optionen links"
          onClick={() => nudge(-1)}
          className={`${arrowCls} left-0 bg-gradient-to-r from-background via-background/90 to-transparent`}
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      <nav
        ref={ref}
        aria-label={ariaLabel}
        className={`flex overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {children}
      </nav>
      {canRight && (
        <button
          type="button"
          aria-label="Weitere Optionen rechts"
          onClick={() => nudge(1)}
          className={`${arrowCls} right-0 bg-gradient-to-l from-background via-background/90 to-transparent`}
        >
          <ChevronRight className="size-4 animate-pulse" />
        </button>
      )}
    </div>
  );
}
