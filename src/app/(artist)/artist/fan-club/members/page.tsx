'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  Crown,
  Star,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useArtistLoyaltyClub,
  useArtistLoyaltyMembers,
} from '@/hooks/useLoyalty';

export default function FanClubMembersPage() {
  const { data: club, isLoading: loadingClub } = useArtistLoyaltyClub();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const clubId = club?.id || 0;
  const { data: membersData, isLoading: loadingMembers, error } = useArtistLoyaltyMembers(
    clubId,
    { page, search: search || undefined }
  );

  const members = membersData?.data || [];
  const pagination = membersData?.pagination;

  if (loadingClub) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="p-12 rounded-xl border bg-card text-center">
        <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-xl font-semibold mb-2">No Fan Club Yet</h2>
        <p className="text-muted-foreground">Create your fan club first to manage members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <p className="text-2xl font-bold">{club.member_count.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Active This Month</p>
          <p className="text-2xl font-bold">—</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">New This Week</p>
          <p className="text-2xl font-bold">—</p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search members by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-muted text-sm">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Members Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {loadingMembers ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
            <p className="text-muted-foreground">Failed to load members</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">
              {search ? 'No members found' : 'No members yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {search
                ? 'Try a different search term'
                : 'Share your fan club link to attract members'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Member</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tier</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Points</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {member.user.avatar ? (
                            <Image
                              src={member.user.avatar}
                              alt={member.user.name}
                              width={36}
                              height={36}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {member.user.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{member.user.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          'px-2 py-1 text-xs rounded-full font-medium',
                          member.tier === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          member.tier === 'Silver' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                          member.tier === 'Platinum' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        )}>
                          {member.tier}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span>{member.points_balance.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y">
              {members.map((member) => (
                <div key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {member.user.avatar ? (
                        <Image
                          src={member.user.avatar}
                          alt={member.user.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {member.user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(member.joined_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        member.tier === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        member.tier === 'Silver' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      )}>
                        {member.tier}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.points_balance.toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(pagination.last_page, page + 1))}
                    disabled={page >= pagination.last_page}
                    className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
