"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
} from "lucide-react";
import {
  useKycStatus,
  useUploadKycDocument,
  type KycDocument,
  type KycDocumentTypeValue,
  type KycStatusValue,
} from "@/hooks/useKyc";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  KycStatusValue,
  { tone: string; icon: typeof ShieldCheck; title: string; blurb: string }
> = {
  none: {
    tone: "text-muted-foreground",
    icon: ShieldAlert,
    title: "Not started",
    blurb: "Verify your identity to unlock withdrawals, payouts and seller payments.",
  },
  partial: {
    tone: "text-amber-500",
    icon: ShieldAlert,
    title: "In progress",
    blurb: "You're partway there — upload the remaining documents to finish.",
  },
  pending_review: {
    tone: "text-blue-500",
    icon: Clock,
    title: "Under review",
    blurb: "Your documents are in. Our team will review them shortly.",
  },
  verified: {
    tone: "text-emerald-500",
    icon: ShieldCheck,
    title: "Verified",
    blurb: "Your identity is verified. You're all set for payouts and withdrawals.",
  },
  rejected: {
    tone: "text-destructive",
    icon: XCircle,
    title: "Action needed",
    blurb: "Some documents were rejected. Please re-upload them below.",
  },
  expired: {
    tone: "text-amber-500",
    icon: ShieldAlert,
    title: "Re-verification needed",
    blurb: "Your verification has expired. Re-upload your documents to renew it.",
  },
};

function latestDocFor(type: KycDocumentTypeValue, docs: KycDocument[]): KycDocument | undefined {
  return docs.find((d) => d.document_type === type);
}

function DocRow({
  type,
  label,
  doc,
}: {
  type: KycDocumentTypeValue;
  label: string;
  doc?: KycDocument;
}) {
  const upload = useUploadKycDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const status = doc?.status;

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate({ document_type: type, file });
    e.target.value = "";
  };

  const StateIcon =
    status === "verified" ? CheckCircle2 : status === "rejected" ? XCircle : status === "pending" ? Clock : Circle;
  const stateTone =
    status === "verified"
      ? "text-emerald-500"
      : status === "rejected"
        ? "text-destructive"
        : status === "pending"
          ? "text-blue-500"
          : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <StateIcon className={cn("h-5 w-5 shrink-0", stateTone)} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {status === "verified"
            ? "Verified"
            : status === "pending"
              ? "Awaiting review"
              : status === "rejected"
                ? doc?.rejection_reason || "Rejected — please re-upload"
                : "Not uploaded yet"}
        </p>
      </div>
      {status !== "verified" && status !== "pending" && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={onPick}
            className="hidden"
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={upload.isPending}
            className="flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          >
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {status === "rejected" ? "Re-upload" : "Upload"}
          </button>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { data: kyc, isLoading } = useKycStatus({ enabled: authStatus === "authenticated" });

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login?callbackUrl=/verify");
  }, [authStatus, router]);

  if (isLoading || authStatus !== "authenticated" || !kyc) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const meta = STATUS_META[kyc.status];
  const StatusIcon = meta.icon;
  const required = kyc.requirements.required_document_types;
  const verifiedCount = required.filter(
    (r) => latestDocFor(r.type, kyc.documents)?.status === "verified",
  ).length;
  const showUploads = kyc.status !== "verified" && kyc.status !== "pending_review";

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-start gap-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted", meta.tone)}>
          <StatusIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Identity verification</h1>
          <p className="text-sm text-muted-foreground">{meta.blurb}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-2xl border bg-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className={cn("text-sm font-semibold", meta.tone)}>{meta.title}</span>
          <span className="text-sm text-muted-foreground">
            {verifiedCount} of {required.length} verified
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${required.length ? (verifiedCount / required.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Documents */}
      {showUploads ? (
        <div className="space-y-3">
          {required.map((r) => (
            <DocRow key={r.type} type={r.type} label={r.label} doc={latestDocFor(r.type, kyc.documents)} />
          ))}
          <p className="pt-1 text-xs text-muted-foreground">
            Accepted: a clear photo or PDF of each document. We only use these to verify your identity.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <StatusIcon className={cn("mx-auto mb-3 h-10 w-10", meta.tone)} />
          <p className="font-semibold">{meta.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{meta.blurb}</p>
        </div>
      )}
    </div>
  );
}
