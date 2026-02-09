'use client';

import { useState } from 'react';
import {
  Megaphone,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause,
  Play,
  Eye,
  ArrowUpRight,
  Gift,
  Ticket,
  ShoppingBag,
  UserPlus,
  CreditCard,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  useCampaignReferralStats,
  useReferralCampaigns,
  useCreateReferralCampaign,
  useUpdateCampaignStatus,
  useConversionAnalytics,
  type ReferralCampaign,
  type ConversionAnalytics
} from '@/hooks/useReferrals';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-blue-500/20 text-blue-400',
  expired: 'bg-red-500/20 text-red-400',
};

const typeIcons: Record<string, React.ElementType> = {
  event: Calendar,
  signup: UserPlus,
  store: ShoppingBag,
  subscription: CreditCard,
};

const typeColors: Record<string, string> = {
  event: 'bg-orange-500/20 text-orange-400',
  signup: 'bg-blue-500/20 text-blue-400',
  store: 'bg-purple-500/20 text-purple-400',
  subscription: 'bg-green-500/20 text-green-400',
};

export default function AdminCampaignsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'analytics' | 'create'>('campaigns');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Campaign Referrals</h1>
          <p className="text-muted-foreground">
            Manage referral campaigns, track conversions, and analyze growth
          </p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Overview */}
      <CampaignStats />

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {([
          { key: 'campaigns' as const, label: 'All Campaigns', icon: Megaphone },
          { key: 'analytics' as const, label: 'Conversion Analytics', icon: BarChart3 },
          { key: 'create' as const, label: 'Create Campaign', icon: Plus },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'campaigns' && <CampaignListTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'create' && <CreateCampaignTab onCreated={() => setActiveTab('campaigns')} />}
    </div>
  );
}

// ============================================================================
// Campaign Stats Component
// ============================================================================

function CampaignStats() {
  const { data: stats, isLoading } = useCampaignReferralStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse h-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold">{stats.total_campaigns}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.active_campaigns}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Referred</span>
          </div>
          <p className="text-2xl font-bold">{stats.total_referred.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-muted-foreground">Conversions</span>
          </div>
          <p className="text-2xl font-bold">{stats.total_conversions.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-muted-foreground">Conv. Rate</span>
          </div>
          <p className="text-2xl font-bold">{stats.conversion_rate}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <p className="text-2xl font-bold">{stats.total_revenue.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Campaign List Tab
// ============================================================================

function CampaignListTab() {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useReferralCampaigns({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    page,
    per_page: 10,
  });

  const updateStatus = useUpdateCampaignStatus();

  const campaigns = data?.data || [];
  const pagination = data?.pagination;

  const handleStatusChange = (id: number, status: 'active' | 'paused' | 'completed') => {
    updateStatus.mutate({ id, status });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-muted border rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-muted border rounded-lg text-sm"
          >
            <option value="">All Types</option>
            <option value="event">Event</option>
            <option value="signup">Signup</option>
            <option value="store">Store</option>
            <option value="subscription">Subscription</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-muted border rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Campaign Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-1">No campaigns found</p>
            <p className="text-sm">Create a new campaign to start tracking referrals.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

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
// Campaign Card Component
// ============================================================================

function CampaignCard({
  campaign,
  onStatusChange,
}: {
  campaign: ReferralCampaign;
  onStatusChange: (id: number, status: 'active' | 'paused' | 'completed') => void;
}) {
  const TypeIcon = typeIcons[campaign.type] || Megaphone;
  const progress = campaign.stats.total_referrals > 0
    ? Math.round((campaign.stats.total_conversions / campaign.stats.total_referrals) * 100)
    : 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Campaign Info */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${typeColors[campaign.type]}`}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <p className="text-sm text-muted-foreground">{campaign.description}</p>
                </div>
              </div>
              <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
            </div>

            {/* Dates & Reward */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Gift className="w-3 h-3" />
                {campaign.reward_description}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {campaign.referral_required} referrals required
              </span>
            </div>

            {/* Conversion Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-semibold">{campaign.stats.conversion_rate}%</span>
              </div>
              <Progress value={campaign.stats.conversion_rate} className="h-2" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {campaign.status === 'draft' && (
                <Button size="sm" onClick={() => onStatusChange(campaign.id, 'active')}>
                  <Play className="w-3 h-3 mr-1" /> Activate
                </Button>
              )}
              {campaign.status === 'active' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => onStatusChange(campaign.id, 'paused')}>
                    <Pause className="w-3 h-3 mr-1" /> Pause
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onStatusChange(campaign.id, 'completed')}>
                    <CheckCircle className="w-3 h-3 mr-1" /> Complete
                  </Button>
                </>
              )}
              {campaign.status === 'paused' && (
                <Button size="sm" onClick={() => onStatusChange(campaign.id, 'active')}>
                  <Play className="w-3 h-3 mr-1" /> Resume
                </Button>
              )}
            </div>
          </div>

          {/* Right: Stats */}
          <div className="lg:w-64 bg-muted/30 p-5 border-t lg:border-t-0 lg:border-l">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Participants</p>
                <p className="text-xl font-bold">{campaign.stats.total_participants.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Referrals</p>
                <p className="text-xl font-bold">{campaign.stats.total_referrals.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversions</p>
                <p className="text-xl font-bold text-green-400">{campaign.stats.total_conversions.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rewards Claimed</p>
                <p className="text-xl font-bold text-purple-400">{campaign.stats.total_rewards_claimed.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Analytics Tab
// ============================================================================

function AnalyticsTab() {
  const [period, setPeriod] = useState<string>('30d');
  const { data: analytics, isLoading } = useConversionAnalytics(period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Unable to load analytics data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { key: '7d', label: '7 Days' },
          { key: '30d', label: '30 Days' },
          { key: '90d', label: '90 Days' },
          { key: 'all', label: 'All Time' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={period === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Campaigns</p>
            <p className="text-2xl font-bold">{analytics.overview.total_campaigns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Referrals</p>
            <p className="text-2xl font-bold">{analytics.overview.total_referrals.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Conversions</p>
            <p className="text-2xl font-bold text-green-400">{analytics.overview.total_conversions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Overall Conversion Rate</p>
            <p className="text-2xl font-bold">{analytics.overview.overall_conversion_rate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-yellow-400">{analytics.overview.total_revenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Rewards Distributed</p>
            <p className="text-2xl font-bold text-purple-400">{analytics.overview.total_rewards_distributed.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Campaign Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance by Campaign Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Type</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Campaigns</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Referrals</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Conversions</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Conv. Rate</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.by_campaign_type.map((row) => {
                  const TypeIcon = typeIcons[row.type] || Megaphone;
                  return (
                    <tr key={row.type} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${typeColors[row.type] || 'bg-muted'}`}>
                            <TypeIcon className="w-3 h-3" />
                          </div>
                          <span className="capitalize font-medium">{row.type}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">{row.campaigns}</td>
                      <td className="py-3 text-right">{row.referrals.toLocaleString()}</td>
                      <td className="py-3 text-right text-green-400">{row.conversions.toLocaleString()}</td>
                      <td className="py-3 text-right">{row.conversion_rate}%</td>
                      <td className="py-3 text-right font-medium">{row.revenue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Trend Chart */}
      {analytics.by_period.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Conversion Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-1">
              {analytics.by_period.map((point, i) => {
                const maxReferrals = Math.max(...analytics.by_period.map(p => p.referrals), 1);
                const refHeight = (point.referrals / maxReferrals) * 100;
                const convHeight = (point.conversions / maxReferrals) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: `${Math.max(refHeight, 4)}%` }}>
                      <div
                        className="flex-1 bg-blue-500/50 rounded-t"
                        style={{ height: '100%' }}
                        title={`${point.period}: ${point.referrals} referrals`}
                      />
                      <div
                        className="flex-1 bg-green-500/80 rounded-t"
                        style={{ height: `${Math.max((convHeight / Math.max(refHeight, 1)) * 100, 8)}%` }}
                        title={`${point.period}: ${point.conversions} conversions`}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                      {point.period}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500/50 rounded" /> Referrals
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/80 rounded" /> Conversions
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="w-5 h-5" />
              Top Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.top_campaigns.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No campaign data yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.top_campaigns.map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-bold ${index < 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{campaign.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-400">{campaign.conversion_rate}%</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.conversions}/{campaign.referrals} conv.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.top_referrers.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No referrer data yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.top_referrers.map((referrer, index) => (
                  <div key={referrer.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-bold ${index < 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {index + 1}
                      </span>
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                        {referrer.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{referrer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {referrer.total_referrals} referrals
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{referrer.total_conversions} conv.</p>
                      <p className="text-xs text-muted-foreground">
                        {referrer.total_revenue.toLocaleString()} rev.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Create Campaign Tab
// ============================================================================

function CreateCampaignTab({ onCreated }: { onCreated: () => void }) {
  const createCampaign = useCreateReferralCampaign();

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'event' as 'event' | 'signup' | 'store' | 'subscription',
    start_date: '',
    end_date: '',
    reward_type: 'credits' as 'credits' | 'ticket' | 'discount' | 'badge',
    reward_value: 0,
    reward_description: '',
    referral_required: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign.mutateAsync(form);
      onCreated();
    } catch {
      // Error handled by mutation
    }
  };

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
        <CardDescription>
          Set up a referral campaign to drive growth through events, signups, store promotions, or subscriptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Campaign Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Campaign Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Festival Free Ticket Drive"
                className="w-full px-4 py-2 bg-muted border rounded-lg"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the campaign goals and how it works..."
                className="w-full px-4 py-2 bg-muted border rounded-lg min-h-[80px] resize-y"
                rows={3}
              />
            </div>

            {/* Campaign Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {(['event', 'signup', 'store', 'subscription'] as const).map((type) => {
                  const TypeIcon = typeIcons[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField('type', type)}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                        form.type === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <TypeIcon className="w-4 h-4" />
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Referral Required */}
            <div>
              <label className="block text-sm font-medium mb-1">Referrals Required *</label>
              <input
                type="number"
                min={1}
                value={form.referral_required}
                onChange={(e) => updateField('referral_required', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 bg-muted border rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of referrals needed to earn the reward
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                className="w-full px-4 py-2 bg-muted border rounded-lg"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                className="w-full px-4 py-2 bg-muted border rounded-lg"
                required
              />
            </div>

            {/* Reward Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Reward Type *</label>
              <select
                value={form.reward_type}
                onChange={(e) => updateField('reward_type', e.target.value as typeof form.reward_type)}
                className="w-full px-4 py-2 bg-muted border rounded-lg"
              >
                <option value="credits">Credits</option>
                <option value="ticket">Free Ticket</option>
                <option value="discount">Discount</option>
                <option value="badge">Badge</option>
              </select>
            </div>

            {/* Reward Value */}
            <div>
              <label className="block text-sm font-medium mb-1">Reward Value *</label>
              <input
                type="number"
                min={0}
                value={form.reward_value}
                onChange={(e) => updateField('reward_value', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-muted border rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.reward_type === 'credits' ? 'Number of credits' :
                 form.reward_type === 'discount' ? 'Discount percentage' :
                 form.reward_type === 'ticket' ? 'Number of free tickets' :
                 'Badge tier level'}
              </p>
            </div>

            {/* Reward Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Reward Description *</label>
              <input
                type="text"
                value={form.reward_description}
                onChange={(e) => updateField('reward_description', e.target.value)}
                placeholder="e.g., Refer 3 friends and get a free VIP ticket"
                className="w-full px-4 py-2 bg-muted border rounded-lg"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCreated}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCampaign.isPending}>
              {createCampaign.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
