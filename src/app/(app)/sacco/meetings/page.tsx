'use client'

import { useMemo, useState } from 'react'
import { BellRing, CalendarDays, CheckCircle2, Clock3, Loader2, MapPin, Users, Video } from 'lucide-react'
import { useMarkAllSaccoNotificationsRead, useMarkSaccoNotificationRead, useRsvpMeeting, useSaccoMeetings, useSaccoNotifications } from '@/hooks/useSacco'
import { StatCard } from '@/components/sacco/shared'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Upcoming', value: 'scheduled' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'All', value: '' },
] as const

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  ongoing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function SaccoMeetingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]['value']>('scheduled')
  const { data: meetings = [], isLoading } = useSaccoMeetings(tab ? { status: tab } : {})
  const { data: notificationsData } = useSaccoNotifications(6)
  const markNotificationRead = useMarkSaccoNotificationRead()
  const markAllNotificationsRead = useMarkAllSaccoNotificationsRead()
  const rsvpMutation = useRsvpMeeting()
  const notifications = notificationsData?.notifications ?? []
  const unreadCount = notificationsData?.unreadCount ?? 0

  const stats = useMemo(() => {
    const scheduled = meetings.filter((meeting) => meeting.status === 'scheduled').length
    const attending = meetings.filter((meeting) => meeting.is_attending).length
    const withResolutions = meetings.filter((meeting) => (meeting.resolutions?.length ?? 0) > 0).length
    const quorumReady = meetings.filter((meeting) => meeting.quorum_met).length

    return { scheduled, attending, withResolutions, quorumReady }
  }, [meetings])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Meetings</h1>
        <p className="mt-1 text-muted-foreground">
          Follow SACCO governance sessions, RSVP early, and review the resolutions that shape member decisions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Upcoming meetings" value={stats.scheduled} subtitle="Scheduled governance sessions" icon={<CalendarDays className="h-4 w-4" />} color="blue" />
        <StatCard title="Your RSVPs" value={stats.attending} subtitle="Meetings you plan to attend" icon={<CheckCircle2 className="h-4 w-4" />} color="emerald" />
        <StatCard title="Published resolutions" value={stats.withResolutions} subtitle="Meetings with recorded decisions" icon={<Users className="h-4 w-4" />} color="purple" />
        <StatCard title="Quorum met" value={stats.quorumReady} subtitle="Meetings that already meet quorum" icon={<Clock3 className="h-4 w-4" />} color="amber" />
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Governance Updates</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{unreadCount} unread governance notifications</p>
          </div>
          <button
            onClick={() => markAllNotificationsRead.mutate()}
            disabled={unreadCount === 0 || markAllNotificationsRead.isPending}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Governance notifications will appear here when meetings are scheduled or resolutions are published.</p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => {
                  if (!notification.read_at) {
                    markNotificationRead.mutate(notification.id)
                  }
                }}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-colors',
                  notification.read_at ? 'bg-background' : 'border-primary/30 bg-primary/5'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                  {!notification.read_at && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">New</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              tab === item.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-50" />
          <p className="font-medium">No meetings found</p>
          <p className="mt-1 text-sm text-muted-foreground">This view will update as governance sessions are scheduled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const meetingDate = new Date(meeting.meeting_date)
            const isBusy = rsvpMutation.isPending

            return (
              <div key={meeting.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10">
                    <span className="text-[10px] font-semibold uppercase text-primary">
                      {meetingDate.toLocaleDateString('en-UG', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-bold text-primary leading-none">{meetingDate.getDate()}</span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold">{meeting.title}</h2>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusStyles[meeting.status])}>
                            {meeting.status}
                          </span>
                          {meeting.meeting_type && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                              {meeting.meeting_type.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        {meeting.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{meeting.description}</p>
                        )}
                      </div>

                      <button
                        onClick={() => rsvpMutation.mutate({ meetingId: meeting.id, attending: !meeting.is_attending })}
                        disabled={isBusy}
                        className={cn(
                          'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                          meeting.is_attending
                            ? 'border border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20'
                            : 'bg-primary text-primary-foreground hover:opacity-90'
                        )}
                      >
                        {meeting.is_attending ? 'Cancel RSVP' : 'RSVP'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {meetingDate.toLocaleString('en-UG', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {meeting.is_online ? (
                        <span className="inline-flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" />
                          Online session
                        </span>
                      ) : meeting.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {meeting.location}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {meeting.attendees_count} attending
                      </span>
                      {typeof meeting.quorum_required === 'number' && meeting.quorum_required > 0 && (
                        <span className={cn(meeting.quorum_met ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                          Quorum {meeting.quorum_met ? 'met' : `needs ${meeting.quorum_required}`}
                        </span>
                      )}
                    </div>

                    {meeting.agenda && (
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agenda</p>
                        <p className="mt-1 text-sm">{meeting.agenda}</p>
                      </div>
                    )}

                    {(meeting.resolutions?.length ?? 0) > 0 && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Resolutions</p>
                        <div className="mt-2 space-y-2">
                          {meeting.resolutions?.map((resolution, index) => (
                            <p key={`${meeting.id}-resolution-${index}`} className="text-sm text-emerald-900 dark:text-emerald-100">
                              {index + 1}. {resolution}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {meeting.minutes && (
                      <div className="rounded-xl border p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Minutes</p>
                        <p className="mt-2 text-sm text-muted-foreground">{meeting.minutes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
