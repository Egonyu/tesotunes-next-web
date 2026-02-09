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
  TrendingUp,
  DollarSign,
  Download,
  Image,
  ExternalLink,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  useArtistReferralDashboard,
  useArtistFanSignups,
  useArtistEarningsShare,
  useArtistPromoMaterials,
  useTrackArtistShare,
  type FanSignup,
  type PromoMaterial
} from '@/hooks/useArtist';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  inactive: 'bg-red-500/20 text-red-400',
};

const platformIcons: Record<string, React.ElementType> = {
  instagram: Image,
  twitter: Twitter,
  facebook: Facebook,
  whatsapp: MessageCircle,
  universal: Share2,
};

export default function ArtistReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'fans' | 'earnings' | 'promo'>('overview');

  const { data: dashboard, isLoading, error } = useArtistReferralDashboard();
  const { data: promoMaterials } = useArtistPromoMaterials();
  const trackShare = useTrackArtistShare();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    trackShare.mutate('copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: 'whatsapp' | 'twitter' | 'facebook') => {
    if (!dashboard?.link?.branded_link) return;

    const message = encodeURIComponent(
      `Join my fanbase on TesoTunes! Stream my music, get exclusive rewards & earn credits. Sign up here: ${dashboard.link.branded_link}`
    );

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${message}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dashboard.link.branded_link)}`,
      whatsapp: `https://wa.me/?text=${message}`,
    };

    trackShare.mutate(platform);
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">Failed to load referral data</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, link, recent_signups, top_fans, earnings_chart } = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fan Referrals</h1>
          <p className="text-muted-foreground">
            Grow your fanbase and earn commission on every referred fan&apos;s activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(link.branded_link)}
            className={copied ? 'bg-green-600 text-white border-green-600' : ''}
          >
            {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button size="sm" onClick={() => shareToSocial('whatsapp')} className="bg-green-600 hover:bg-green-700">
            <MessageCircle className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_referrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
            </div>
            {stats.monthly_change !== 0 && (
              <div className="mt-2 flex items-center gap-1">
                {stats.monthly_change > 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                )}
                <span className={`text-xs ${stats.monthly_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(stats.monthly_change)}% this month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active_fans}</p>
                <p className="text-xs text-muted-foreground">Active Fans</p>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">
                {stats.conversion_rate}% conversion rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_commission.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Commission</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending_commission.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending Payout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['overview', 'fans', 'earnings', 'promo'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'promo' ? 'Promo Materials' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Your Referral Link
                </CardTitle>
                <CardDescription>
                  Fans who sign up via your link get 50 bonus credits. You earn 5% commission on their purchases!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Branded Link */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Branded Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted border rounded-lg px-4 py-3 font-mono text-sm truncate">
                      {link.branded_link}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(link.branded_link)}
                      className={copied ? 'bg-green-600' : ''}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-sm">Code:</span>
                  <div className="bg-muted border rounded-lg px-4 py-2 font-mono font-bold">
                    {link.referral_code}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.referral_code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {/* Social Share */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">Share directly:</p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => shareToSocial('whatsapp')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={() => shareToSocial('twitter')}
                      className="bg-sky-500 hover:bg-sky-600"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareToSocial('facebook')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" onClick={() => trackShare.mutate('sms')}>
                      <Send className="w-4 h-4 mr-2" />
                      SMS
                    </Button>
                    <Button variant="outline" onClick={() => trackShare.mutate('qr')}>
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signups Chart */}
            {earnings_chart && earnings_chart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Referral Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end gap-1">
                    {earnings_chart.slice(-14).map((point, i) => {
                      const maxSignups = Math.max(...earnings_chart.slice(-14).map(p => p.signups), 1);
                      const height = (point.signups / maxSignups) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs text-muted-foreground">{point.signups}</span>
                          <div
                            className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${point.date}: ${point.signups} signups, ${point.commission} credits commission`}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(point.date).getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Signups */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Fan Signups
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('fans')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {recent_signups.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No fan signups yet. Share your link to grow your fanbase!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recent_signups.slice(0, 5).map((fan) => (
                      <FanSignupRow key={fan.id} fan={fan} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Commission Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">5% Commission</p>
                    <p className="text-sm text-muted-foreground">On referred fan purchases</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  You earn 5% commission on every purchase made by fans who signed up through your link -
                  subscriptions, store purchases, event tickets, and credit top-ups.
                </p>
              </CardContent>
            </Card>

            {/* Top Fans */}
            {top_fans && top_fans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Top Referred Fans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {top_fans.slice(0, 5).map((fan, index) => (
                      <div key={fan.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 text-center font-bold ${index < 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                            {index + 1}
                          </span>
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                            {fan.fan.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm font-medium">{fan.fan.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-400">+{fan.commission_earned}</p>
                          <p className="text-xs text-muted-foreground">{fan.streams} streams</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Artist Referrals Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Share your branded link</p>
                      <p className="text-sm text-muted-foreground">
                        &quot;Join my fanbase on TesoTunes&quot;
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Fans sign up & follow you</p>
                      <p className="text-sm text-muted-foreground">They get 50 bonus credits</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Track their activity</p>
                      <p className="text-sm text-muted-foreground">See streams, purchases, engagement</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Earn 5% commission</p>
                      <p className="text-sm text-muted-foreground">On every purchase they make</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'fans' && (
        <FanTrackingTab />
      )}

      {activeTab === 'earnings' && (
        <EarningsTab />
      )}

      {activeTab === 'promo' && (
        <PromoMaterialsTab materials={promoMaterials || []} />
      )}
    </div>
  );
}

// ============================================================================
// Fan Signup Row Component
// ============================================================================

function FanSignupRow({ fan }: { fan: FanSignup }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
          {fan.fan.name?.charAt(0) || '?'}
        </div>
        <div>
          <p className="font-medium">{fan.fan.name}</p>
          <p className="text-xs text-muted-foreground">
            @{fan.fan.username} &middot; Joined {new Date(fan.joined_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">{fan.streams} streams</p>
          <p className="text-xs text-muted-foreground">{fan.purchases} purchases</p>
        </div>
        <Badge className={statusColors[fan.status]}>
          {fan.status}
        </Badge>
        {fan.commission_earned > 0 && (
          <span className="text-green-400 font-semibold text-sm">
            +{fan.commission_earned}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Fan Tracking Tab
// ============================================================================

function FanTrackingTab() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useArtistFanSignups({
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    page,
    per_page: 20,
  });

  const fans = data?.data || [];
  const pagination = data?.pagination;
  const fanStats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Fan Stats */}
      {fanStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{fanStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Fans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{fanStats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{fanStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{fanStats.inactive}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search fans..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-muted border rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['', 'active', 'pending', 'inactive'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setStatusFilter(status); setPage(1); }}
            >
              {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Fan List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : fans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No fans found matching your criteria.</p>
            </div>
          ) : (
            <div className="divide-y">
              {fans.map((fan) => (
                <div key={fan.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {fan.fan.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{fan.fan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{fan.fan.username} &middot; Joined {new Date(fan.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{fan.streams}</p>
                        <p className="text-xs text-muted-foreground">Streams</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{fan.purchases}</p>
                        <p className="text-xs text-muted-foreground">Purchases</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-400">+{fan.commission_earned}</p>
                        <p className="text-xs text-muted-foreground">Commission</p>
                      </div>
                    </div>
                    <Badge className={statusColors[fan.status]}>
                      {fan.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.last_page}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Earnings Tab
// ============================================================================

function EarningsTab() {
  const { data: earnings, isLoading } = useArtistEarningsShare();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!earnings) return null;

  return (
    <div className="space-y-6">
      {/* Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Commission</p>
            <p className="text-2xl font-bold">{earnings.total_commission.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">credits earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Pending Payout</p>
            <p className="text-2xl font-bold text-yellow-400">{earnings.pending_payout.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">awaiting settlement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Paid Out</p>
            <p className="text-2xl font-bold text-green-400">{earnings.paid_out.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">credited to wallet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Commission Rate</p>
            <p className="text-2xl font-bold text-primary">{earnings.commission_rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">on fan purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Commission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No commission transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {earnings.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.purchase_type === 'subscription' ? 'bg-purple-500/20' :
                      tx.purchase_type === 'store' ? 'bg-blue-500/20' :
                      tx.purchase_type === 'event' ? 'bg-orange-500/20' :
                      'bg-green-500/20'
                    }`}>
                      <DollarSign className={`w-4 h-4 ${
                        tx.purchase_type === 'subscription' ? 'text-purple-400' :
                        tx.purchase_type === 'store' ? 'text-blue-400' :
                        tx.purchase_type === 'event' ? 'text-orange-400' :
                        'text-green-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.fan_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {tx.purchase_type} purchase &middot; {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">+{tx.commission_amount}</p>
                    <p className="text-xs text-muted-foreground">
                      from {tx.purchase_amount} ({earnings.commission_rate}%)
                    </p>
                    <Badge className={tx.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Promotional Materials Tab
// ============================================================================

function PromoMaterialsTab({ materials }: { materials: PromoMaterial[] }) {
  const platformLabels: Record<string, string> = {
    instagram: 'Instagram',
    twitter: 'Twitter/X',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    universal: 'Universal',
  };

  const typeLabels: Record<string, string> = {
    banner: 'Banner',
    story: 'Story',
    post: 'Post',
    flyer: 'Flyer',
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <p className="font-semibold mb-1">Promotional Materials</p>
          <p className="text-sm text-muted-foreground">
            Download branded graphics to promote your referral link across social media and at events.
            Each graphic includes your unique referral link and QR code.
          </p>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-1">No promotional materials yet</p>
            <p className="text-sm">Promotional materials will be available soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => {
            const PlatformIcon = platformIcons[material.platform] || Share2;
            return (
              <Card key={material.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={material.image_url}
                    alt={material.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {material.dimensions}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{material.title}</h3>
                    <div className="flex items-center gap-1">
                      <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {platformLabels[material.platform]}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{material.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{typeLabels[material.type]}</Badge>
                    <a
                      href={material.download_url}
                      download
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
