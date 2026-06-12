"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import {
  Shield,
  Smartphone,
  Key,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import Image from "next/image";

interface TwoFactorStatus {
  enabled: boolean;
  confirmed_at?: string;
  recovery_codes_remaining?: number;
}

interface TwoFactorSetup {
  secret: string;
  qr_code_url: string;
  recovery_codes: string[];
}

export default function TwoFactorManager() {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ["2fa-status"],
    queryFn: () =>
      apiGet<{ data: TwoFactorStatus }>("/settings/2fa").then((r) => r.data),
  });

  const [step, setStep] = useState<"idle" | "qr" | "verify" | "recovery">("idle");
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  const enableMutation = useMutation({
    mutationFn: () => apiPost<{ data: TwoFactorSetup }>("/settings/2fa/enable", {}),
    onSuccess: (res) => {
      setSetupData(res.data);
      setStep("qr");
    },
    onError: () => toast.error("Failed to start 2FA setup"),
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) =>
      apiPost<{ data: { recovery_codes: string[] } }>("/settings/2fa/verify", { code }),
    onSuccess: (res) => {
      if (res.data?.recovery_codes) {
        setSetupData((prev) =>
          prev ? { ...prev, recovery_codes: res.data.recovery_codes } : prev
        );
      }
      setStep("recovery");
      queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
      toast.success("Two-factor authentication enabled!");
    },
    onError: () => toast.error("Invalid verification code. Please try again."),
  });

  const disableMutation = useMutation({
    mutationFn: (password: string) => apiPost("/settings/2fa/disable", { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
      setStep("idle");
      setSetupData(null);
      setVerifyCode("");
      setShowDisable(false);
      setDisablePassword("");
      toast.success("Two-factor authentication disabled");
    },
    onError: () => toast.error("Incorrect password"),
  });

  const regenerateMutation = useMutation({
    mutationFn: () =>
      apiPost<{ data: { recovery_codes: string[] } }>("/settings/2fa/recovery-codes", {}),
    onSuccess: (res) => {
      setSetupData({ secret: "", qr_code_url: "", recovery_codes: res.data.recovery_codes });
      setStep("recovery");
      queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
      toast.success("New recovery codes generated");
    },
    onError: () => toast.error("Failed to regenerate recovery codes"),
  });

  const copyRecoveryCodes = () => {
    if (!setupData?.recovery_codes) return;
    navigator.clipboard.writeText(setupData.recovery_codes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    toast.success("Recovery codes copied to clipboard");
  };

  const resetSetup = () => {
    setStep("idle");
    setSetupData(null);
    setVerifyCode("");
    setCopiedCodes(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Shield className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add an extra layer of security using a TOTP authenticator app like Google
            Authenticator or Authy.
          </p>

          {status?.enabled ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">Enabled</span>
                {status.confirmed_at && (
                  <span className="text-muted-foreground">
                    since {new Date(status.confirmed_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {status.recovery_codes_remaining !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span>{status.recovery_codes_remaining} recovery codes remaining</span>
                  {status.recovery_codes_remaining <= 2 && (
                    <span className="text-amber-500 text-xs font-medium">(Consider regenerating)</span>
                  )}
                </div>
              )}

              {/* Recovery codes view after regeneration */}
              {step === "recovery" && setupData?.recovery_codes && (
                <RecoveryCodesDisplay
                  codes={setupData.recovery_codes}
                  copied={copiedCodes}
                  onCopy={copyRecoveryCodes}
                  onDone={resetSetup}
                />
              )}

              {step !== "recovery" && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => regenerateMutation.mutate()}
                    disabled={regenerateMutation.isPending}
                    className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {regenerateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Regenerate Recovery Codes"
                    )}
                  </button>
                  <button
                    onClick={() => setShowDisable(true)}
                    className="px-4 py-2 text-sm rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Disable 2FA
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              {step === "idle" && (
                <button
                  onClick={() => enableMutation.mutate()}
                  disabled={enableMutation.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {enableMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Smartphone className="h-4 w-4" />
                  )}
                  Enable Two-Factor Authentication
                </button>
              )}

              {step === "qr" && setupData && (
                <div className="space-y-4 mt-2">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium mb-2">Scan this QR code with your authenticator app</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use Google Authenticator, Authy, or any TOTP-compatible app.
                    </p>
                    <div className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto">
                      {setupData.qr_code_url.startsWith("data:") ? (
                        <img src={setupData.qr_code_url} alt="2FA QR Code" width={200} height={200} />
                      ) : (
                        <Image src={setupData.qr_code_url} alt="2FA QR Code" width={200} height={200} />
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-1">Or enter this key manually:</p>
                      <code className="block text-sm bg-muted px-3 py-2 rounded font-mono tracking-wider text-center select-all">
                        {setupData.secret}
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("verify")}
                    className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === "verify" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (verifyCode.length !== 6) return;
                    verifyMutation.mutate(verifyCode);
                  }}
                  className="space-y-4 mt-2"
                >
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium mb-2">Enter the 6-digit code from your app</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Open your authenticator app and enter the code shown for TesoTunes.
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      autoFocus
                      className="w-full max-w-xs mx-auto block text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("qr")}
                      className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={verifyCode.length !== 6 || verifyMutation.isPending}
                      className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Enable"}
                    </button>
                  </div>
                </form>
              )}

              {step === "recovery" && setupData?.recovery_codes && (
                <RecoveryCodesDisplay
                  codes={setupData.recovery_codes}
                  copied={copiedCodes}
                  onCopy={copyRecoveryCodes}
                  onDone={resetSetup}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disable 2FA Modal */}
      {showDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Disable 2FA</h3>
              <button
                onClick={() => { setShowDisable(false); setDisablePassword(""); }}
                className="rounded-full p-1 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your password to confirm disabling two-factor authentication.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                disableMutation.mutate(disablePassword);
              }}
            >
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowDisable(false); setDisablePassword(""); }}
                  className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!disablePassword || disableMutation.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {disableMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RecoveryCodesDisplay({
  codes,
  copied,
  onCopy,
  onDone,
}: {
  codes: string[];
  copied: boolean;
  onCopy: () => void;
  onDone: () => void;
}) {
  return (
    <div className="space-y-4 mt-2">
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h4 className="font-medium text-amber-600 dark:text-amber-400">Save your recovery codes</h4>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          These codes can be used to access your account if you lose your authenticator. Each
          code can only be used once. Store them in a safe place.
        </p>
        <div className="grid grid-cols-2 gap-2 bg-muted rounded-lg p-4 font-mono text-sm">
          {codes.map((code, i) => (
            <div key={i} className="px-2 py-1 text-center select-all">
              {code}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCopy}
          className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors flex items-center gap-2"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy All Codes"}
        </button>
        <button
          onClick={onDone}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
