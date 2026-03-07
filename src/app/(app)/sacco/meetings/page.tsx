'use client';

import { useState } from 'react';
import { CalendarDays, MapPin, Video, Loader2, CheckCircle2, Clock, XCircle, Users } from 'lucide-react';
import { useSaccoMeetings, useRsvpMeeting, SaccoMeeting } from '@/hooks/useSacco';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig: Record<SaccoMeeting['status'], { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  ongoing:   { label: 'Ongoing',   color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
  completed: { label: 'Completed', color: 'text-muted-foreground bg-muted' },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
};

const tabs = [
  { label: 'Upcoming', value: 'scheduled' },
  { label: 'Ongoing',  value: 'ongoing' },
  { label: 'Past',     value: 'completed' },
];

export default function SaccoMeetingsPage() {
  const [tab, setTab] = useState<string>('scheduled');
  const { data: meetings = [], isLoading } = useSaccoMeetings({ status: tab });
  const rsvp = useRsvpMeeting();

  function handleRsvp(meetingId: number, attending: boolean) {
    rsvp.mutate(
      { meetingId, attending },
      {
        onSuccess: () => toast.success(attending ? 'RSVP confirmed' : 'RSVP cancelled'),
        onError: () => toast.error('Failed to update RSVP'),
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meetings</h1>
        <p className="text-muted-foreground mt-1">Upcoming and past SACCO meetings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((t) => (
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

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-card">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-lg font-medium">No meetings</p>
          <p className="text-sm text-muted-foreground mt-1">No {tab} meetings at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const cfg = statusConfig[meeting.status];
            const meetingDate = new Date(meeting.meeting_date);
            return (
              <div key={meeting.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Date block */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">
                      {meetingDate.toLocaleDateString('en-UG', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 leading-none">
                      {meetingDate.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold">{meeting.title}</h3>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium shrink-0', cfg.color)}>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {meetingDate.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {meeting.is_online ? (
                        <span className="flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" />
                          Online
                        </span>
                      ) : meeting.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {meeting.location}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {meeting.attendees_count} attending
                      </span>
                    </div>

                    {meeting.agenda && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{meeting.agenda}</p>
                    )}

                    {meeting.status === 'scheduled' && (
                      <div className="flex gap-2 mt-3">
                        {meeting.is_online && meeting.meeting_link && (
                          <a
                            href={meeting.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Join Online
                          </a>
                        )}
                        <button
                          onClick={() => handleRsvp(meeting.id, !meeting.is_attending)}
                          disabled={rsvp.isPending}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                            meeting.is_attending
                              ? 'border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          )}
                        >
                          {meeting.is_attending ? (
                            <><XCircle className="h-3.5 w-3.5" />Cancel RSVP</>
                          ) : (
                            <><CheckCircle2 className="h-3.5 w-3.5" />RSVP</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
