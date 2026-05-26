"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import {
  type SettingAuditRow,
  fetchSettingHistory,
  revertSetting,
} from "@/lib/admin-settings";

interface HistoryDrawerProps {
  settingKey: string | null;
  onClose: () => void;
}

export function HistoryDrawer({ settingKey, onClose }: HistoryDrawerProps) {
  const [reverting, setReverting] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const isOpen = settingKey !== null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["setting-history", settingKey],
    queryFn: () => fetchSettingHistory(settingKey as string, 1, 50),
    enabled: isOpen,
    staleTime: 0,
  });

  async function handleRevert(row: SettingAuditRow) {
    if (!settingKey) return;
    setReverting(row.id);
    try {
      await revertSetting(settingKey, row.id);
      toast.success(`Reverted ${settingKey} to version before #${row.id}`);
      await queryClient.invalidateQueries({ queryKey: ["setting-values"] });
      await queryClient.invalidateQueries({ queryKey: ["setting-history", settingKey] });
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(message ?? "Revert failed");
    } finally {
      setReverting(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">history</div>
            <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-100">
              {settingKey}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> loading history
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">Failed to load history.</div>
          ) : !data || data.rows.length === 0 ? (
            <div className="text-sm text-slate-500">No changes recorded yet.</div>
          ) : (
            <ul className="space-y-3">
              {data.rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">
                        v{row.old_version ?? 0} → v{row.new_version} ·{" "}
                        {new Date(row.changed_at).toLocaleString()}
                      </div>
                      <div className="mt-1">
                        <span className="text-slate-400 line-through">
                          {row.was_secret ? "•••" : (row.old_value ?? "—")}
                        </span>{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-100">
                          {row.was_secret ? "•••" : (row.new_value ?? "—")}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {row.actor?.name ?? row.actor?.email ?? `user #${row.actor_user_id ?? "?"}`}
                        {row.reason ? ` · ${row.reason}` : ""}
                      </div>
                      {row.reverted_from ? (
                        <div className="mt-0.5 text-[11px] text-blue-600">
                          revert of audit #{row.reverted_from}
                        </div>
                      ) : null}
                    </div>
                    {row.was_secret ? null : (
                      <button
                        type="button"
                        disabled={reverting === row.id}
                        onClick={() => void handleRevert(row)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                      >
                        {reverting === row.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3 w-3" />
                        )}
                        revert
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800">
          {data ? `${data.rows.length} of ${data.total} changes` : null}
        </div>
      </div>
    </div>
  );
}
