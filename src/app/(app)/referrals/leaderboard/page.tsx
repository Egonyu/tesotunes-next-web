'use client';

import { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users, Gift, Calendar, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReferralLeaderboard, type LeaderboardEntry } from '@/hooks/useReferrals';

type TimeFilter = 'weekly' | 'monthly' | 'all_time';

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: 'bg-amber-700', text: 'text-amber-400', border: 'border-amber-600' },
  silver: { bg: 'bg-gray-500', text: 'text-gray-300', border: 'border-gray-400' },
  gold: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-400' },
  platinum: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-400' },
  diamond: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400' },
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  }
};

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all_time');
  const [limit, setLimit] = useState(20);
  
  const { data, isLoading, error } = useReferralLeaderboard(timeFilter, limit);

  const loadMore = () => {
    setLimit(prev => prev + 20);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Unable to load leaderboard</h3>
              <p className="text-gray-400">Please try again later or contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { leaderboard, current_user } = data;
  const topThree = leaderboard.slice(0, 3);
  const restOfBoard = leaderboard.slice(3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Referral Leaderboard</h1>
        <p className="text-gray-400">See how you stack up against other referrers</p>
      </div>

      {/* Time Filter */}
      <div className="flex justify-center gap-2 mb-8">
        <Button
          variant={timeFilter === 'weekly' ? 'default' : 'outline'}
          onClick={() => setTimeFilter('weekly')}
          className={timeFilter === 'weekly' ? '' : 'border-zinc-700'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          This Week
        </Button>
        <Button
          variant={timeFilter === 'monthly' ? 'default' : 'outline'}
          onClick={() => setTimeFilter('monthly')}
          className={timeFilter === 'monthly' ? '' : 'border-zinc-700'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          This Month
        </Button>
        <Button
          variant={timeFilter === 'all_time' ? 'default' : 'outline'}
          onClick={() => setTimeFilter('all_time')}
          className={timeFilter === 'all_time' ? '' : 'border-zinc-700'}
        >
          <Trophy className="w-4 h-4 mr-2" />
          All Time
        </Button>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <Card className="bg-linear-to-b from-purple-900/50 to-zinc-900 border-purple-500/30 mb-8">
          <CardContent className="pt-8">
            <div className="flex justify-center items-end gap-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-linear-to-b from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-2 ring-4 ring-gray-500/50">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="bg-gray-500/20 rounded-lg p-3 min-w-[120px]">
                  <p className="font-semibold text-white text-sm truncate">{topThree[1]?.name}</p>
                  <p className="text-gray-400 text-xs">{topThree[1]?.referrals} referrals</p>
                  <Badge className={`${tierColors[topThree[1]?.tier || 'bronze']?.bg || 'bg-amber-700'} text-xs mt-1`}>
                    {topThree[1]?.tier}
                  </Badge>
                </div>
                <div className="h-24 bg-linear-to-t from-gray-600 to-gray-500 rounded-t-lg mt-2" />
              </div>

              {/* 1st Place */}
              <div className="text-center -mt-8">
                <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-pulse" />
                <div className="w-24 h-24 mx-auto bg-linear-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2 ring-4 ring-yellow-400/50">
                  <span className="text-3xl font-bold text-black">1</span>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-3 min-w-[140px]">
                  <p className="font-semibold text-white truncate">{topThree[0]?.name}</p>
                  <p className="text-yellow-400 text-sm">{topThree[0]?.referrals} referrals</p>
                  <p className="text-gray-400 text-xs">{topThree[0]?.credits_earned.toLocaleString()} credits earned</p>
                  <Badge className={`${tierColors[topThree[0]?.tier || 'bronze']?.bg || 'bg-amber-700'} mt-1`}>
                    {topThree[0]?.tier}
                  </Badge>
                </div>
                <div className="h-32 bg-linear-to-t from-yellow-600 to-yellow-500 rounded-t-lg mt-2" />
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-linear-to-b from-amber-600 to-amber-800 rounded-full flex items-center justify-center mb-2 ring-4 ring-amber-600/50">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="bg-amber-600/20 rounded-lg p-3 min-w-[120px]">
                  <p className="font-semibold text-white text-sm truncate">{topThree[2]?.name}</p>
                  <p className="text-gray-400 text-xs">{topThree[2]?.referrals} referrals</p>
                  <Badge className={`${tierColors[topThree[2]?.tier || 'bronze']?.bg || 'bg-amber-700'} text-xs mt-1`}>
                    {topThree[2]?.tier}
                  </Badge>
                </div>
                <div className="h-16 bg-linear-to-t from-amber-700 to-amber-600 rounded-t-lg mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Position */}
      {current_user && (
        <Card className="bg-purple-600/20 border-purple-500/50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="font-bold text-white">{current_user.rank}</span>
                </div>
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {current_user.name?.charAt(0) || 'Y'}
                </div>
                <div>
                  <p className="font-semibold text-white">Your Position</p>
                  <p className="text-sm text-gray-400">{current_user.referrals} referrals</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-green-400 font-semibold">+{current_user.credits_earned.toLocaleString()} credits</p>
                  {current_user.movement === 'up' && (current_user.movement_value ?? 0) > 0 && (
                    <p className="text-xs text-green-400 flex items-center justify-end">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Up {current_user.movement_value} places
                    </p>
                  )}
                </div>
                <Badge className={tierColors[current_user.tier]?.bg || 'bg-amber-700'}>
                  {current_user.tier}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet. Be the first to climb the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {restOfBoard.map((entry: LeaderboardEntry) => {
                const isCurrentUser = current_user?.user_id === entry.user_id;
                const tier = entry.tier || 'bronze';
                
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      isCurrentUser
                        ? 'bg-purple-600/20 border border-purple-500/50'
                        : 'bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 text-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        isCurrentUser ? 'bg-purple-600' : tierColors[tier]?.bg || 'bg-amber-700'
                      }`}>
                        {entry.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className={`font-medium ${isCurrentUser ? 'text-purple-400' : 'text-white'}`}>
                          {entry.name}
                          {isCurrentUser && <span className="text-xs ml-2">(You)</span>}
                        </p>
                        <p className="text-sm text-gray-400">{entry.referrals} referrals</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-green-400">+{entry.credits_earned.toLocaleString()}</p>
                        {entry.movement && entry.movement !== 'same' && (
                          <p className={`text-xs flex items-center justify-end ${
                            entry.movement === 'up' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {entry.movement === 'up' ? '↑' : '↓'} {entry.movement_value}
                          </p>
                        )}
                      </div>
                      <Badge className={`${tierColors[tier]?.bg || 'bg-amber-700'} capitalize`}>
                        {tier}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          {leaderboard.length >= limit && (
            <div className="text-center mt-6">
              <Button variant="outline" className="border-zinc-700" onClick={loadMore}>
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prizes Info */}
      <Card className="bg-zinc-900 border-zinc-800 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            Monthly Prizes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-semibold text-white">1st Place</p>
              <p className="text-yellow-400">5,000 Credits + VIP Badge</p>
            </div>
            <div className="text-center p-4 bg-gray-500/10 rounded-lg border border-gray-500/30">
              <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-white">2nd Place</p>
              <p className="text-gray-400">2,500 Credits + Premium Month</p>
            </div>
            <div className="text-center p-4 bg-amber-600/10 rounded-lg border border-amber-600/30">
              <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="font-semibold text-white">3rd Place</p>
              <p className="text-amber-400">1,000 Credits + Exclusive Merch</p>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">
            Contest resets on the 1st of each month. Keep referring to climb the ranks!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
