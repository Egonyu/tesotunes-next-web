"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Shield, ArrowLeft, Phone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2FA challenge state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  // Phone login state
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://beta.test/api'}/auth/phone/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      if (res.ok) {
        setPhoneOtpSent(true);
      } else {
        setError('Failed to send OTP. Please check the number and try again.');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        phone: phoneNumber,
        otp: phoneOtp,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid OTP. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error === "2FA_REQUIRED") {
        // Backend signals 2FA is needed
        setRequires2FA(true);
      } else if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Sync the auth token to localStorage for API calls
        try {
          const sessionRes = await fetch("/api/auth/session");
          const session = await sessionRes.json();
          if (session?.accessToken) {
            localStorage.setItem("auth_token", session.accessToken);
          }
        } catch (e) {
          console.warn("[Login] Could not sync auth token:", e);
        }
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        two_factor_code: useRecoveryCode ? undefined : twoFACode,
        two_factor_recovery_code: useRecoveryCode ? twoFACode : undefined,
        redirect: false,
      });

      if (result?.error) {
        setError(
          useRecoveryCode
            ? "Invalid recovery code"
            : "Invalid verification code"
        );
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // 2FA Challenge Screen
  // =========================================================================
  if (requires2FA) {
    return (
      <div>
        <button
          onClick={() => {
            setRequires2FA(false);
            setTwoFACode("");
            setError("");
            setUseRecoveryCode(false);
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-primary/10 p-2">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
            <p className="text-muted-foreground text-sm">
              {useRecoveryCode
                ? "Enter one of your recovery codes"
                : "Enter the 6-digit code from your authenticator app"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handle2FASubmit} className="space-y-4">
          <div>
            <label
              htmlFor="2fa-code"
              className="block text-sm font-medium mb-2"
            >
              {useRecoveryCode ? "Recovery Code" : "Verification Code"}
            </label>
            {useRecoveryCode ? (
              <input
                id="2fa-code"
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                placeholder="xxxx-xxxx-xxxx"
                required
                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                autoFocus
              />
            ) : (
              <input
                id="2fa-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={twoFACode}
                onChange={(e) =>
                  setTwoFACode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                required
                className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-center text-xl tracking-[0.5em] font-mono"
                autoFocus
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !twoFACode}
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
          onClick={() => {
            setUseRecoveryCode(!useRecoveryCode);
            setTwoFACode("");
            setError("");
          }}
          className="mt-4 w-full text-center text-sm text-primary hover:underline"
        >
          {useRecoveryCode
            ? "Use authenticator app instead"
            : "Use a recovery code"}
        </button>
      </div>
    );
  }

  // =========================================================================
  // Normal Login Screen
  // =========================================================================

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
      <p className="text-muted-foreground mb-8">
        Sign in to continue listening to your favorite music
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
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
              className="w-full px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Social Login */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg border hover:bg-muted transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => signIn("facebook", { callbackUrl })}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg border hover:bg-muted transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>

      {/* Phone Login */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowPhoneLogin(!showPhoneLogin)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border hover:bg-muted transition-colors text-sm"
        >
          <Phone className="h-4 w-4" />
          Sign in with Phone Number
        </button>
        
        {showPhoneLogin && (
          <div className="mt-4 space-y-3 p-4 rounded-lg border bg-muted/30">
            {!phoneOtpSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder="+256 700 000 000"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading || !phoneNumber}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Enter the code sent to {phoneNumber}
                </p>
                <input
                  type="text"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2 rounded-lg border bg-background text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || phoneOtp.length !== 6}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify & Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneOtpSent(false)}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Change number
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
