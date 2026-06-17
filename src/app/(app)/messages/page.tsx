"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LifeBuoy, Send, Loader2, CheckCircle2, Mail } from "lucide-react";
import { apiPost, isApiError } from "@/lib/api";
import { toast } from "sonner";

// Mirrors the backend enum in SupportMessageController::store().
const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "bug", label: "Report a bug" },
  { value: "billing", label: "Billing & payments" },
  { value: "artist", label: "Artist / uploads" },
  { value: "abuse", label: "Report abuse" },
  { value: "other", label: "Other" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

interface SupportPayload {
  subject?: string;
  message: string;
  category: Category;
}

function errorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    return (error.response?.data as { message?: string })?.message ?? fallback;
  }
  return fallback;
}

export default function MessagesPage() {
  const [category, setCategory] = useState<Category>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const send = useMutation({
    mutationFn: (payload: SupportPayload) =>
      apiPost("/support/messages", payload),
    onSuccess: () => {
      setSent(true);
      setSubject("");
      setMessage("");
      toast.success("Message sent — our team will get back to you.");
    },
    onError: (e) => toast.error(errorMessage(e, "Could not send your message. Please try again.")),
  });

  const canSubmit = message.trim().length >= 5 && !send.isPending;

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Message sent</h1>
        <p className="mt-2 text-muted-foreground">
          Thanks for reaching out. Our team has been notified and will get back to you by email.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <LifeBuoy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Message the team</h1>
          <p className="text-sm text-muted-foreground">
            Questions, problems, or feedback? Send a note straight to the TesoTunes admins and moderators.
          </p>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border bg-card p-5">
        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium">What's this about?</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  category === c.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="mb-2 block text-sm font-medium">
            Subject <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={150}
            placeholder="Brief summary"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={2000}
            placeholder="Tell us what's going on…"
            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{message.length}/2000</p>
        </div>

        <button
          onClick={() => send.mutate({ subject: subject.trim() || undefined, message: message.trim(), category })}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send message
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          Replies come to your account email — there's no live chat yet.
        </p>
      </div>
    </div>
  );
}
