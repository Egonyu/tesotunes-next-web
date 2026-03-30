"use client";

import { cn } from "@/lib/utils";

const RATING_LABELS = [
  "Very unhappy",
  "Unhappy",
  "Neutral",
  "Happy",
  "Very happy",
] as const;

function FaceIcon({
  rating,
  active,
  className,
}: {
  rating: number;
  active: boolean;
  className?: string;
}) {
  const stroke = active ? "currentColor" : "currentColor";

  const mouth = (() => {
    switch (rating) {
      case 1:
        return <path d="M8 16C9.2 14.8 10.8 14.2 12 14.2C13.2 14.2 14.8 14.8 16 16" />;
      case 2:
        return <path d="M8.5 15.5C10 14.9 11 14.7 12 14.7C13 14.7 14 14.9 15.5 15.5" />;
      case 3:
        return <path d="M8.5 15H15.5" />;
      case 4:
        return <path d="M8.3 14.1C9.7 15.8 10.9 16.5 12 16.5C13.1 16.5 14.3 15.8 15.7 14.1" />;
      default:
        return <path d="M7.6 13.6C9.3 16.1 10.7 17 12 17C13.3 17 14.7 16.1 16.4 13.6" />;
    }
  })();

  const eyebrow = rating <= 2;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("h-7 w-7", className)}
    >
      <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.8" />
      {eyebrow ? <path d="M8.1 9.2L9.6 8.5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /> : null}
      {eyebrow ? <path d="M15.9 9.2L14.4 8.5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" /> : null}
      <circle cx="9.3" cy="10.6" r="1" fill="currentColor" />
      <circle cx="14.7" cy="10.6" r="1" fill="currentColor" />
      <g stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {mouth}
      </g>
    </svg>
  );
}

export function ReviewRatingInput({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((rating) => {
          const active = rating === value;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              disabled={disabled}
              aria-label={`Rate ${rating}: ${RATING_LABELS[rating - 1]}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                active
                  ? "border-amber-500 bg-amber-500/10 text-amber-600"
                  : "border-border bg-background text-muted-foreground hover:border-amber-400/60 hover:text-foreground",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <FaceIcon rating={rating} active={active} />
              <span className="hidden sm:inline">{RATING_LABELS[rating - 1]}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{RATING_LABELS[Math.max(0, Math.min(4, value - 1))]}</p>
    </div>
  );
}

export function ReviewRatingDisplay({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <FaceIcon
        rating={value}
        active
        className={size === "md" ? "h-8 w-8 text-amber-500" : "h-5 w-5 text-amber-500"}
      />
      <span className={cn("font-medium text-foreground", size === "md" ? "text-sm" : "text-xs")}>
        {RATING_LABELS[Math.max(0, Math.min(4, value - 1))]}
      </span>
    </div>
  );
}
