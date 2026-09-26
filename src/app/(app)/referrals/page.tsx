'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Share2, 
  Copy, 
  Users, 
  Gift, 
  Trophy,
  MessageCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Twitter,
  Facebook,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferralDashboard, useReferralLeaderboard, useTrackShare } from '@/hooks/useReferrals';
import { getReferralOfferCopy } from '@/lib/referral-copy';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-emerald-700 dark:text-green-400',
  pending: 'bg-yellow-500/20 text-amber-700 dark:text-yellow-400',
  completed: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
  churned: 'bg-red-500/20 text-red-700 dark:text-red-400',
};

const tierColors: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-muted-foreground dark:text-gray-400',
  gold: 'text-amber-700 dark:text-yellow-400',
  platinum: 'text-purple-700 dark:text-purple-400',
  diamond: 'text-cyan-400',
};

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  
  const { data: dashboard, isLoading, error } = useReferralDashboard();
  const { data: leaderboardData } = useReferralLeaderboard('all_time', 5);


  const trackShare = useTrackShare();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackShare.mutate('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareFromPhone = async () => {
    if (!dashboard?.referral_link) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join me on TesoTunes', url: dashboard.referral_link });
        trackShare.mutate('native');
        return;
      } catch { /* The person may cancel the share sheet. */ }
    }
    await copyToClipboard(dashboard.referral_link);
  };

  const shareToSocial = (platform: 'whatsapp' | 'twitter' | 'facebook') => {
    if (!dashboard?.referral_link) return;
    
    const message = encodeURIComponent(
      (dashboard.reward_rates?.joiner_credits ?? 0) > 0
        ? `Join me on TesoTunes - stream and support Ugandan music! 🎵 Get ${dashboard.reward_rates?.joiner_credits} free credits when you sign up: ${dashboard.referral_link}`
        : `Join me on TesoTunes - stream and support Ugandan music! 🎵 ${dashboard.referral_link}`
    );
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${message}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dashboard.referral_link)}`,
      whatsapp: `https://wa.me/?text=${message}`,
    };

    trackShare.mutate(platform);
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-700 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-foreground dark:text-white">Unable to load referral data</h3>
              <p className="text-muted-foreground dark:text-gray-400">Please try again later or contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, referral_code, referral_link, recent_referrals, next_milestone, claimable_rewards } = dashboard;

  // Read from credit_rates rather than stated in copy, so the page cannot
  // advertise a rate the platform will not pay.
  const referrerCredits = dashboard.reward_rates?.referrer_credits ?? 0;
  const joinerCredits = dashboard.reward_rates?.joiner_credits ?? 0;
  const offerCopy = getReferralOfferCopy(referrerCredits, joinerCredits);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground dark:text-white sm:text-3xl">Invite Friends, Earn Rewards</h1>
        <p className="max-w-3xl text-sm text-muted-foreground dark:text-gray-400 sm:text-base">
          {offerCopy.summary}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-4">
        <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-emerald-700 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground dark:text-white">{stats.total}</p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-amber-700 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground dark:text-white">{stats.pending}</p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground dark:text-white">{stats.completed}</p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Gift className="w-5 h-5 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground dark:text-white">{stats.total_credits_earned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Credits Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* A time-limited referral push (double credits for a week, say) is a
          window on the referral rate at /admin/rewards — credit_rates carries
          starts_at and ends_at and RewardRuleService honours them. A separate
          "special campaigns" system would be a second way to say the same
          thing, so this section and its endpoints were dropped rather than
          built. */}


      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Left Column - Share Tools */}
        <div className="lg:col-span-2 space-y-6">
          {/* Share Card */}
          <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Your Link
              </CardTitle>
              <CardDescription>
                {offerCopy.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral Link */}
              <div className="flex gap-2">
                <div className="flex-1 bg-muted dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-lg px-4 py-3 text-foreground dark:text-white font-mono text-sm truncate">
                  {referral_link}
                </div>
                <Button 
                  onClick={() => copyToClipboard(referral_link)}
                  className={copied ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {/* Referral Code */}
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-sm text-muted-foreground dark:text-gray-400">Or share code:</span>
                <div className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted px-4 py-2 font-mono font-bold text-foreground dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:flex-none">
                  {referral_code}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(referral_code)}
                  className="border-border dark:border-zinc-700"
                  aria-label="Copy referral code"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Social Share Buttons */}
              <div className="pt-4 border-t border-border dark:border-zinc-800">
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3">Share directly:</p>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <Button 
                    onClick={() => shareToSocial('whatsapp')}
                    className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('twitter')}
                    className="w-full bg-sky-500 hover:bg-sky-600 sm:w-auto"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('facebook')}
                    className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="outline" className="w-full border-border dark:border-zinc-700 sm:w-auto"
                    onClick={() => {
                      window.location.href = `sms:?body=${encodeURIComponent(`Join me on TesoTunes: ${referral_link}`)}`;
                      trackShare.mutate('sms');
                    }}>
                    <Send className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                  <Button variant="outline" className="col-span-2 w-full border-border dark:border-zinc-700 sm:w-auto" onClick={shareFromPhone}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestone Progress */}
          {next_milestone && (
            <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-700 dark:text-yellow-400" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground dark:text-gray-400">{next_milestone.name}</span>
                  <span className="text-foreground dark:text-white font-bold">
                    {next_milestone.current_count}/{next_milestone.referrals_required} referrals
                  </span>
                </div>
                <Progress value={next_milestone.progress} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {next_milestone.referrals_required - next_milestone.current_count} more to earn{' '}
                  <span className="text-amber-700 dark:text-yellow-400 font-semibold">
                    {next_milestone.reward_type === 'credits' 
                      ? `${next_milestone.reward_value} credits`
                      : next_milestone.reward_type}
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recent Referrals */}
          <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Referrals
              </CardTitle>
              <Link href="/referrals/history">
                <Button variant="ghost" size="sm" className="text-purple-700 dark:text-purple-400">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recent_referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No referrals yet. Share your link to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent_referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex flex-col gap-3 rounded-lg bg-muted/60 p-3 dark:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 font-semibold text-white">
                          {referral.user.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground dark:text-white">{referral.user.name}</p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">
                            Joined {new Date(referral.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:justify-end">
                        <Badge className={statusColors[referral.status]}>
                          {referral.status}
                        </Badge>
                        {referral.credits_earned > 0 && (
                          <span className="text-emerald-700 dark:text-green-400 font-semibold">
                            +{referral.credits_earned}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Leaderboard & Rewards */}
        <div className="space-y-6">
          {/* Claimable Rewards Alert */}
          {claimable_rewards > 0 && (
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Gift className="w-6 h-6 text-amber-700 dark:text-yellow-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-amber-700 dark:text-yellow-400">
                      {claimable_rewards} Reward{claimable_rewards > 1 ? 's' : ''} Ready!
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Claim your earned rewards</p>
                  </div>
                  <Link href="/referrals/rewards" className="w-full sm:w-auto">
                    <Button size="sm" className="w-full bg-yellow-500 text-black hover:bg-yellow-600 sm:w-auto">
                      Claim
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
            <CardContent className="p-4 space-y-2">
              <Link href="/referrals/history" className="flex items-center justify-between p-3 bg-muted/60 dark:bg-zinc-800/50 rounded-lg hover:bg-muted dark:hover:bg-zinc-800 transition-colors">
                <span className="text-foreground dark:text-white">View Full History</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground dark:text-gray-400" />
              </Link>
              <Link href="/referrals/rewards" className="flex items-center justify-between p-3 bg-muted/60 dark:bg-zinc-800/50 rounded-lg hover:bg-muted dark:hover:bg-zinc-800 transition-colors">
                <span className="text-foreground dark:text-white">My Rewards & Badges</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground dark:text-gray-400" />
              </Link>
              <Link href="/referrals/leaderboard" className="flex items-center justify-between p-3 bg-muted/60 dark:bg-zinc-800/50 rounded-lg hover:bg-muted dark:hover:bg-zinc-800 transition-colors">
                <span className="text-foreground dark:text-white">Full Leaderboard</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground dark:text-gray-400" />
              </Link>
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-foreground dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-700 dark:text-yellow-400" />
                Top Referrers
              </CardTitle>
              <Link href="/referrals/leaderboard">
                <Button variant="ghost" size="sm" className="text-purple-700 dark:text-purple-400">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData?.leaderboard.slice(0, 5).map((referrer, index) => (
                  <div
                    key={referrer.user_id}
                    className="flex min-w-0 items-center justify-between gap-2 p-2"
                  >
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      <span className={`w-6 text-center font-bold ${index < 3 ? 'text-amber-700 dark:text-yellow-400' : 'text-muted-foreground dark:text-gray-400'}`}>
                        {referrer.rank}
                      </span>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                        {referrer.name?.charAt(0) || '?'}
                      </div>
                      <span className="truncate text-sm text-foreground dark:text-white sm:text-base">{referrer.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-muted-foreground dark:text-gray-400 text-sm">{referrer.referrals}</span>
                      <span className={`text-xs ${tierColors[referrer.tier]}`}>
                        {referrer.tier}
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground dark:text-gray-400 py-4">Loading...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-white">Share your link</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Send to friends via any platform</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-white">They sign up</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">{offerCopy.joinerStep}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  {/* Was "They become active — you earn 50 credits". The
                      referrer is paid at signup, at the live rate. */}
                  <div>
                    <p className="font-medium text-foreground dark:text-white">You get credited</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      {offerCopy.referrerStep}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-white">Unlock milestones</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Claim bonus credits as more friends join</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
