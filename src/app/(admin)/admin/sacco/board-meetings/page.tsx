'use client';

import { useState } from 'react';
import { Building2, Loader2, CalendarDays, Users, CheckCircle2, XCircle, Clock, MapPin, Video } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface BoardMember {
  id: number;
  name: string;
  role: string;
  appointed_at: string;
  status: 'active' | 'inactive';
  email?: string;
}

interface BoardMeeting {
  id: number;
  title: string;
  agenda?: string;
  meeting_date: string;
  location?: string;
  is_online: boolean;
  meeting_link?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  quorum_met: boolean;
  attendees_count: number;
  minutes_url?: string;
}

// ============================================================================
// Hooks
// ============================================================================

function useBoardMembers() {
  return useQuery({
    queryKey: ['admin', 'sacco', 'board-members'],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: BoardMember[] }>('/admin/sacco/board-members');
      const payload = (res as unknown as { data: { data: BoardMember[] } }).data;
      return Array.isArray(payload) ? (payload as unknown as BoardMember[]) : (payload?.data ?? []);
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useBoardMeetings(params?: { status?: string }) {
  return useQuery({
    queryKey: ['admin', 'sacco', 'board-meetings', params],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: BoardMeeting[] }>(
        '/admin/sacco/board-meetings',
        { params }
      );
      const payload = (res as unknown as { data: { data: BoardMeeting[] } }).data;
      return Array.isArray(payload) ? (payload as unknown as BoardMeeting[]) : (payload?.data ?? []);
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Status config
// ============================================================================

const meetingStatusConfig: Record<BoardMeeting['status'], { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  ongoing:   { label: 'Ongoing',   color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
  completed: { label: 'Completed', color: 'text-muted-foreground bg-muted' },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
};

const meetingTabs = [
  { label: 'Upcoming',  value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'All',       value: '' },
];

// ============================================================================
// Page
// ============================================================================

export default function AdminSaccoBoardMeetingsPage() {
  const [tab, setTab] = useState('scheduled');

  const { data: members = [], isLoading: membersLoading } = useBoardMembers();
  const { data: meetings = [], isLoading: meetingsLoading } = useBoardMeetings(tab ? { status: tab } : {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Board Meetings
        </h1>
        <p className="text-muted-foreground mt-1">Manage SACCO board members and meeting records</p>
      </div>

      {/* ── Board Members ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Board Members</h2>

        {membersLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 rounded-xl border bg-card">
            <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No board members found</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Member</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Appointed</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">{m.name}</p>
                          {m.email && <p className="text-xs text-muted-foreground">{m.email}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{m.role}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {new Date(m.appointed_at).toLocaleDateString('en-UG')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                          m.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {m.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {m.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── Board Meetings ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Meetings</h2>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {meetingTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                tab === t.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {meetingsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-10 rounded-xl border bg-card">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No {tab || ''} meetings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => {
              const cfg = meetingStatusConfig[meeting.status];
              const d = new Date(meeting.meeting_date);
              return (
                <div key={meeting.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Date block */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-semibold text-primary uppercase">
                        {d.toLocaleDateString('en-UG', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold text-primary leading-none">{d.getDate()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold">{meeting.title}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          {meeting.status === 'completed' && (
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                              meeting.quorum_met
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            )}>
                              {meeting.quorum_met ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {meeting.quorum_met ? 'Quorum Met' : 'No Quorum'}
                            </span>
                          )}
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', cfg.color)}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {d.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {meeting.is_online ? (
                          <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" />Online</span>
                        ) : meeting.location ? (
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{meeting.location}</span>
                        ) : null}
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />{meeting.attendees_count} attendees
                        </span>
                      </div>

                      {meeting.agenda && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{meeting.agenda}</p>
                      )}

                      {meeting.minutes_url && (
                        <a
                          href={meeting.minutes_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                        >
                          View Minutes →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
