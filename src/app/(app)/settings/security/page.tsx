"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { Lock, Loader2, Smartphone } from "lucide-react";
import TwoFactorManager from "@/components/security/TwoFactorManager";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold mb-2">Security</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account security and two-factor authentication.
        </p>
      </div>

      <TwoFactorManager />

      <PasswordChangeSection />

      <ActiveSessionsSection />
    </div>
  );
}

// ============================================================================
// Password Change Sub-section
// ============================================================================

function PasswordChangeSection() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: (data: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => apiPost("/settings/password", data),
    onSuccess: () => {
      toast.success("Password updated successfully");
      setCurrent("");
      setNewPass("");
      setConfirm("");
    },
    onError: () => {
      toast.error("Failed to update password. Check your current password.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPass.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    mutation.mutate({
      current_password: current,
      password: newPass,
      password_confirmation: confirm,
    });
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Change Password</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Update your password to keep your account secure.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 max-w-sm">
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Current password"
              required
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password"
              required
              minLength={8}
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !current || !newPass || !confirm}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Active Sessions Sub-section
// ============================================================================

function ActiveSessionsSection() {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () =>
      apiGet<{
        data: Array<{
          id: string;
          device: string;
          ip_address: string;
          last_active: string;
          is_current: boolean;
        }>;
      }>("/settings/sessions").then((res) => res.data),
  });

  const revokeAll = useMutation({
    mutationFn: () => apiPost("/settings/sessions/revoke-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      toast.success("All other sessions revoked");
    },
  });

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Active Sessions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage devices where you&apos;re currently logged in.
              </p>
            </div>
            {sessions && sessions.length > 1 && (
              <button
                onClick={() => revokeAll.mutate()}
                disabled={revokeAll.isPending}
                className="px-3 py-1.5 text-xs rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
              >
                Revoke All Others
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <div className="py-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : !sessions || sessions.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground text-center">
                No active sessions found
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {session.device}
                      {session.is_current && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.ip_address} &middot;{" "}
                      {new Date(session.last_active).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
