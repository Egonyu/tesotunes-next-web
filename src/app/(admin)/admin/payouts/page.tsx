"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    CheckCircle2,
    Loader2,
    RefreshCw,
    RotateCcw,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface PayoutRow {
    id: number;
    transaction_id: string;
    amount: number;
    fee_amount: number;
    net_amount: number;
    currency: string;
    payout_method: string;
    phone_number: string | null;
    status: string;
    failure_reason: string | null;
    created_at: string;
    artist: {
        id: number;
        stage_name: string;
        user: { id: number; name: string; email: string } | null;
    } | null;
}

interface PayoutPage {
    data: PayoutRow[];
    total: number;
}

type PendingAction = {
    type: "approve" | "reject" | "retry";
    payout: PayoutRow;
} | null;

const money = new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 });

function messageFrom(error: unknown): string {
    if (typeof error === "object" && error && "response" in error) {
        const response = (
            error as { response?: { data?: { message?: string } } }
        ).response;
        return response?.data?.message ?? "Payout action failed.";
    }
    return "Payout action failed.";
}

export default function AdminPayoutsPage() {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState("pending");
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const [rejectReason, setRejectReason] = useState("");

    const payoutsQuery = useQuery({
        queryKey: ["admin", "artist-payouts", status],
        queryFn: () =>
            apiGet<PayoutPage>("/admin/artist-payouts", {
                params: { status, per_page: 50 },
            }),
        refetchInterval: 20000,
    });

    const actionMutation = useMutation({
        mutationFn: async (action: NonNullable<PendingAction>) => {
            if (action.type === "reject") {
                return apiPost(
                    `/admin/artist-payouts/${action.payout.id}/reject`,
                    { reason: rejectReason },
                );
            }
            return apiPost(
                `/admin/artist-payouts/${action.payout.id}/${action.type}`,
                {},
            );
        },
        onSuccess: () => {
            toast.success("Payout updated.");
            setPendingAction(null);
            setRejectReason("");
            void queryClient.invalidateQueries({
                queryKey: ["admin", "artist-payouts"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["admin", "payments"],
            });
        },
        onError: (error) => toast.error(messageFrom(error)),
        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey: ["admin", "artist-payouts"],
            });
            void queryClient.invalidateQueries({
                queryKey: ["admin", "payments"],
            });
        },
    });

    const payouts = payoutsQuery.data?.data ?? [];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Payout approvals"
                description="Review reserved balances before money is sent to ZengaPay. Rejecting releases the reservation back to the user's original balances."
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Payout approvals" },
                ]}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap gap-2">
                    {[
                        "pending",
                        "failed",
                        "processing",
                        "completed",
                        "rejected",
                    ].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setStatus(value)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${status === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                        >
                            {value[0].toUpperCase() + value.slice(1)}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => void payoutsQuery.refetch()}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${payoutsQuery.isFetching ? "animate-spin" : ""}`}
                    />
                    Refresh
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-card">
                {payoutsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-7 w-7 animate-spin" />
                    </div>
                ) : payouts.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">
                        No {status} payouts.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Destination</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Requested</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payouts.map((payout) => (
                                    <tr key={payout.id} className="align-top">
                                        <td className="p-4">
                                            <div className="font-medium">
                                                {payout.artist?.stage_name ??
                                                    "Unknown artist"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {payout.artist?.user?.name ??
                                                    "Unknown user"}
                                                <br />
                                                {payout.transaction_id}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold">
                                                {payout.currency}{" "}
                                                {money.format(payout.amount)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Net{" "}
                                                {money.format(
                                                    payout.net_amount,
                                                )}{" "}
                                                · fee{" "}
                                                {money.format(
                                                    payout.fee_amount,
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                {payout.payout_method.replaceAll(
                                                    "_",
                                                    " ",
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {payout.phone_number ?? "—"}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge
                                                status={payout.status}
                                            />
                                            {payout.failure_reason ? (
                                                <p className="mt-2 max-w-xs text-xs text-rose-600">
                                                    {payout.failure_reason}
                                                </p>
                                            ) : null}
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {new Date(
                                                payout.created_at,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                {payout.status === "pending" ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPendingAction(
                                                                    {
                                                                        type: "reject",
                                                                        payout,
                                                                    },
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Reject
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setPendingAction(
                                                                    {
                                                                        type: "approve",
                                                                        payout,
                                                                    },
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Approve & send
                                                        </button>
                                                    </>
                                                ) : null}
                                                {payout.status === "failed" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPendingAction({
                                                                type: "retry",
                                                                payout,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs text-white"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        Retry
                                                    </button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={pendingAction !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingAction(null);
                        setRejectReason("");
                    }
                }}
                onConfirm={() => {
                    if (!pendingAction) return;
                    if (
                        pendingAction.type === "reject" &&
                        !rejectReason.trim()
                    ) {
                        toast.error(
                            "Enter a reason before rejecting the payout.",
                        );
                        return;
                    }
                    actionMutation.mutate(pendingAction);
                }}
                title={
                    pendingAction?.type === "approve"
                        ? "Approve and send this payout?"
                        : pendingAction?.type === "retry"
                          ? "Retry this payout?"
                          : "Reject this payout?"
                }
                description={
                    pendingAction?.type === "reject"
                        ? "The reserved amount will be returned to the user's original wallet and earnings balances."
                        : `This will send ${pendingAction?.payout.currency ?? "UGX"} ${money.format(pendingAction?.payout.net_amount ?? 0)} to ZengaPay.`
                }
                confirmLabel={
                    pendingAction?.type === "approve"
                        ? "Approve & send"
                        : pendingAction?.type === "retry"
                          ? "Retry send"
                          : "Reject & release funds"
                }
                variant={
                    pendingAction?.type === "reject" ? "warning" : "default"
                }
                isLoading={actionMutation.isPending}
            >
                {pendingAction?.type === "reject" ? (
                    <textarea
                        value={rejectReason}
                        onChange={(event) =>
                            setRejectReason(event.target.value)
                        }
                        placeholder="Reason for rejection"
                        className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm"
                    />
                ) : null}
            </ConfirmDialog>
        </div>
    );
}
