"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Mic2,
  Upload,
  BarChart3,
  RefreshCw,
  Loader2,
  Music,
  Sparkles,
  Shield,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArtistApplicationStatus } from "@/hooks/useArtist";

// ============================================================================
// Timeline Step
// ============================================================================

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "completed" | "current" | "upcoming";
}

function getTimelineSteps(appStatus: string): TimelineStep[] {
  const steps: Omit<TimelineStep, "status">[] = [
    {
      id: "submitted",
      label: "Application Submitted",
      description: "Your application has been received",
      icon: FileText,
    },
    {
      id: "review",
      label: "Under Review",
      description: "Our team is reviewing your application",
      icon: Shield,
    },
    {
      id: "approved",
      label: "Approved",
      description: "Start uploading your music",
      icon: CheckCircle2,
    },
  ];

  return steps.map((step, index) => {
    let status: TimelineStep["status"] = "upcoming";

    if (appStatus === "approved") {
      status = "completed";
    } else if (appStatus === "rejected") {
      if (index === 0) status = "completed";
      else if (index === 1) status = "completed";
      else status = "upcoming";
    } else if (appStatus === "pending") {
      if (index === 0) status = "completed";
      else if (index === 1) status = "current";
      else status = "upcoming";
    }

    return { ...step, status };
  });
}

// ============================================================================
// Main Component
// ============================================================================

export default function ApplicationStatusPage() {
  const { data: session, status: authStatus } = useSession();
  const { data: appData, isLoading, refetch, isRefetching } = useArtistApplicationStatus();

  if (authStatus === "loading" || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Checking application status...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/login?callbackUrl=/become-artist/status");
  }

  const appStatus = appData?.data?.status ?? "none";

  // No application found — redirect to become-artist
  if (appStatus === "none") {
    redirect("/become-artist");
  }

  // Already approved — redirect to dashboard
  if (appStatus === "approved" || appData?.data?.is_artist) {
    redirect("/artist/dashboard");
  }

  const timelineSteps = getTimelineSteps(appStatus);
  const submittedAt = appData?.data?.submitted_at
    ? new Date(appData.data.submitted_at)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <div
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
              appStatus === "pending"
                ? "bg-amber-500/10"
                : appStatus === "rejected"
                ? "bg-red-500/10"
                : "bg-green-500/10"
            )}
          >
            {appStatus === "pending" ? (
              <Clock className="h-10 w-10 text-amber-500" />
            ) : appStatus === "rejected" ? (
              <XCircle className="h-10 w-10 text-red-500" />
            ) : (
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            {appStatus === "pending"
              ? "Application Under Review"
              : appStatus === "rejected"
              ? "Application Not Approved"
              : "Application Approved!"}
          </h1>

          <p className="text-muted-foreground max-w-md mx-auto">
            {appStatus === "pending"
              ? "We're reviewing your application. This usually takes 24-48 hours. We'll notify you once a decision is made."
              : appStatus === "rejected"
              ? "Unfortunately, your application wasn't approved this time. Please review the feedback below."
              : "Congratulations! You're now an artist on TesoTunes."}
          </p>
        </div>

        {/* Artist Info Card */}
        {appData?.data?.artist && (
          <div className="mb-8 rounded-xl border bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mic2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {appData.data.artist.stage_name}
                </h2>
                {submittedAt && (
                  <p className="text-sm text-muted-foreground">
                    Applied on {submittedAt.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-8 rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-5 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Application Progress
          </h3>

          <div className="space-y-0">
            {timelineSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isLast = index === timelineSteps.length - 1;

              return (
                <div key={step.id} className="flex gap-4">
                  {/* Timeline Line & Dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        step.status === "completed"
                          ? "border-green-500 bg-green-500/10"
                          : step.status === "current"
                          ? "border-amber-500 bg-amber-500/10 animate-pulse"
                          : "border-muted bg-muted/30"
                      )}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : step.status === "current" ? (
                        <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                      ) : (
                        <StepIcon className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 min-h-[2rem]",
                          step.status === "completed"
                            ? "bg-green-500/50"
                            : "bg-muted"
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("pb-6", isLast && "pb-0")}>
                    <h4
                      className={cn(
                        "font-medium mt-2",
                        step.status === "completed"
                          ? "text-foreground"
                          : step.status === "current"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rejection Reason */}
        {appStatus === "rejected" && appData?.data?.rejection_reason && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              Feedback from our team
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {appData.data.rejection_reason}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {appStatus === "pending" && (
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefetching && "animate-spin")}
              />
              {isRefetching ? "Checking..." : "Refresh Status"}
            </button>
          )}

          {appStatus === "rejected" && appData?.data?.can_reapply && (
            <Link
              href="/become-artist"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Re-Apply as Artist
            </Link>
          )}

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* What to expect */}
        {appStatus === "pending" && (
          <div className="mt-10 rounded-xl border bg-muted/30 p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What happens next?
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Shield,
                  title: "Identity Check",
                  description:
                    "We verify your identity and review your artist profile.",
                },
                {
                  icon: Music,
                  title: "Profile Setup",
                  description:
                    "Once approved, your artist profile goes live on TesoTunes.",
                },
                {
                  icon: Upload,
                  title: "Upload Music",
                  description:
                    "Start uploading your songs, albums, and EPs right away.",
                },
                {
                  icon: BarChart3,
                  title: "Track Earnings",
                  description:
                    "Monitor streams, downloads, and earn from your art.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-lg p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
