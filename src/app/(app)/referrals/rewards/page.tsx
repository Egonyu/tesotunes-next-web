'use client';

import { Gift, Star, Trophy, Lock, CheckCircle, Clock, Coins, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferralRewards, useClaimReward, type ReferralMilestone } from '@/hooks/useReferrals';

const tierColors: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600',
  diamond: 'from-cyan-400 to-cyan-600',
};

const milestoneIcons: Record<number, string> = {
  1: '🌱',
  5: '👥',
  10: '🎯',
  25: '⭐',
  50: '🏆',
  100: '💎',
};

const getTierFromReferrals = (referrals: number): string => {
  if (referrals >= 100) return 'diamond';
  if (referrals >= 50) return 'platinum';
  if (referrals >= 25) return 'gold';
  if (referrals >= 10) return 'silver';
  return 'bronze';
};

export default function ReferralRewardsPage() {
  const { data, isLoading, error, refetch } = useReferralRewards();
  const claimReward = useClaimReward();

  const handleClaim = async (milestoneId: number) => {
    try {
      await claimReward.mutateAsync(milestoneId);
      refetch();
    } catch (err) {
      console.error('Error claiming reward:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Unable to load rewards</h3>
              <p className="text-gray-400">Please try again later or contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { milestones, current_referrals, total_credits_from_milestones } = data;
  
  const claimableMilestones = milestones.filter(m => m.status === 'claimable');
  const earnedMilestones = milestones.filter(m => m.status === 'earned' || m.status === 'claimed');
  const lockedMilestones = milestones.filter(m => m.status === 'locked');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Rewards</h1>
        <p className="text-gray-400">Rewards earned from your referrals</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-linear-to-br from-purple-600 to-purple-800 border-0">
          <CardContent className="p-4">
            <Gift className="w-8 h-8 text-white/80 mb-2" />
            <p className="text-3xl font-bold text-white">{total_credits_from_milestones.toLocaleString()}</p>
            <p className="text-purple-200">Milestone Credits</p>
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-green-600 to-green-800 border-0">
          <CardContent className="p-4">
            <CheckCircle className="w-8 h-8 text-white/80 mb-2" />
            <p className="text-3xl font-bold text-white">{earnedMilestones.length}</p>
            <p className="text-green-200">Earned Rewards</p>
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-yellow-600 to-orange-700 border-0">
          <CardContent className="p-4">
            <Clock className="w-8 h-8 text-white/80 mb-2" />
            <p className="text-3xl font-bold text-white">{claimableMilestones.length}</p>
            <p className="text-yellow-200">Ready to Claim</p>
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-cyan-600 to-blue-700 border-0">
          <CardContent className="p-4">
            <Trophy className="w-8 h-8 text-white/80 mb-2" />
            <p className="text-3xl font-bold text-white">{current_referrals}</p>
            <p className="text-cyan-200">Total Referrals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Rewards List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claimable Rewards */}
          {claimableMilestones.length > 0 && (
            <Card className="bg-zinc-900 border-yellow-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Gift className="w-5 h-5" />
                  Ready to Claim ({claimableMilestones.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {claimableMilestones.map((milestone: ReferralMilestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-2xl">
                        {milestoneIcons[milestone.referrals_required] || '🎁'}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{milestone.name}</p>
                        <p className="text-sm text-gray-400">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 font-semibold">
                        {milestone.reward_type === 'credits' ? `${milestone.reward_value} credits` : milestone.reward_type}
                      </span>
                      <Button 
                        onClick={() => handleClaim(milestone.id)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        disabled={claimReward.isPending}
                      >
                        {claimReward.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Claim'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* All Milestones */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                All Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone: ReferralMilestone) => {
                const progress = Math.min((current_referrals / milestone.referrals_required) * 100, 100);
                const isEarned = milestone.status === 'earned' || milestone.status === 'claimed';
                const isLocked = milestone.status === 'locked';

                return (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-lg border ${
                      isEarned
                        ? 'bg-green-500/10 border-green-500/30'
                        : isLocked
                        ? 'bg-zinc-800/50 border-zinc-700'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                          isEarned
                            ? 'bg-green-500'
                            : isLocked
                            ? 'bg-zinc-700'
                            : 'bg-yellow-500'
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="w-6 h-6 text-gray-400" />
                        ) : (
                          milestoneIcons[milestone.referrals_required] || '🎁'
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                            {milestone.name}
                          </p>
                          {isEarned && (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {milestone.status === 'claimed' ? 'Claimed' : 'Earned'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
                        <div className="flex items-center gap-2 text-sm text-purple-400">
                          <Coins className="w-4 h-4" />
                          {milestone.reward_type === 'credits' 
                            ? `${milestone.reward_value} credits` 
                            : milestone.reward_type}
                        </div>
                        
                        {!isEarned && (
                          <div className="space-y-1 mt-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">
                                {current_referrals} / {milestone.referrals_required} referrals
                              </span>
                              <span className="text-gray-400">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        
                        {isEarned && milestone.claimed_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Claimed on {new Date(milestone.claimed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Badges Sidebar */}
        <div>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Badges Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone: ReferralMilestone) => {
                const isEarned = milestone.status === 'earned' || milestone.status === 'claimed';
                const tier = getTierFromReferrals(milestone.referrals_required);
                
                return (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-lg ${
                      isEarned
                        ? `bg-linear-to-r ${tierColors[tier]} bg-opacity-20`
                        : 'bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          isEarned
                            ? `bg-linear-to-r ${tierColors[tier]}`
                            : 'bg-zinc-700'
                        }`}
                      >
                        {isEarned ? milestoneIcons[milestone.referrals_required] || '🎁' : <Lock className="w-5 h-5 text-gray-500" />}
                      </div>
                      <div>
                        <p className={`font-semibold ${isEarned ? 'text-white' : 'text-gray-500'}`}>
                          {milestone.name}
                        </p>
                        <p className="text-xs text-gray-400">{milestone.referrals_required} referrals</p>
                        {isEarned && milestone.claimed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(milestone.claimed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Progress to Next Milestone */}
          {lockedMilestones.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Next Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const nextMilestone = lockedMilestones[0];
                  const tier = getTierFromReferrals(nextMilestone.referrals_required);
                  const progress = (current_referrals / nextMilestone.referrals_required) * 100;
                  
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full bg-linear-to-r ${tierColors[tier]} flex items-center justify-center text-2xl`}>
                          {milestoneIcons[nextMilestone.referrals_required] || '🎁'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{nextMilestone.name}</p>
                          <p className="text-sm text-gray-400">Refer {nextMilestone.referrals_required} friends</p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-3 mb-2" />
                      <p className="text-sm text-gray-400 text-center">
                        {nextMilestone.referrals_required - current_referrals} more referrals needed
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
