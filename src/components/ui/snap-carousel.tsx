"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Variant = "featured" | "compact";

interface SnapCarouselContextValue {
  variant: Variant;
  /** When true, the layout is a grid at md+, so items should drop their fixed width. */
  hasGridFallback: boolean;
}

const SnapCarouselContext = createContext<SnapCarouselContextValue>({
  variant: "compact",
  hasGridFallback: false,
});

interface SnapCarouselProps {
  children: ReactNode;
  /**
   * "compact" — multi-card scroller (~2.3 cards visible), snaps to start. Spotify default rows.
   * "featured" — one large card centered with neighbor halves peeking on both sides.
   */
  variant?: Variant;
  /**
   * Tailwind grid classes applied at md+ so the carousel falls back to a grid on desktop.
   * Omit to keep a horizontal scroller at all breakpoints (e.g. artist rows).
   */
  mdGridClassName?: string;
  /** Show hover arrow buttons on desktop (only meaningful when staying horizontal). */
  arrows?: boolean;
  /** Auto-advance the track on an interval. Pauses on hover/touch and respects reduced-motion. */
  autoPlay?: boolean;
  /** Auto-advance cadence in ms (default 4000). */
  autoPlayInterval?: number;
  className?: string;
}

/**
 * Native CSS scroll-snap carousel. The snap is hardware-accelerated and JS-free;
 * the optional arrows only nudge `scrollBy` on desktop. Mobile-first: on phones the
 * track bleeds edge-to-edge so neighbor cards peek; at md+ it can fall back to a grid.
 */
export function SnapCarousel({
  children,
  variant = "compact",
  mdGridClassName,
  arrows = false,
  autoPlay = false,
  autoPlayInterval = 4000,
  className = "",
}: SnapCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasGridFallback = Boolean(mdGridClassName);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Auto-advance: nudge the track forward, looping to the start at the end.
  // Pauses while the user interacts and is disabled under prefers-reduced-motion.
  useEffect(() => {
    if (!autoPlay) return;
    const el = scrollRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });

    const id = window.setInterval(() => {
      if (paused) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      if (scrollLeft + clientWidth >= scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: clientWidth * 0.8, behavior: "smooth" });
      }
    }, autoPlayInterval);

    return () => {
      window.clearInterval(id);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [autoPlay, autoPlayInterval]);

  // The compact scroller stays inside the page gutter (cards align with the
  // section headers, not the screen edge). The featured variant still bleeds so
  // the centered card can sit mid-screen with neighbours peeking.
  const bleed =
    variant === "featured"
      ? "-mx-5 px-[10vw] md:mx-0 md:px-0"
      : "";

  const trackBase = `snap-track-x gap-4 pb-2 ${bleed}`;
  const trackLayout = hasGridFallback
    ? `md:grid md:overflow-visible md:pb-0 ${mdGridClassName}`
    : "";

  return (
    <div className={`relative group/snap ${className}`}>
      {arrows && (
        <>
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg opacity-0 transition-opacity hover:bg-accent group-hover/snap:opacity-100 md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg opacity-0 transition-opacity hover:bg-accent group-hover/snap:opacity-100 md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <SnapCarouselContext.Provider value={{ variant, hasGridFallback }}>
        <div ref={scrollRef} className={`${trackBase} ${trackLayout}`}>
          {children}
        </div>
      </SnapCarouselContext.Provider>
    </div>
  );
}

interface SnapCarouselItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrap each card in a carousel. Applies the snap alignment + responsive width.
 *
 * Exported as a standalone named component (not only as `SnapCarousel.Item`)
 * because static properties attached to a "use client" component do NOT survive
 * the server→client boundary: a React Server Component importing `SnapCarousel`
 * receives a client reference proxy whose `.Item` is `undefined`. Server
 * consumers MUST import `SnapCarouselItem` directly.
 */
export function SnapCarouselItem({ children, className = "" }: SnapCarouselItemProps) {
  const { variant, hasGridFallback } = useContext(SnapCarouselContext);

  const sizing =
    variant === "featured"
      ? "snap-item-center w-[80vw] max-w-[440px]"
      : "snap-item-start w-[42vw] max-w-[180px]";

  // When a grid fallback exists, let the grid cell control width at md+.
  const desktopReset = hasGridFallback ? "md:w-auto md:max-w-none" : "";

  return <div className={`${sizing} ${desktopReset} ${className}`}>{children}</div>;
}

SnapCarousel.Item = SnapCarouselItem;
