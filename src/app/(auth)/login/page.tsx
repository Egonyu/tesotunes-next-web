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
    const [emailTouched, setEmailTouched] = useState(false);
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResendingVerification, setIsResendingVerification] =
        useState(false);
    const [error, setError] = useState("");
    const [verificationEmailSent, setVerificationEmailSent] = useState(false);
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
    const [socialProviders, setSocialProviders] = useState<Record<
        string,
        { id: string; name: string }
    > | null>(null);
    const [socialLoadingProvider, setSocialLoadingProvider] = useState<
        string | null
    >(null);
    const [loginStep, setLoginStep] = useState<"credentials" | "two_fa">(
        "credentials",
    );
    const [twoFaToken, setTwoFaToken] = useState("");
    const [twoFaCode, setTwoFaCode] = useState("");
    const authTitle =
        platformSettings?.appearance.auth_form_title || "Welcome back";
    const authSubtitle =
        platformSettings?.appearance.auth_form_subtitle ||
        "Sign in to continue listening to your favorite music";
    const enabledProviders =
        getEnabledSocialAuthProvidersForPlatformSettings(platformSettings);
    const returningToSubscription = callbackUrl.startsWith(
        "/settings/subscription",
    );
    const emailIsInvalid =
        emailTouched &&
        email.length > 0 &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
                setSocialProviders(
                    providers as Record<
                        string,
                        { id: string; name: string }
                    > | null,
                );
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
            const recaptchaToken = (await executeRecaptcha?.("login")) ?? "";
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
            setError(
                "We couldn't resend the verification email right now. Please try again.",
            );
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
                setError(
                    result.error === "CredentialsSignin"
                        ? "Invalid authentication code."
                        : result.error,
                );
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
        (provider) =>
            provider.id !== "credentials" &&
            enabledProviders.has(
                provider.id as "google" | "facebook" | "twitter" | "apple",
            ),
    );

    if (loginStep === "two_fa") {
        return (
            <div className="rounded-[2rem] border bg-card/95 p-7 shadow-[0_2px_12px_hsl(var(--foreground)/0.05),0_28px_80px_hsl(var(--foreground)/0.1)] sm:p-9">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl font-black text-primary">
                    2
                </div>
                <h2 className="text-3xl font-black tracking-[-0.03em]">
                    One last step
                </h2>
                <p className="mb-8 mt-2 leading-6 text-muted-foreground">
                    Enter the 6-digit code from your authenticator app, or use
                    one of your recovery codes.
                </p>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleTwoFaSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="two_fa_code"
                            className="block text-sm font-medium mb-2"
                        >
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
                            className="h-14 w-full rounded-xl border bg-background px-4 text-center font-mono text-xl tracking-[0.35em] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted"
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            Recovery codes are longer — enter them here too.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !twoFaCode.trim()}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
                    onClick={() => {
                        setLoginStep("credentials");
                        setError("");
                        setTwoFaCode("");
                    }}
                    className="mt-4 min-h-12 w-full rounded-xl border text-sm font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    Back to sign in
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] border bg-card/95 p-7 shadow-[0_2px_12px_hsl(var(--foreground)/0.05),0_28px_80px_hsl(var(--foreground)/0.1)] backdrop-blur sm:p-9">
            {returningToSubscription && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    Your plan is waiting
                </div>
            )}
            <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                {returningToSubscription
                    ? "Sign in to choose your plan"
                    : authTitle}
            </h2>
            <p className="mb-8 mt-3 max-w-sm leading-6 text-muted-foreground">
                {returningToSubscription
                    ? "We’ll bring you straight back to subscriptions after you sign in."
                    : authSubtitle}
            </p>

            {registered && !error && !verificationEmailSent && (
                <div className="mb-6 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm">
                    Your account is ready. Verify your email, then come back
                    here to sign in.
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm leading-5 text-destructive"
                >
                    {error}
                </div>
            )}

            {verificationEmailSent && (
                <div
                    role="status"
                    className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400"
                >
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
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border bg-background px-4 font-semibold transition hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
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
                            <span className="bg-background px-2 text-muted-foreground">
                                or sign in with email
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate={false}
            >
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="block text-sm font-semibold"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        disabled={isLoading || retryAfterSeconds > 0}
                        aria-invalid={emailIsInvalid}
                        aria-describedby={
                            emailIsInvalid ? "email-help" : undefined
                        }
                        className={`h-13 w-full rounded-xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted ${emailIsInvalid ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                    />
                    {emailIsInvalid && (
                        <p
                            id="email-help"
                            className="text-xs font-medium text-destructive"
                        >
                            Enter a complete email address, like
                            name@example.com.
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="password"
                        className="block text-sm font-semibold"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            disabled={isLoading || retryAfterSeconds > 0}
                            className="h-13 w-full rounded-xl border bg-background px-4 pr-12 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={isLoading || retryAfterSeconds > 0}
                            className="h-4 w-4 rounded border-muted-foreground accent-primary"
                        />
                        <span className="text-sm">Remember me</span>
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || retryAfterSeconds > 0}
                    className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : retryAfterSeconds > 0 ? (
                        `Try again in ${retryAfterSeconds}s`
                    ) : returningToSubscription ? (
                        "Continue to subscriptions"
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
                    className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
                <Link
                    href="/register"
                    className="font-bold text-primary underline-offset-4 hover:underline"
                >
                    Create your free account
                </Link>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground/80">
                Protected sign-in. We never share your password or payment
                details.
            </p>
        </div>
    );
}
