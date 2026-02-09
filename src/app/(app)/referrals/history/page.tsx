'use client';

import { useState } from 'react';
import { Users, Clock, CheckCircle, XCircle, Download, Search, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReferralHistory, type ReferralHistoryItem } from '@/hooks/useReferrals';

type ReferralStatus = 'active' | 'pending' | 'churned' | 'completed';

const statusConfig: Record<ReferralStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-500', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500', icon: Clock },
  churned: { label: 'Churned', color: 'bg-red-500/10 text-red-500', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-purple-500/10 text-purple-500', icon: CheckCircle },
};

export default function ReferralHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useReferralHistory(
    statusFilter === 'all' ? undefined : statusFilter,
    currentPage,
    itemsPerPage,
    searchQuery || undefined
  );

  const handleExport = () => {
    // In production, generate CSV and download
    console.log('Exporting referral data...');
    alert('Export feature coming soon!');
  };

  const handleStatusFilter = (newFilter: ReferralStatus | 'all') => {
    setStatusFilter(newFilter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Unable to load referral history</h3>
              <p className="text-gray-400">Please try again later or contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const referrals = data?.referrals ?? [];
  const pagination = data?.pagination ?? { current_page: 1, last_page: 1, total: 0 };
  const stats = data?.stats ?? { total: 0, pending: 0, active: 0, completed: 0, churned: 0, total_credits: 0 };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Referral History</h1>
          <p className="text-gray-400">Track all your referrals and their status</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-gray-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-sm text-gray-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            <p className="text-sm text-gray-400">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-sm text-gray-400">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{stats.completed}</p>
            <p className="text-sm text-gray-400">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.churned}</p>
            <p className="text-sm text-gray-400">Churned</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.total_credits.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Credits Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('all')}
                className={statusFilter === 'all' ? '' : 'border-zinc-700'}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'border-zinc-700'}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('pending')}
                className={statusFilter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-zinc-700'}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'churned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('churned')}
                className={statusFilter === 'churned' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-700'}
              >
                Churned
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            All Referrals ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referrals found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral: ReferralHistoryItem) => {
                const status = referral.status as ReferralStatus;
                const StatusIcon = statusConfig[status]?.icon || Clock;
                const config = statusConfig[status] || statusConfig.pending;
                return (
                  <div
                    key={referral.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-800/50 rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {referral.user.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-white">{referral.user.name}</p>
                        <p className="text-sm text-gray-400">{referral.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="text-gray-400">
                        Joined: <span className="text-white">{new Date(referral.joined_at).toLocaleDateString()}</span>
                      </div>
                      {referral.active_days !== undefined && (
                        <div className="text-gray-400">
                          Active: <span className="text-white">{referral.active_days} days</span>
                        </div>
                      )}
                      {referral.subscription_tier && (
                        <Badge variant="outline" className="border-zinc-700">
                          {referral.subscription_tier}
                        </Badge>
                      )}
                      <Badge className={config.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                      <div className="font-semibold text-green-400">
                        +{referral.credits_earned} credits
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
              <p className="text-sm text-gray-400">
                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={pagination.current_page === 1}
                  className="border-zinc-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let page: number;
                  if (pagination.last_page <= 5) {
                    page = i + 1;
                  } else if (pagination.current_page <= 3) {
                    page = i + 1;
                  } else if (pagination.current_page >= pagination.last_page - 2) {
                    page = pagination.last_page - 4 + i;
                  } else {
                    page = pagination.current_page - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={page === pagination.current_page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={page === pagination.current_page ? '' : 'border-zinc-700'}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="border-zinc-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
