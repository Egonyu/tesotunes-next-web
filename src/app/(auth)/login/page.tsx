"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { apiPost } from "@/lib/api";
import { usePublicPlatformSettings } from "@/hooks/usePublicPlatformSettings";
import { getEnabledSocialAuthProvidersForPlatformSettings } from "@/lib/social-auth";

/**
 * Sanitize callbackUrl to always be a relative path.
 * Absolute URLs are converted to just the local path to avoid open redirects.
 */
function sanitizeCallbackUrl(raw: string | null): string {
  if (!raw) return "/";

  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const url = new URL(raw);
      return url.pathname + url.search + url.hash;
    }

    return raw.startsWith("/") ? raw : `/${raw}`;
  } catch {
    return "/";
  }
}

function getRetryAfterSeconds(errorMessage: string): number | null {
  const match = errorMessage.match(/try again in\s+(\d+)\s+seconds?/i);
  if (!match) return null;

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function requiresEmailVerification(errorMessage: string): boolean {
  return /verify your email/i.test(errorMessage);
}

export default function LoginPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: platformSettings } = usePublicPlatformSettings();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));
  const registered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const [socialProviders, setSocialProviders] = useState<Record<string, { id: string; name: string }> | null>(null);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<"credentials" | "two_fa">("credentials");
  const [twoFaToken, setTwoFaToken] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const authTitle = platformSettings?.appearance.auth_form_title || "Welcome back";
  const authSubtitle =
    platformSettings?.appearance.auth_form_subtitle ||
    "Sign in to continue listening to your favorite music";
  const enabledProviders = getEnabledSocialAuthProvidersForPlatformSettings(platformSettings);

  useEffect(() => {
    if (retryAfterSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setRetryAfterSeconds((current) => (current > 1 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfterSeconds]);

  useEffect(() => {
    let mounted = true;

    const loadProviders = async () => {
      try {
        const providers = await getProviders();
        if (!mounted) return;
        setSocialProviders(providers as Record<string, { id: string; name: string }> | null);
      } catch {
        if (!mounted) return;
        setSocialProviders(null);
      }
    };

    void loadProviders();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || retryAfterSeconds > 0) return;

    setIsLoading(true);
    setError("");
    setVerificationEmailSent(false);

    try {
      const recaptchaToken = await executeRecaptcha?.("login") ?? "";
      const result = await signIn("credentials", {
        email,
        password,
        remember_me: rememberMe,
        recaptcha_token: recaptchaToken,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        // 2FA required — switch to the TOTP challenge step
        if (result.error.startsWith("TWO_FA_REQUIRED:")) {
          const token = result.error.slice("TWO_FA_REQUIRED:".length);
          setTwoFaToken(token);
          setTwoFaCode("");
          setError("");
          setLoginStep("two_fa");
          return;
        }

        const message =
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error.includes("Too many login attempts")
              ? result.error
              : result.error;
        const retryAfter = getRetryAfterSeconds(message);
        if (retryAfter) {
          setRetryAfterSeconds(retryAfter);
        }
        setError(message);
        return;
      }

      setRetryAfterSeconds(0);
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("[Login] Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || isResendingVerification) {
      return;
    }

    setIsResendingVerification(true);
    setVerificationEmailSent(false);

    try {
      await apiPost("/auth/email/resend", { email });
      setVerificationEmailSent(true);
      setError("");
    } catch (err) {
      console.error("[Login] Failed to resend verification email:", err);
      setError("We couldn't resend the verification email right now. Please try again.");
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleSocialSignIn = async (providerId: string) => {
    setError("");
    setVerificationEmailSent(false);
    setSocialLoadingProvider(providerId);

    try {
      await signIn(providerId, { callbackUrl });
    } catch {
      setError("Unable to start social sign-in. Please try again.");
      setSocialLoadingProvider(null);
    }
  };

  const handleTwoFaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !twoFaCode.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        two_fa_token: twoFaToken,
        two_fa_code: twoFaCode.trim(),
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid authentication code." : result.error);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const enabledSocialProviders = Object.values(socialProviders ?? {}).filter(
    (provider) => provider.id !== "credentials" && enabledProviders.has(provider.id as "google" | "facebook" | "twitter" | "apple")
  );

  if (loginStep === "two_fa") {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
        <p className="text-muted-foreground mb-8">
          Enter the 6-digit code from your authenticator app, or use one of your recovery codes.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleTwoFaSubmit} className="space-y-4">
          <div>
            <label htmlFor="two_fa_code" className="block text-sm font-medium mb-2">
              Authentication Code
            </label>
            <input
              id="two_fa_code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={twoFaCode}
              onChange={(e) => setTwoFaCode(e.target.value)}
              placeholder="000000"
              required
              autoFocus
              disabled={isLoading}
              maxLength={10}
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest text-lg font-mono"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Recovery codes are longer — enter them here too.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !twoFaCode.trim()}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setLoginStep("credentials"); setError(""); setTwoFaCode(""); }}
          className="mt-4 w-full py-2.5 rounded-lg border font-medium hover:bg-muted text-sm"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{authTitle}</h2>
      <p className="text-muted-foreground mb-8">
        {authSubtitle}
      </p>

      {registered && !error && !verificationEmailSent && (
        <div className="mb-6 p-4 rounded-lg bg-primary/10 text-sm">
          Registration is complete. Verify your email before signing in.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {verificationEmailSent && (
        <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 text-sm dark:bg-green-900/30 dark:text-green-400">
          Verification email sent. Please check your inbox.
        </div>
      )}

      {enabledSocialProviders.length > 0 && (
        <div className="mb-6 space-y-3">
          {enabledSocialProviders.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => void handleSocialSignIn(provider.id)}
              disabled={Boolean(socialLoadingProvider)}
              className="w-full py-2.5 rounded-lg border font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {socialLoadingProvider === provider.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting {provider.name}...
                </>
              ) : (
                <>Continue with {provider.name}</>
              )}
            </button>
          ))}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or sign in with email</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading || retryAfterSeconds > 0}
            className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading || retryAfterSeconds > 0}
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading || retryAfterSeconds > 0}
              className="rounded border-muted-foreground"
            />
            <span className="text-sm">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || retryAfterSeconds > 0}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : retryAfterSeconds > 0 ? (
            `Try again in ${retryAfterSeconds}s`
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {requiresEmailVerification(error) && email && (
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={isResendingVerification}
          className="mt-4 w-full py-2.5 rounded-lg border font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isResendingVerification ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending verification email...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </button>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
