'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, CalendarDays, CheckCircle2, Clock, Download, Loader2, MapPin, Plus, Save, Search, Users, Video, XCircle } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/sacco/shared';

interface BoardMember { id: number; name: string; role: string; appointed_at: string; status: 'active' | 'inactive'; email?: string; }
interface BoardMeeting { id: number; title: string; agenda?: string; meeting_date: string; location?: string; is_online: boolean; status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'; quorum_met: boolean; attendees_count: number; }
interface GovernanceAttendance { id: number; member_id: number; member_name: string; email?: string; checked_in_at?: string; proxy: boolean; proxy_name?: string | null; }
interface GovernanceMeeting { id: number; title: string; meeting_type?: string; description?: string; agenda?: string; meeting_date: string; location?: string; is_online: boolean; status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'; quorum_required?: number; quorum_met: boolean; attendees_count: number; minutes?: string | null; resolutions?: string[]; attendance?: GovernanceAttendance[]; }
interface SaccoMemberOption { id: number; member_number: string; username?: string; email?: string; }
interface AttendanceSummaryRow { member_id: number; member_name: string; email?: string; attendance_rate: number; meetings_attended: number; meetings_missed: number; recent_missed: number; attendance_flag: 'healthy' | 'watch' | 'follow_up'; last_attended_at?: string | null; }

const statusStyles = {
  scheduled: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
  ongoing: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
  completed: 'text-muted-foreground bg-muted',
  cancelled: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
} as const;

const boardTabs = [{ label: 'Upcoming', value: 'scheduled' }, { label: 'Completed', value: 'completed' }, { label: 'All', value: '' }];
const governanceTabs = [{ label: 'Scheduled', value: 'scheduled' }, { label: 'Ongoing', value: 'ongoing' }, { label: 'Completed', value: 'completed' }, { label: 'All', value: '' }];

function useBoardMembers() {
  return useQuery({ queryKey: ['admin', 'sacco', 'board-members'], queryFn: () => apiGet<{ success: boolean; data: BoardMember[] }>('/admin/sacco/board-members'), select: (res) => res.data ?? [] });
}

function useBoardMeetings(status: string) {
  return useQuery({
    queryKey: ['admin', 'sacco', 'board-meetings', status],
    queryFn: () => apiGet<{ success: boolean; data: BoardMeeting[] }>('/admin/sacco/board-meetings', { params: status ? { status } : undefined }),
    select: (res) => res.data ?? [],
  });
}

function useGovernanceMeetings(filters: { status: string; search: string; meetingType: string; dateFrom: string; dateTo: string; hasResolutions: boolean }) {
  return useQuery({
    queryKey: ['admin', 'sacco', 'governance-meetings', filters],
    queryFn: () => apiGet<{ success: boolean; data: GovernanceMeeting[] }>('/admin/sacco/meetings', {
      params: {
        status: filters.status || undefined,
        search: filters.search || undefined,
        meeting_type: filters.meetingType || undefined,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        has_resolutions: filters.hasResolutions || undefined,
      },
    }),
    select: (res) => res.data ?? [],
  });
}

function useGovernanceMeeting(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'sacco', 'governance-meeting', id],
    queryFn: () => apiGet<{ success: boolean; data: GovernanceMeeting }>(`/admin/sacco/meetings/${id}`),
    select: (res) => res.data,
    enabled: id !== null,
  });
}

function useMemberOptions() {
  return useQuery({
    queryKey: ['admin', 'sacco', 'member-options'],
    queryFn: () => apiGet<{ success: boolean; data: SaccoMemberOption[] }>('/admin/sacco/members', { params: { per_page: 100 } }),
    select: (res) => res.data ?? [],
  });
}

function useAttendanceSummary(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['admin', 'sacco', 'attendance-summary', dateFrom, dateTo],
    queryFn: () => apiGet<{ success: boolean; data: AttendanceSummaryRow[]; meta?: { total_meetings?: number; flagged_members?: number } }>('/admin/sacco/meetings/attendance-summary', {
      params: {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
    }),
  });
}

function StatusPill({ status }: { status: keyof typeof statusStyles }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusStyles[status])}>{status}</span>;
}

export default function AdminSaccoBoardMeetingsPage() {
  const queryClient = useQueryClient();
  const [boardTab, setBoardTab] = useState('scheduled');
  const [governanceTab, setGovernanceTab] = useState('scheduled');
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterMeetingType, setFilterMeetingType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hasResolutionsOnly, setHasResolutionsOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('general');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [quorumRequired, setQuorumRequired] = useState('0');
  const [description, setDescription] = useState('');
  const [agenda, setAgenda] = useState('');
  const [meetingStatus, setMeetingStatus] = useState<GovernanceMeeting['status']>('scheduled');
  const [minutes, setMinutes] = useState('');
  const [resolutions, setResolutions] = useState('');
  const [memberId, setMemberId] = useState('');
  const [proxyName, setProxyName] = useState('');

  const { data: boardMembers = [], isLoading: boardMembersLoading } = useBoardMembers();
  const { data: boardMeetings = [], isLoading: boardMeetingsLoading } = useBoardMeetings(boardTab);
  const { data: governanceMeetings = [], isLoading: governanceMeetingsLoading } = useGovernanceMeetings({
    status: governanceTab,
    search,
    meetingType: filterMeetingType,
    dateFrom,
    dateTo,
    hasResolutions: hasResolutionsOnly,
  });
  const { data: selectedMeeting, isLoading: selectedMeetingLoading } = useGovernanceMeeting(selectedMeetingId);
  const { data: memberOptions = [] } = useMemberOptions();
  const { data: attendanceSummaryResponse } = useAttendanceSummary(dateFrom, dateTo);
  const attendanceSummary = attendanceSummaryResponse?.data ?? [];
  const attendanceMeta = attendanceSummaryResponse?.meta;

  useEffect(() => {
    if (!selectedMeetingId && governanceMeetings.length > 0) setSelectedMeetingId(governanceMeetings[0].id);
  }, [governanceMeetings, selectedMeetingId]);

  useEffect(() => {
    if (!selectedMeeting) return;
    setMeetingStatus(selectedMeeting.status);
    setMinutes(selectedMeeting.minutes ?? '');
    setResolutions((selectedMeeting.resolutions ?? []).join('\n'));
  }, [selectedMeeting]);

  const refreshGovernance = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'sacco', 'governance-meetings'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'sacco', 'governance-meeting', selectedMeetingId] }),
    ]);
  };

  const createMeeting = useMutation({
    mutationFn: () => apiPost('/admin/sacco/meetings', {
      title, meeting_type: meetingType, scheduled_at: new Date(scheduledAt).toISOString(), location, quorum_required: Number(quorumRequired || 0), description, agenda,
    }),
    onSuccess: async () => {
      setShowCreate(false);
      setTitle(''); setMeetingType('general'); setScheduledAt(''); setLocation(''); setQuorumRequired('0'); setDescription(''); setAgenda('');
      await refreshGovernance();
    },
  });

  const updateMeeting = useMutation({
    mutationFn: () => apiPut(`/admin/sacco/meetings/${selectedMeetingId}`, {
      status: meetingStatus === 'ongoing' ? 'in_progress' : meetingStatus,
      minutes,
      resolutions: resolutions.split('\n').map((v) => v.trim()).filter(Boolean),
    }),
    onSuccess: refreshGovernance,
  });

  const addAttendance = useMutation({
    mutationFn: () => apiPost(`/admin/sacco/meetings/${selectedMeetingId}/attendance`, { member_id: Number(memberId), attending: true, proxy_name: proxyName || undefined }),
    onSuccess: async () => { setMemberId(''); setProxyName(''); await refreshGovernance(); },
  });

  const removeAttendance = useMutation({
    mutationFn: (removeId: number) => apiPost(`/admin/sacco/meetings/${selectedMeetingId}/attendance`, { member_id: removeId, attending: false }),
    onSuccess: refreshGovernance,
  });

  const boardQuorumMet = boardMeetings.filter((meeting) => meeting.quorum_met).length;
  const governanceCompleted = governanceMeetings.filter((meeting) => meeting.status === 'completed').length;
  const governanceResolutions = governanceMeetings.reduce((sum, meeting) => sum + (meeting.resolutions?.length ?? 0), 0);

  const exportGovernanceCsv = () => {
    const rows = [
      ['Title', 'Type', 'Status', 'Meeting Date', 'Location', 'Attendees', 'Quorum Met', 'Resolution Count'],
      ...governanceMeetings.map((meeting) => [
        `"${meeting.title.replaceAll('"', '""')}"`,
        meeting.meeting_type ?? '',
        meeting.status,
        meeting.meeting_date,
        `"${(meeting.location ?? '').replaceAll('"', '""')}"`,
        String(meeting.attendees_count),
        meeting.quorum_met ? 'Yes' : 'No',
        String(meeting.resolutions?.length ?? 0),
      ]),
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sacco-governance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Building2 className="h-6 w-6 text-primary" />Governance</h1>
        <p className="mt-1 text-muted-foreground">Operate board oversight and wider member meeting governance from one admin surface.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active board members" value={boardMembers.filter((member) => member.status === 'active').length} subtitle="Current board seats" icon={<Users className="h-4 w-4" />} color="blue" />
        <StatCard title="Board quorum met" value={boardQuorumMet} subtitle="Board sessions meeting quorum" icon={<CheckCircle2 className="h-4 w-4" />} color="purple" />
        <StatCard title="Member meetings" value={governanceMeetings.length} subtitle={governanceTab ? `Filtered by ${governanceTab}` : 'Across all statuses'} icon={<CalendarDays className="h-4 w-4" />} color="emerald" />
        <StatCard title="Published resolutions" value={governanceResolutions} subtitle={`${governanceCompleted} completed meetings`} icon={<Clock className="h-4 w-4" />} color="amber" />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Attendance Accountability</h2>
          <p className="text-sm text-muted-foreground">Spot repeat absences and participation risk across member governance meetings.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Meetings analysed" value={attendanceMeta?.total_meetings ?? 0} subtitle="Completed meetings in the selected window" icon={<CalendarDays className="h-4 w-4" />} color="blue" />
          <StatCard title="Follow-up needed" value={attendanceMeta?.flagged_members ?? 0} subtitle="Members who missed at least two recent meetings" icon={<XCircle className="h-4 w-4" />} color="rose" />
          <StatCard title="Healthy attendance" value={attendanceSummary.filter((row) => row.attendance_flag === 'healthy').length} subtitle="Members attending consistently" icon={<CheckCircle2 className="h-4 w-4" />} color="emerald" />
        </div>
        <div className="rounded-2xl border bg-card p-4">
          {attendanceSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">Attendance insights will appear once governance meetings are completed and attendance is tracked.</p>
          ) : (
            <div className="space-y-3">
              {attendanceSummary.slice(0, 8).map((row) => (
                <div key={row.member_id} className="flex flex-col gap-2 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{row.member_name}</p>
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                        row.attendance_flag === 'follow_up'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : row.attendance_flag === 'watch'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      )}>
                        {row.attendance_flag.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {row.meetings_attended} attended, {row.meetings_missed} missed
                      {row.last_attended_at ? `, last seen ${new Date(row.last_attended_at).toLocaleDateString('en-UG')}` : ', no attendance recorded yet'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm md:min-w-[270px]">
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="font-semibold">{row.attendance_rate}%</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <p className="text-xs text-muted-foreground">Missed</p>
                      <p className="font-semibold">{row.meetings_missed}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <p className="text-xs text-muted-foreground">Recent</p>
                      <p className="font-semibold">{row.recent_missed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Board Members</h2>
        {boardMembersLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full">
              <thead><tr className="border-b bg-muted/50"><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Member</th><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th><th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">Appointed</th><th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th></tr></thead>
              <tbody className="divide-y">
                {boardMembers.map((member) => <tr key={member.id} className="hover:bg-muted/30"><td className="px-4 py-3"><div><p className="text-sm font-medium">{member.name}</p>{member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}</div></td><td className="px-4 py-3 text-sm">{member.role}</td><td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">{new Date(member.appointed_at).toLocaleDateString('en-UG')}</td><td className="px-4 py-3"><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', member.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>{member.status === 'active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{member.status}</span></td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold">Board Meetings</h2><div className="flex gap-1 rounded-lg bg-muted p-1">{boardTabs.map((tab) => <button key={tab.value} onClick={() => setBoardTab(tab.value)} className={cn('rounded-md px-4 py-1.5 text-sm font-medium', boardTab === tab.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground')}>{tab.label}</button>)}</div></div>
        {boardMeetingsLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
          <div className="space-y-3">
            {boardMeetings.map((meeting) => {
              const d = new Date(meeting.meeting_date);
              return <div key={meeting.id} className="rounded-xl border bg-card p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10"><span className="text-[10px] font-semibold uppercase text-primary">{d.toLocaleDateString('en-UG', { month: 'short' })}</span><span className="text-xl font-bold leading-none text-primary">{d.getDate()}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-semibold">{meeting.title}</h3><div className="flex flex-wrap items-center gap-2">{meeting.status === 'completed' && <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', meeting.quorum_met ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{meeting.quorum_met ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{meeting.quorum_met ? 'Quorum Met' : 'No Quorum'}</span>}<StatusPill status={meeting.status} /></div></div><div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{d.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}</span>{meeting.is_online ? <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" />Online</span> : meeting.location ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{meeting.location}</span> : null}<span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{meeting.attendees_count} attendees</span></div>{meeting.agenda && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{meeting.agenda}</p>}</div></div></div>;
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Member Governance Meetings</h2>
            <p className="text-sm text-muted-foreground">Schedule member sessions, record attendance, and publish the minutes and resolutions that matter.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {governanceTabs.map((tab) => <button key={tab.value} onClick={() => setGovernanceTab(tab.value)} className={cn('rounded-md px-4 py-1.5 text-sm font-medium', governanceTab === tab.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground')}>{tab.label}</button>)}
            </div>
            <button onClick={exportGovernanceCsv} disabled={governanceMeetings.length === 0} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"><Download className="h-4 w-4" />Export CSV</button>
            <button onClick={() => setShowCreate((current) => !current)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />{showCreate ? 'Close Form' : 'New Meeting'}</button>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border bg-card p-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border bg-background py-2 pl-9 pr-3" placeholder="Search title, agenda, minutes..." />
          </label>
          <select value={filterMeetingType} onChange={(event) => setFilterMeetingType(event.target.value)} className="rounded-lg border bg-background px-3 py-2">
            <option value="">All meeting types</option>
            <option value="general">General</option>
            <option value="committee">Committee</option>
            <option value="agm">AGM</option>
            <option value="special">Special</option>
          </select>
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="rounded-lg border bg-background px-3 py-2" />
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded-lg border bg-background px-3 py-2" />
          <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
            <input type="checkbox" checked={hasResolutionsOnly} onChange={(event) => setHasResolutionsOnly(event.target.checked)} />
            Resolutions only
          </label>
        </div>

        {showCreate && (
          <div className="rounded-2xl border bg-card p-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-1"><span className="text-sm font-medium">Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2" placeholder="Annual general meeting" /></label>
              <label className="space-y-1"><span className="text-sm font-medium">Meeting Type</span><select value={meetingType} onChange={(event) => setMeetingType(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2"><option value="general">General</option><option value="committee">Committee</option><option value="agm">AGM</option><option value="special">Special</option></select></label>
              <label className="space-y-1"><span className="text-sm font-medium">Scheduled At</span><input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2" /></label>
              <label className="space-y-1"><span className="text-sm font-medium">Location</span><input value={location} onChange={(event) => setLocation(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2" placeholder="Leave blank for online" /></label>
              <label className="space-y-1"><span className="text-sm font-medium">Quorum Required</span><input type="number" min="0" value={quorumRequired} onChange={(event) => setQuorumRequired(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2" /></label>
            </div>
            <div className="mt-4 grid gap-4">
              <label className="space-y-1"><span className="text-sm font-medium">Description</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2" /></label>
              <label className="space-y-1"><span className="text-sm font-medium">Agenda</span><textarea rows={4} value={agenda} onChange={(event) => setAgenda(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2" /></label>
            </div>
            <div className="mt-4 flex justify-end"><button onClick={() => createMeeting.mutate()} disabled={!title || !scheduledAt || createMeeting.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{createMeeting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Create Meeting</button></div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            {governanceMeetingsLoading ? <div className="flex justify-center rounded-xl border bg-card py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : governanceMeetings.length === 0 ? <div className="rounded-xl border bg-card py-10 text-center"><CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-40" /><p className="text-muted-foreground">No governance meetings found</p></div> : governanceMeetings.map((meeting) => {
              const d = new Date(meeting.meeting_date);
              const selected = meeting.id === selectedMeetingId;
              return <button key={meeting.id} onClick={() => setSelectedMeetingId(meeting.id)} className={cn('w-full rounded-2xl border bg-card p-5 text-left transition-colors', selected ? 'border-primary shadow-sm' : 'hover:border-primary/40')}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{meeting.title}</h3><StatusPill status={meeting.status} /></div><p className="mt-1 text-sm text-muted-foreground">{meeting.meeting_type?.replace('_', ' ') || 'general'} meeting</p></div><span className="text-sm text-muted-foreground">{d.toLocaleDateString('en-UG')}</span></div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{meeting.attendees_count} attendees</span>{meeting.is_online ? <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" />Online</span> : meeting.location ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{meeting.location}</span> : null}<span className={meeting.quorum_met ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{meeting.quorum_met ? 'Quorum met' : 'Quorum pending'}</span></div>{meeting.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{meeting.description}</p>}</button>;
            })}
          </div>

          <div className="rounded-2xl border bg-card p-5">
            {selectedMeetingLoading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : !selectedMeeting ? <div className="py-10 text-center text-muted-foreground">Select a governance meeting to manage attendance, resolutions, and minutes.</div> : (
              <div className="space-y-5">
                <div><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">{selectedMeeting.title}</h3><StatusPill status={selectedMeeting.status} /></div><p className="mt-1 text-sm text-muted-foreground">{selectedMeeting.meeting_type?.replace('_', ' ') || 'general'} meeting on {new Date(selectedMeeting.meeting_date).toLocaleString('en-UG', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1"><span className="text-sm font-medium">Status</span><select value={meetingStatus} onChange={(event) => setMeetingStatus(event.target.value as GovernanceMeeting['status'])} className="w-full rounded-lg border bg-background px-3 py-2"><option value="scheduled">Scheduled</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
                  <div className="rounded-lg bg-muted/50 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attendance</p><p className="mt-1 text-sm font-medium">{selectedMeeting.attendees_count} checked in</p><p className={cn('text-xs', selectedMeeting.quorum_met ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>{selectedMeeting.quorum_met ? 'Quorum met' : `Quorum requires ${selectedMeeting.quorum_required ?? 0}`}</p></div>
                </div>
                <label className="space-y-1"><span className="text-sm font-medium">Minutes</span><textarea rows={5} value={minutes} onChange={(event) => setMinutes(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2" /></label>
                <label className="space-y-1"><span className="text-sm font-medium">Resolutions</span><textarea rows={5} value={resolutions} onChange={(event) => setResolutions(event.target.value)} className="w-full rounded-lg border bg-background px-3 py-2" placeholder="One resolution per line" /></label>
                <div className="flex justify-end"><button onClick={() => updateMeeting.mutate()} disabled={updateMeeting.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{updateMeeting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save Governance Record</button></div>
                <div className="space-y-3 rounded-xl border p-4">
                  <div><h4 className="font-medium">Attendance Operations</h4><p className="text-sm text-muted-foreground">Mark members present and track proxy participation.</p></div>
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><select value={memberId} onChange={(event) => setMemberId(event.target.value)} className="rounded-lg border bg-background px-3 py-2"><option value="">Select member</option>{memberOptions.map((member) => <option key={member.id} value={member.id}>{member.username || member.member_number}{member.email ? ` • ${member.email}` : ''}</option>)}</select><input value={proxyName} onChange={(event) => setProxyName(event.target.value)} className="rounded-lg border bg-background px-3 py-2" placeholder="Proxy name (optional)" /><button onClick={() => addAttendance.mutate()} disabled={!memberId || addAttendance.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Add</button></div>
                  <div className="space-y-2">{(selectedMeeting.attendance ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No attendance records yet.</p> : selectedMeeting.attendance?.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"><div><p className="text-sm font-medium">{entry.member_name}</p><p className="text-xs text-muted-foreground">{entry.proxy ? `Proxy: ${entry.proxy_name || 'Recorded'}` : entry.checked_in_at ? `Checked in ${new Date(entry.checked_in_at).toLocaleString('en-UG')}` : 'Attendance recorded'}</p></div><button onClick={() => removeAttendance.mutate(entry.member_id)} disabled={removeAttendance.isPending} className="rounded-lg border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/10">Remove</button></div>)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
