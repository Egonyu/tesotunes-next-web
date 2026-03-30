"use client";

import { useState } from "react";
import { ReviewRatingInput } from "@/components/reviews/review-rating-input";

interface ReviewComposerProps {
  title?: string;
  description?: string;
  submitLabel?: string;
  initialRating?: number;
  initialComment?: string;
  initialWouldRecommend?: boolean;
  disabled?: boolean;
  onSubmit: (payload: {
    rating: number;
    comment: string;
    wouldRecommend: boolean;
  }) => void;
  onCancel?: () => void;
}

export function ReviewComposer({
  title = "Leave review",
  description = "Share your experience.",
  submitLabel = "Submit review",
  initialRating = 5,
  initialComment = "",
  initialWouldRecommend = true,
  disabled = false,
  onSubmit,
  onCancel,
}: ReviewComposerProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [wouldRecommend, setWouldRecommend] = useState(initialWouldRecommend);

  return (
    <div className="space-y-3 rounded-2xl border bg-background/70 p-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <ReviewRatingInput value={rating} onChange={setRating} disabled={disabled} />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={4}
        className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={wouldRecommend}
          onChange={(e) => setWouldRecommend(e.target.checked)}
          className="rounded"
        />
        I would recommend this seller
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSubmit({ rating, comment, wouldRecommend })}
          disabled={!comment.trim() || disabled}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
