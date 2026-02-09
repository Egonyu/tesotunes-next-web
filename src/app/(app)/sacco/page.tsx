'use client';

import Link from 'next/link';
import {
  PiggyBank,
  CreditCard,
  Coins,
  TrendingUp,
  Users,
  ArrowRight,
  ChevronRight,
  Shield,
  Target,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSaccoMembership } from '@/hooks/useSacco';

export default function SaccoPage() {
  const { data: memberData, isLoading, error } = useSaccoMembership();

  const isMember = !!memberData;

  const features = [
    {
      icon: PiggyBank,
      title: 'Savings',
      description: 'Save regularly and earn competitive interest on your savings.',
      href: '/sacco/savings',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      icon: Coins,
      title: 'Shares',
      description: 'Own a piece of the cooperative and earn annual dividends.',
      href: '/sacco/shares',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: CreditCard,
      title: 'Loans',
      description: 'Access affordable loans up to 3x your savings balance.',
      href: '/sacco/loans',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Secure Savings',
      description: 'Your deposits are protected and insured',
    },
    {
      icon: TrendingUp,
      title: 'Competitive Returns',
      description: '12% interest on savings plus annual dividends',
    },
    {
      icon: Target,
      title: 'Easy Loans',
      description: 'Borrow up to 3x your savings with low interest',
    },
    {
      icon: Award,
      title: 'Member Benefits',
      description: 'Exclusive perks and profit sharing',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to load SACCO</h2>
        <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 lg:p-10 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6" />
            <span className="text-emerald-100 font-medium">TesoTunes Artist SACCO</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {isMember ? 'Welcome Back, Member!' : 'Join Our Artist SACCO'}
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mb-6">
            {isMember 
              ? 'Manage your savings, shares, and loans. Build your financial future with fellow artists.'
              : 'A savings and credit cooperative designed exclusively for music artists. Save together, grow together.'}
          </p>
          <div className="flex flex-wrap gap-3">
            {isMember ? (
              <>
                <Link
                  href="/sacco/dashboard"
                  className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors inline-flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sacco/loans/apply"
                  className="px-6 py-3 bg-emerald-500/30 text-white rounded-lg font-medium hover:bg-emerald-500/50 transition-colors border border-white/30"
                >
                  Apply for Loan
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sacco/join"
                  className="px-6 py-3 bg-white text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors inline-flex items-center gap-2"
                >
                  Join Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#benefits"
                  className="px-6 py-3 bg-emerald-500/30 text-white rounded-lg font-medium hover:bg-emerald-500/50 transition-colors border border-white/30"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Member Summary (if member) */}
      {isMember && memberData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <PiggyBank className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-muted-foreground">Total Savings</span>
            </div>
            <p className="text-2xl font-bold">
              UGX {(memberData.savings_balance ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Coins className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-muted-foreground">Shares Owned</span>
            </div>
            <p className="text-2xl font-bold">{memberData.shares_count ?? 0}</p>
          </div>
          <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-muted-foreground">Member No.</span>
            </div>
            <p className="text-2xl font-bold">{memberData.member_number}</p>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="pt-2">
        <h2 className="text-xl font-semibold mb-5">
          {isMember ? 'Quick Access' : 'What We Offer'}
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group p-6 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mb-4', feature.bgColor)}>
                <feature.icon className={cn('h-6 w-6', feature.color)} />
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
              <div className="flex items-center text-sm text-primary">
                <span>Explore {feature.title}</span>
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Benefits Section (for non-members) */}
      {!isMember && (
        <div id="benefits" className="scroll-mt-8 pt-2">
          <h2 className="text-xl font-semibold mb-5">Member Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="p-5 rounded-xl bg-muted/50">
                <benefit.icon className="h-8 w-8 text-emerald-600 mb-3" />
                <h3 className="font-medium mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="p-8 rounded-xl bg-muted/30 border">
        <h2 className="text-lg font-semibold mb-6 text-center">SACCO Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-emerald-600">Growing</p>
            <p className="text-sm text-muted-foreground">Active Members</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600">12%</p>
            <p className="text-sm text-muted-foreground">Interest Rate</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">3x</p>
            <p className="text-sm text-muted-foreground">Max Loan Multiplier</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-600">Annual</p>
            <p className="text-sm text-muted-foreground">Dividend Payout</p>
          </div>
        </div>
      </div>

      {/* CTA Section (for non-members) */}
      {!isMember && (
        <div className="p-8 lg:p-10 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-900/50 text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Ready to Join?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Becoming a member is easy. Start with a minimum of UGX 50,000 and begin your journey 
            to financial growth with fellow artists.
          </p>
          <Link
            href="/sacco/join"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Join SACCO Today
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
