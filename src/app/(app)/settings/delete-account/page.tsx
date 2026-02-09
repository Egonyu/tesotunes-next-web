'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AlertTriangle,
  Trash2,
  Loader2,
  ShieldAlert,
  Music,
  Heart,
  ShoppingBag,
  CreditCard,
  Users,
  Lock,
} from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const [step, setStep] = useState<'info' | 'confirm' | 'final'>('info');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const deleteAccount = useMutation({
    mutationFn: () =>
      apiPost('/settings/delete-account', { password, reason }),
    onSuccess: () => {
      toast.success('Account scheduled for deletion');
      signOut({ callbackUrl: '/' });
    },
    onError: () => toast.error('Failed to delete account. Please check your password.'),
  });

  const consequences = [
    { id: 'music', icon: Music, text: 'All your listening history, saved songs, and playlists will be permanently deleted.' },
    { id: 'purchases', icon: ShoppingBag, text: 'Purchase history and order records will be removed.' },
    { id: 'wallet', icon: CreditCard, text: 'Your wallet balance and credits will be forfeited. Withdraw any remaining balance first.' },
    { id: 'social', icon: Users, text: 'Your followers, following, posts, and social activity will be deleted.' },
    { id: 'likes', icon: Heart, text: 'All likes, reviews, and community contributions will be removed.' },
    { id: 'access', icon: Lock, text: 'You will lose access to any active subscriptions or premium features immediately.' },
  ];

  const reasons = [
    'I don\'t use the service anymore',
    'I found a better alternative',
    'Privacy concerns',
    'Too many notifications',
    'I\'m having technical issues',
    'Other',
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-destructive/10 rounded-xl">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Delete Account</h1>
          <p className="text-muted-foreground mt-1">
            This action is permanent and cannot be undone. Please read carefully before proceeding.
          </p>
        </div>
      </div>

      {/* Step 1 - Info */}
      {step === 'info' && (
        <div className="space-y-6">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <h2 className="font-semibold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              What happens when you delete your account
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your account will be scheduled for permanent deletion. You have a 30-day grace period to cancel.
              After 30 days, all data will be permanently erased.
            </p>
          </div>

          <div className="space-y-3">
            {consequences.map((item) => {
              const Icon = item.icon;
              const isChecked = acknowledged.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setAcknowledged((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    )
                  }
                  className="w-full flex items-start gap-3 p-4 border rounded-xl text-left hover:bg-muted/50 transition"
                >
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition ${
                    isChecked ? 'bg-destructive border-destructive' : 'border-muted-foreground'
                  }`}>
                    {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">{item.text}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Before deleting, consider:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <Link href="/settings/data-export" className="text-primary hover:underline">Export your data</Link> to keep a copy</li>
              <li>• <Link href="/wallet" className="text-primary hover:underline">Withdraw your wallet balance</Link> if you have funds</li>
              <li>• Cancel any active subscriptions first</li>
            </ul>
          </div>

          <button
            onClick={() => setStep('confirm')}
            disabled={acknowledged.length < consequences.length}
            className="w-full py-3 border border-destructive text-destructive rounded-xl hover:bg-destructive hover:text-destructive-foreground transition disabled:opacity-50"
          >
            I understand, continue
          </button>
        </div>
      )}

      {/* Step 2 - Reason */}
      {step === 'confirm' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Why are you leaving?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your feedback helps us improve. This is optional.
            </p>
            <div className="space-y-2">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 border rounded-xl text-sm transition ${
                    reason === r ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('info')}
              className="flex-1 py-3 border rounded-xl hover:bg-muted transition"
            >
              Back
            </button>
            <button
              onClick={() => setStep('final')}
              className="flex-1 py-3 border border-destructive text-destructive rounded-xl hover:bg-destructive hover:text-destructive-foreground transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3 - Final confirmation */}
      {step === 'final' && (
        <div className="space-y-6">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <h2 className="font-semibold text-destructive">Final Step</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your password and type &quot;DELETE&quot; to confirm account deletion.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-destructive bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Type <span className="font-bold text-destructive">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-destructive bg-background"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('confirm')}
              className="flex-1 py-3 border rounded-xl hover:bg-muted transition"
            >
              Back
            </button>
            <button
              onClick={() => deleteAccount.mutate()}
              disabled={
                password.length === 0 ||
                confirmText !== 'DELETE' ||
                deleteAccount.isPending
              }
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition disabled:opacity-50"
            >
              {deleteAccount.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
              Delete My Account
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="pt-4 border-t">
        <Link
          href="/settings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}
