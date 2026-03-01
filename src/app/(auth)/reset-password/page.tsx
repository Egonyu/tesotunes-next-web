'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiPost } from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    if (password.length < 8) {
      setFieldErrors({ password: ['Password must be at least 8 characters.'] });
      setIsLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: ['Passwords do not match.'] });
      setIsLoading(false);
      return;
    }

    try {
      await apiPost('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setIsReset(true);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      if (apiError?.response?.data?.errors) {
        setFieldErrors(apiError.response.data.errors);
      } else if (apiError?.response?.data?.message) {
        setError(apiError.response.data.message);
      } else {
        setError('An error occurred. The reset link may have expired. Please request a new one.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isReset) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Password Reset Successful</h2>
          <p className="text-muted-foreground mt-2">
            Your password has been reset. You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 text-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Invalid Reset Link</h2>
          <p className="text-muted-foreground mt-2">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="block w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 text-center"
          >
            Request New Reset Link
          </Link>
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

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sign In
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-bold">Reset your password</h2>
        <p className="text-muted-foreground mt-2">
          Enter your new password for <strong>{email}</strong>.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border bg-background"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-destructive text-sm mt-1">{fieldErrors.password[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type={showConfirmation ? 'text' : 'password'}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border bg-background"
              placeholder="Confirm your new password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmation(!showConfirmation)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password_confirmation && (
            <p className="text-destructive text-sm mt-1">{fieldErrors.password_confirmation[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !passwordConfirmation}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
