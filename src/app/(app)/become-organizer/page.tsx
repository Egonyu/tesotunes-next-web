"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useApplyOrganizer, useCapabilities } from "@/hooks/useCapabilities";

/**
 * Self-service event-organizer onboarding — short, plain-language, one screen.
 * Posts to /capabilities/organizer/apply; admin review grants the capability
 * (KYC-checked at grant time).
 */
export default function BecomeOrganizerPage() {
  const router = useRouter();
  const { status } = useSession();
  const { data: capabilities } = useCapabilities();
  const applyOrganizer = useApplyOrganizer();

  const organizerPosture = capabilities?.find((c) => c.capability === "organizer");

  const [form, setForm] = useState({
    organization_name: "",
    phone: "",
    city: "",
    experience_summary: "",
  });

  if (status === "unauthenticated") {
    router.replace("/login?callbackUrl=/become-organizer");
    return null;
  }

  if (organizerPosture?.status === "granted") {
    router.replace("/artist/events");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await applyOrganizer.mutateAsync(form);
      toast.success(result.message || "Application submitted!");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) {
        Object.values(fieldErrors).flat().forEach((message) => toast.error(message));
      } else {
        toast.error(err.response?.data?.message || "Could not submit your application. Try again.");
      }
    }
  };

  if (organizerPosture?.status === "pending") {
    return (
      <div className="container mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
          <ShieldCheck className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold">Application under review</h1>
        <p className="mt-2 text-muted-foreground">
          We&apos;re reviewing your organizer application. You&apos;ll get a notification within
          24–48 hours. You can keep using TesoTunes as normal in the meantime.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg py-8">
      <div className="mb-8 text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Run events on TesoTunes</h1>
        <p className="mx-auto max-w-sm text-muted-foreground">
          Create events, sell tickets with Mobile Money, manage your door team, and get paid
          after the show. Tell us a little about you first.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="organization_name" className="mb-1.5 block text-sm font-medium">
            Your name or organization <span className="text-red-500">*</span>
          </label>
          <input
            id="organization_name"
            type="text"
            required
            value={form.organization_name}
            onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
            placeholder="e.g. Soroti Live Events"
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
              Phone number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0770 123 456"
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
              City
            </label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Soroti"
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="experience_summary" className="mb-1.5 block text-sm font-medium">
            Tell us about your events <span className="text-red-500">*</span>
          </label>
          <textarea
            id="experience_summary"
            required
            rows={4}
            minLength={30}
            value={form.experience_summary}
            onChange={(e) => setForm({ ...form, experience_summary: e.target.value })}
            placeholder="What events have you run, or what are you planning? Concerts, church events, club nights…"
            className="w-full resize-none rounded-lg border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            A sentence or two is enough — at least 30 characters.
          </p>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            Free to apply. We review within 24–48 hours. Identity verification (the same one
            used for artist payouts) is required before your first payout.
          </p>
        </div>

        <button
          type="submit"
          disabled={applyOrganizer.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {applyOrganizer.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit application"
          )}
        </button>
      </form>
    </div>
  );
}
