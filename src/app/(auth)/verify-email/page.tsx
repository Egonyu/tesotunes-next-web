'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { attemptNativeAppHandoff, buildNativeVerificationUrl, shouldAttemptNativeHandoff } from '@/lib/native-app-handoff';

type VerificationStatus = 'verifying' | 'verified' | 'failed' | 'pending';
type NativeHandoffState = 'idle' | 'opening' | 'fallback';

function mapStatusFromQuery(rawStatus: string | null): VerificationStatus {
  if (!rawStatus) {
    return 'pending';
  }

  if (rawStatus === 'verified' || rawStatus === 'already-verified') {
    return 'verified';
  }

  if (rawStatus === 'failed' || rawStatus === 'expired' || rawStatus === 'invalid') {
    return 'failed';
  }

  return 'pending';
}

function mapErrorFromReason(reason: string | null): string {
  if (reason === 'expired') {
    return 'This verification link has expired. Please request a new one.';
  }

  if (reason === 'invalid-hash' || reason === 'invalid-signature' || reason === 'invalid-user' || reason === 'missing-parameters') {
    return 'The verification link is invalid. Please request a new one.';
  }

  if (reason === 'user-not-found') {
    return 'We could not find an account for this verification link.';
  }

  return 'Verification failed. The link may have expired.';
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const statusParam = searchParams.get('status');
  const reasonParam = searchParams.get('reason');
  const registered = searchParams.get('registered') === 'true';
  const emailParam = searchParams.get('email');

  // Support both backend redirect status and direct link-based verification params.
  const verifyId = searchParams.get('id');
  const verifyHash = searchParams.get('hash');
  const expires = searchParams.get('expires');
  const signature = searchParams.get('signature');
  const nativeVerificationUrl = useMemo(() => buildNativeVerificationUrl(searchParams), [searchParams]);

  const [status, setStatus] = useState<VerificationStatus>(mapStatusFromQuery(statusParam));
  const [error, setError] = useState(reasonParam ? mapErrorFromReason(reasonParam) : '');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [nativeHandoffState, setNativeHandoffState] = useState<NativeHandoffState>('idle');

  useEffect(() => {
    if (!nativeVerificationUrl || statusParam) {
      return;
    }

    if (!shouldAttemptNativeHandoff(window.navigator.userAgent)) {
      return;
    }

    let handoffComplete = false;
    setNativeHandoffState('opening');

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handoffComplete = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const fallbackTimer = window.setTimeout(() => {
      if (!handoffComplete) {
        setNativeHandoffState('fallback');
      }
    }, 1500);

    try {
      attemptNativeAppHandoff(nativeVerificationUrl);
    } catch {
      window.clearTimeout(fallbackTimer);
      setNativeHandoffState('fallback');
    }

    return () => {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [nativeVerificationUrl, statusParam]);

  const verifyEmail = useCallback(async () => {
    if (!verifyId || !verifyHash) return;

    setStatus('verifying');
    try {
      await apiPost('/auth/email/verify', {
        id: Number(verifyId),
        hash: verifyHash,
        expires: expires ? Number(expires) : undefined,
        signature,
      });
      setStatus('verified');
      setError('');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setStatus('failed');
      setError(apiError?.response?.data?.message || 'Verification failed. The link may have expired.');
    }
  }, [verifyId, verifyHash, expires, signature]);

  useEffect(() => {
    if (!statusParam && verifyId && verifyHash) {
      verifyEmail();
    }
  }, [statusParam, verifyId, verifyHash, verifyEmail]);

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError('');

    try {
      const emailAddress = emailParam || session?.user?.email;

      if (!emailAddress) {
        setError('Enter your email during registration or sign in to request another verification email.');
        return;
      }

      await apiPost('/auth/email/resend', { email: emailAddress });
      setResendSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Verifying state (link clicked)
  if (status === 'verifying') {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
        <div>
          <h2 className="text-2xl font-bold">Verifying your email...</h2>
          <p className="text-muted-foreground mt-2">
            Please wait while we verify your email address.
          </p>
          {nativeHandoffState === 'opening' ? (
            <p className="text-sm text-muted-foreground mt-3">
              If TesoTunes is installed, we&apos;re also opening the app so verification can finish there.
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  // Successfully verified
  if (status === 'verified') {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Email Verified!</h2>
          <p className="text-muted-foreground mt-2">
            Your email address has been successfully verified. You now have full access to TesoTunes.
          </p>
        </div>
        <div className="space-y-3">
          {session ? (
            <Link
              href="/"
              className="block w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 text-center"
            >
              Go to Home
            </Link>
          ) : (
            <Link
              href="/login"
              className="block w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 text-center"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Verification failed
  if (status === 'failed') {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Verification Failed</h2>
          <p className="text-muted-foreground mt-2">{error || 'The verification link is invalid or has expired.'}</p>
        </div>
        <div className="space-y-3">
          {nativeVerificationUrl ? (
            <a
              href={nativeVerificationUrl}
              className="block w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 text-center"
            >
              Open In TesoTunes App
            </a>
          ) : null}
          {session && (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </button>
          )}
          <Link
            href="/login"
            className="block w-full py-2.5 rounded-lg border font-medium hover:bg-muted text-center transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Pending state — user navigated directly (no verification link params)
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="text-muted-foreground mt-2">
          {registered && (emailParam || session?.user?.email) ? (
            <>
              Your account was created successfully. We&apos;ve sent a verification link to{' '}
              <strong>{emailParam || session?.user?.email}</strong>.
              Please open that email and verify your account before signing in.
            </>
          ) : emailParam || session?.user?.email ? (
            <>
              We&apos;ve sent a verification link to <strong>{emailParam || session?.user?.email}</strong>.
              Please check your inbox and click the link to verify your account.
            </>
          ) : (
            <>
              Please check your inbox for a verification email and click the link to verify your account.
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {resendSuccess && (
        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
          Verification email sent! Please check your inbox.
        </div>
      )}

      {nativeHandoffState === 'opening' ? (
        <div className="p-3 rounded-lg bg-primary/10 text-sm text-primary">
          Opening the TesoTunes app for a smoother verification flow...
        </div>
      ) : null}

      {nativeHandoffState === 'fallback' && nativeVerificationUrl ? (
        <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground space-y-2">
          <p>If the app did not open automatically, continue in your browser or open TesoTunes manually.</p>
          <a href={nativeVerificationUrl} className="font-medium text-primary hover:underline">
            Open TesoTunes App
          </a>
        </div>
      ) : null}

      <div className="space-y-3">
        {(session || emailParam) && (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </button>
        )}
        <Link
          href="/login"
          className="block w-full py-2.5 rounded-lg border font-medium hover:bg-muted text-center transition-colors"
        >
          {session ? 'Back to Home' : 'Back to Sign In'}
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Didn&apos;t receive the email? Check your spam folder or click the button above to resend.
      </p>
    </div>
  );
}
