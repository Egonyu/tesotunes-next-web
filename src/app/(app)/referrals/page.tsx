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
  QrCode,
  CheckCircle,
  Clock,
  ChevronRight,
  Twitter,
  Facebook,
  Send,
  Loader2,
  AlertCircle,
  Zap,
  Star,
  Crown,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferralDashboard, useReferralLeaderboard, useTrackShare, useActiveSpecialCampaigns, useJoinSpecialCampaign } from '@/hooks/useReferrals';
import type { SpecialCampaign } from '@/hooks/useReferrals';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-purple-500/20 text-purple-400',
  churned: 'bg-red-500/20 text-red-400',
};

const tierColors: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-400',
  platinum: 'text-purple-400',
  diamond: 'text-cyan-400',
};

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  
  const { data: dashboard, isLoading, error } = useReferralDashboard();
  const { data: leaderboardData } = useReferralLeaderboard('all_time', 5);
  const { data: specialCampaigns } = useActiveSpecialCampaigns();
  const joinCampaign = useJoinSpecialCampaign();
  const trackShare = useTrackShare();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    trackShare.mutate('copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: 'whatsapp' | 'twitter' | 'facebook') => {
    if (!dashboard?.referral_link) return;
    
    const message = encodeURIComponent(
      `Join me on TesoTunes - Uganda's #1 music streaming platform! 🎵 Get 50 free credits when you sign up: ${dashboard.referral_link}`
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
      <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Unable to load referral data</h3>
              <p className="text-gray-400">Please try again later or contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, referral_code, referral_link, recent_referrals, next_milestone, claimable_rewards } = dashboard;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Invite Friends, Earn Rewards</h1>
        <p className="text-gray-400">
          Share TesoTunes with friends and earn credits for every person who joins!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-gray-400">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                <p className="text-xs text-gray-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Gift className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total_credits_earned.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Credits Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Campaigns */}
      {specialCampaigns && specialCampaigns.length > 0 && (
        <div className="space-y-4 mb-8">
          {specialCampaigns.map((campaign: SpecialCampaign) => {
            const typeConfig: Record<string, { icon: React.ReactNode; gradient: string; badge: string; badgeColor: string }> = {
              double_points: {
                icon: <Zap className="w-6 h-6 text-yellow-400" />,
                gradient: 'from-yellow-500/20 to-orange-500/20',
                badge: `${campaign.multiplier}x Points`,
                badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
              },
              bonus_credits: {
                icon: <Star className="w-6 h-6 text-green-400" />,
                gradient: 'from-green-500/20 to-emerald-500/20',
                badge: `+${campaign.bonus_credits} Bonus`,
                badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
              },
              exclusive_badge: {
                icon: <Crown className="w-6 h-6 text-purple-400" />,
                gradient: 'from-purple-500/20 to-pink-500/20',
                badge: 'Exclusive Badge',
                badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
              },
              premium_trial: {
                icon: <Trophy className="w-6 h-6 text-cyan-400" />,
                gradient: 'from-cyan-500/20 to-blue-500/20',
                badge: 'Premium Trial',
                badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
              },
            };

            const config = typeConfig[campaign.type] || typeConfig.double_points;
            const endDate = new Date(campaign.end_date);
            const now = new Date();
            const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            const spotsLeft = campaign.max_participants ? campaign.max_participants - campaign.participants_count : null;

            return (
              <Card key={campaign.id} className={`bg-linear-to-r ${config.gradient} border-zinc-700 overflow-hidden`}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="p-3 bg-zinc-800/50 rounded-xl shrink-0">
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-white text-lg">{campaign.name}</h3>
                        <Badge className={`${config.badgeColor} border`}>{config.badge}</Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{campaign.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5" />
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {campaign.participants_count.toLocaleString()} joined
                        </span>
                        {spotsLeft !== null && (
                          <span className="text-orange-400">
                            {spotsLeft.toLocaleString()} spots left
                          </span>
                        )}
                      </div>
                      {campaign.requirements && (
                        <p className="text-xs text-gray-500 mt-1">Requires: {campaign.requirements}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {campaign.has_joined ? (
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 py-1.5 px-3">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Joined
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => joinCampaign.mutate(campaign.id)}
                          disabled={joinCampaign.isPending}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {joinCampaign.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4 mr-2" />
                          )}
                          Join Campaign
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Share Tools */}
        <div className="lg:col-span-2 space-y-6">
          {/* Share Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Your Link
              </CardTitle>
              <CardDescription>
                Friends who join get 50 bonus credits. You get 50 credits per signup!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral Link */}
              <div className="flex gap-2">
                <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-sm truncate">
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
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">Or share code:</span>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 font-mono font-bold text-white">
                  {referral_code}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(referral_code)}
                  className="border-zinc-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Social Share Buttons */}
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-sm text-gray-400 mb-3">Share directly:</p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => shareToSocial('whatsapp')}
                    className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('twitter')}
                    className="bg-sky-500 hover:bg-sky-600 flex-1 sm:flex-none"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('facebook')}
                    className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-zinc-700 flex-1 sm:flex-none"
                    onClick={() => trackShare.mutate('sms')}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-zinc-700 flex-1 sm:flex-none"
                    onClick={() => trackShare.mutate('qr')}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestone Progress */}
          {next_milestone && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">{next_milestone.name}</span>
                  <span className="text-white font-bold">
                    {next_milestone.current_count}/{next_milestone.referrals_required} referrals
                  </span>
                </div>
                <Progress value={next_milestone.progress} className="h-3 mb-2" />
                <p className="text-sm text-gray-400">
                  {next_milestone.referrals_required - next_milestone.current_count} more to earn{' '}
                  <span className="text-yellow-400 font-semibold">
                    {next_milestone.reward_type === 'credits' 
                      ? `${next_milestone.reward_value} credits`
                      : next_milestone.reward_type}
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recent Referrals */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Referrals
              </CardTitle>
              <Link href="/referrals/history">
                <Button variant="ghost" size="sm" className="text-purple-400">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recent_referrals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No referrals yet. Share your link to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent_referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {referral.user.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{referral.user.name}</p>
                          <p className="text-xs text-gray-400">
                            Joined {new Date(referral.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[referral.status]}>
                          {referral.status}
                        </Badge>
                        {referral.credits_earned > 0 && (
                          <span className="text-green-400 font-semibold">
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
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Gift className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-400">
                      {claimable_rewards} Reward{claimable_rewards > 1 ? 's' : ''} Ready!
                    </p>
                    <p className="text-sm text-gray-400">Claim your earned rewards</p>
                  </div>
                  <Link href="/referrals/rewards">
                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      Claim
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 space-y-2">
              <Link href="/referrals/history" className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <span className="text-white">View Full History</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/referrals/rewards" className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <span className="text-white">My Rewards & Badges</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/referrals/leaderboard" className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <span className="text-white">Full Leaderboard</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Referrers
              </CardTitle>
              <Link href="/referrals/leaderboard">
                <Button variant="ghost" size="sm" className="text-purple-400">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData?.leaderboard.slice(0, 5).map((referrer, index) => (
                  <div
                    key={referrer.user_id}
                    className="flex items-center justify-between p-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-bold ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {referrer.rank}
                      </span>
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {referrer.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-white">{referrer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">{referrer.referrals}</span>
                      <span className={`text-xs ${tierColors[referrer.tier]}`}>
                        {referrer.tier}
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-gray-400 py-4">Loading...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white">Share your link</p>
                    <p className="text-sm text-gray-400">Send to friends via any platform</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white">They sign up</p>
                    <p className="text-sm text-gray-400">They get 50 bonus credits</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white">They become active</p>
                    <p className="text-sm text-gray-400">You earn 50 credits</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-white">Unlock milestones</p>
                    <p className="text-sm text-gray-400">Get bonus rewards at 5, 10, 25+ referrals</p>
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
