'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Copy,
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Edit,
  Share2,
  Loader2,
  Ticket,
  BarChart3,
  Globe,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import {
  Event,
  getEventCapacity,
  getEventImage,
  getEventLocationSummary,
  getEventStartDate,
  getEventTimeLabel,
  getEventVenueLabel,
  useEventAnalytics,
  useUpdateEvent,
} from '@/hooks/useEvents';
import { toast } from 'sonner';

interface CampaignSpendRow {
  key: string;
  label: string;
  amount: string;
  notes: string;
}

interface DiscountCodeDraft {
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: string;
  max_discount_ugx: string;
  usage_limit: string;
  min_order_amount_ugx: string;
  applies_to_ticket_ids: number[];
}

export default function ArtistEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaignName, setCampaignName] = useState('tesotunes-promote');
  const [campaignSource, setCampaignSource] = useState('tesotunes_promote');
  const [campaignMedium, setCampaignMedium] = useState('featured_banner');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'finance' | 'check_in_staff' | 'promoter' | 'analyst'>('finance');
  const [staffNotes, setStaffNotes] = useState('');
  const [checkInQuery, setCheckInQuery] = useState('');
  const [checkInNote, setCheckInNote] = useState('');
  const [selectedTicketNumber, setSelectedTicketNumber] = useState<string | null>(null);
  const [campaignSpendRows, setCampaignSpendRows] = useState<CampaignSpendRow[]>([]);
  const [discountDraft, setDiscountDraft] = useState<DiscountCodeDraft>({
    name: '',
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    max_discount_ugx: '',
    usage_limit: '',
    min_order_amount_ugx: '',
    applies_to_ticket_ids: [],
  });
  const queryClient = useQueryClient();
  const updateEvent = useUpdateEvent();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['artist', 'events', id],
    queryFn: () => apiGet<{ data: Event }>(`/artist/events/${id}`).then(r => r.data),
    enabled: !!id,
  });
  const { data: analyticsResponse } = useEventAnalytics(id);
  const refreshEvent = () => {
    queryClient.invalidateQueries({ queryKey: ['artist', 'events', id] });
  };
  const addStaffMember = useMutation({
    mutationFn: () => apiPost(`/artist/events/${id}/staff`, {
      user_email: staffEmail,
      role: staffRole,
      notes: staffNotes || undefined,
    }),
    onSuccess: () => {
      toast.success('Staff member added');
      setStaffEmail('');
      setStaffNotes('');
      refreshEvent();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add staff member');
    },
  });
  const removeStaffMember = useMutation({
    mutationFn: (staffId: number | string) => apiDelete(`/artist/events/${id}/staff/${staffId}`),
    onSuccess: () => {
      toast.success('Staff member removed');
      refreshEvent();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove staff member');
    },
  });
  const saveDiscountCode = useMutation({
    mutationFn: () => apiPost(`/artist/events/${id}/discount-codes`, {
      name: discountDraft.name || undefined,
      code: discountDraft.code,
      discount_type: discountDraft.discount_type,
      discount_value: Number(discountDraft.discount_value),
      max_discount_ugx: discountDraft.max_discount_ugx ? Number(discountDraft.max_discount_ugx) : undefined,
      usage_limit: discountDraft.usage_limit ? Number(discountDraft.usage_limit) : undefined,
      min_order_amount_ugx: discountDraft.min_order_amount_ugx ? Number(discountDraft.min_order_amount_ugx) : undefined,
      applies_to_ticket_ids: discountDraft.applies_to_ticket_ids.length > 0 ? discountDraft.applies_to_ticket_ids : undefined,
    }),
    onSuccess: () => {
      toast.success('Discount code saved');
      setDiscountDraft({
        name: '',
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        max_discount_ugx: '',
        usage_limit: '',
        min_order_amount_ugx: '',
        applies_to_ticket_ids: [],
      });
      refreshEvent();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save discount code');
    },
  });
  const removeDiscountCode = useMutation({
    mutationFn: (discountId: number) => apiDelete(`/artist/events/${id}/discount-codes/${discountId}`),
    onSuccess: () => {
      toast.success('Discount code removed');
      refreshEvent();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove discount code');
    },
  });
  const lookupTickets = useMutation({
    mutationFn: () => apiGet<{ data: { matches: Array<{
      id: number;
      ticket_number: string;
      status: string;
      holder_name: string;
      holder_email?: string;
      holder_phone?: string;
      checked_in_at?: string | null;
      duplicate_warning: boolean;
      notes?: string | null;
      door_notes?: Array<{ note?: string; created_at?: string; type?: string }>;
      ticket?: { name?: string; price_ugx?: number } | null;
    }> } }>(`/artist/events/${id}/check-in/lookup`, { params: { query: checkInQuery } }),
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Lookup failed');
    },
  });
  const checkInTicket = useMutation({
    mutationFn: (payload: { ticket_number: string; allow_duplicate?: boolean }) =>
      apiPost<{ message: string; data: { ticket_number: string; duplicate_warning: boolean } }>(`/artist/events/${id}/check-in`, {
        ticket_number: payload.ticket_number,
        notes: checkInNote || undefined,
        allow_duplicate: payload.allow_duplicate || false,
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      setCheckInNote('');
      refreshEvent();
      lookupTickets.mutate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Check-in failed';
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">Event not found</h2>
        <Link href="/artist/events" className="text-primary hover:underline">Back to Events</Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    postponed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  const ticketsSold = event.tickets_sold || event.ticket_tiers?.reduce((sum, t) => sum + (t.quantity_sold || 0), 0) || 0;
  const totalTickets = getEventCapacity(event) || event.ticket_tiers?.reduce((sum, t) => sum + (t.quantity_total || t.quantity || 0), 0) || 0;
  const sellThrough = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;
  const coverImage = getEventImage(event);
  const eventDate = getEventStartDate(event);
  const eventTime = getEventTimeLabel(event);
  const analytics = analyticsResponse?.data;
  useEffect(() => {
    const nextRows = new Map<string, CampaignSpendRow>();

    (analytics?.roi.by_source || []).forEach((source) => {
      nextRows.set(source.key, {
        key: source.key,
        label: source.label,
        amount: source.spend > 0 ? String(source.spend) : '',
        notes: source.notes || '',
      });
    });

    (event?.marketing_settings?.campaign_spend || []).forEach((entry, index) => {
      const key = entry.key || `campaign-${index + 1}`;
      if (!nextRows.has(key)) {
        nextRows.set(key, {
          key,
          label: entry.label,
          amount: entry.amount > 0 ? String(entry.amount) : '',
          notes: entry.notes || '',
        });
      }
    });

    setCampaignSpendRows(nextRows.size > 0 ? Array.from(nextRows.values()) : [
      { key: 'new-campaign-1', label: '', amount: '', notes: '' },
    ]);
  }, [analytics?.roi.by_source, event?.marketing_settings?.campaign_spend]);

  const campaignLink = useMemo(() => {
    const params = new URLSearchParams();
    params.set('source', campaignSource || 'tesotunes_promote');
    params.set('channel', campaignMedium || 'featured_banner');
    params.set('campaign_code', campaignName || `${event.slug}-promote`);
    params.set('utm_source', campaignSource || 'tesotunes_promote');
    params.set('utm_medium', campaignMedium || 'featured_banner');
    params.set('utm_campaign', campaignName || `${event.slug}-promote`);

    return `${window.location.origin}/events/${event.id}?${params.toString()}`;
  }, [campaignMedium, campaignName, campaignSource, event.id, event.slug]);

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(campaignLink);
    toast.success('Tracked campaign link copied');
  };

  const quickCampaigns = [
    { label: 'Tesotunes Boost', source: 'tesotunes_promote', medium: 'featured_banner' },
    { label: 'Instagram Story', source: 'instagram', medium: 'story' },
    { label: 'WhatsApp Blast', source: 'whatsapp', medium: 'group_share' },
    { label: 'Creator Referral', source: 'creator_referral', medium: 'affiliate' },
  ];

  const updateCampaignSpendRow = (index: number, field: keyof CampaignSpendRow, value: string) => {
    setCampaignSpendRows((current) => current.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
  };

  const addCampaignSpendRow = () => {
    setCampaignSpendRows((current) => [
      ...current,
      { key: `new-campaign-${current.length + 1}`, label: '', amount: '', notes: '' },
    ]);
  };

  const removeCampaignSpendRow = (index: number) => {
    setCampaignSpendRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const saveCampaignSpend = async () => {
    try {
      const payload = campaignSpendRows
        .map((row) => ({
          key: row.key || row.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          label: row.label.trim(),
          amount: Number(row.amount || 0),
          notes: row.notes.trim() || undefined,
          currency: 'UGX',
        }))
        .filter((row) => row.label || row.amount > 0);

      await updateEvent.mutateAsync({
        id: Number(id),
        marketing_settings: {
          campaign_spend: payload,
        },
      });

      toast.success('Campaign spend saved');
      queryClient.invalidateQueries({ queryKey: ['artist', 'events', id] });
      queryClient.invalidateQueries({ queryKey: ['artist', 'events', id, 'analytics'] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign spend');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/artist/events" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[event.status] || statusColors.draft}`}>
              {event.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleShare} className="p-2 rounded-lg border hover:bg-muted" title="Share">
            <Share2 className="h-4 w-4" />
          </button>
          <Link
            href={`/artist/events/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
        {coverImage ? (
          <Image src={coverImage} alt={event.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-primary/30" />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Tickets Sold</span>
          </div>
          <p className="text-2xl font-bold">{ticketsSold} / {totalTickets || '∞'}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-muted-foreground">Sell-Through</span>
          </div>
          <p className="text-2xl font-bold">{sellThrough}%</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Attendees</span>
          </div>
          <p className="text-2xl font-bold">{event.attendee_count || ticketsSold}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Ticket Tiers</span>
          </div>
          <p className="text-2xl font-bold">{event.ticket_tiers?.length || 0}</p>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Event Staff</h2>
            <p className="text-sm text-muted-foreground">
              Assign finance, check-in, promoter, and analyst access for this event.
            </p>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {(event.staff_members?.length || 1)} team members
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_0.8fr_1fr_auto]">
          <input
            type="email"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            placeholder="Staff account email"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <select
            value={staffRole}
            onChange={(e) => setStaffRole(e.target.value as typeof staffRole)}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          >
            <option value="finance">Finance</option>
            <option value="check_in_staff">Check-in staff</option>
            <option value="promoter">Promoter</option>
            <option value="analyst">Analyst</option>
          </select>
          <input
            type="text"
            value={staffNotes}
            onChange={(e) => setStaffNotes(e.target.value)}
            placeholder="Optional note"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <button
            onClick={() => addStaffMember.mutate()}
            disabled={!staffEmail || addStaffMember.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            Add Staff
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {(event.staff_members || []).map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-4 text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{member.user?.name || 'Unknown user'}</p>
                  <span className="rounded-full border px-2 py-0.5 text-xs">{member.role_label}</span>
                </div>
                <p className="text-muted-foreground">
                  {member.user?.email || 'No email available'}
                </p>
                {member.notes && (
                  <p className="mt-1 text-xs text-muted-foreground">{member.notes}</p>
                )}
              </div>
              {member.role !== 'organizer' && (
                <button
                  onClick={() => removeStaffMember.mutate(member.id)}
                  disabled={removeStaffMember.isPending}
                  className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Check-In Console</h2>
            <p className="text-sm text-muted-foreground">
              Search tickets fast, spot duplicate scans, and add door notes when staff override a re-scan.
            </p>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            Door ops
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr_auto]">
          <input
            type="text"
            value={checkInQuery}
            onChange={(e) => setCheckInQuery(e.target.value)}
            placeholder="Ticket number, attendee name, email, or phone"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="text"
            value={checkInNote}
            onChange={(e) => setCheckInNote(e.target.value)}
            placeholder="Door note or override reason"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <button
            onClick={() => lookupTickets.mutate()}
            disabled={checkInQuery.trim().length < 2 || lookupTickets.isPending}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            Search
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {(lookupTickets.data?.data.matches || []).map((match) => {
            const isSelected = selectedTicketNumber === match.ticket_number;
            return (
              <div key={match.id} className={`rounded-xl border p-4 text-sm ${isSelected ? 'border-primary' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{match.holder_name}</p>
                      <span className="rounded-full border px-2 py-0.5 text-xs">{match.status}</span>
                      {match.duplicate_warning && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Already checked in
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{match.ticket_number}</p>
                    <p className="text-muted-foreground">
                      {[match.holder_email, match.holder_phone, match.ticket?.name].filter(Boolean).join(' • ')}
                    </p>
                    {match.checked_in_at && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Checked in {new Date(match.checked_in_at).toLocaleString()}
                      </p>
                    )}
                    {(match.door_notes || []).length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Latest door note: {match.door_notes?.[match.door_notes.length - 1]?.note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedTicketNumber(match.ticket_number);
                        checkInTicket.mutate({ ticket_number: match.ticket_number });
                      }}
                      disabled={checkInTicket.isPending}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
                    >
                      Check In
                    </button>
                    {match.duplicate_warning && (
                      <button
                        onClick={() => {
                          setSelectedTicketNumber(match.ticket_number);
                          checkInTicket.mutate({ ticket_number: match.ticket_number, allow_duplicate: true });
                        }}
                        disabled={checkInTicket.isPending}
                        className="rounded-lg border px-3 py-2 text-xs hover:bg-muted disabled:opacity-60"
                      >
                        Override Duplicate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {lookupTickets.isSuccess && (lookupTickets.data?.data.matches || []).length === 0 && (
            <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              No ticket matches found for that search.
            </div>
          )}
        </div>
      </div>

      {analytics && (
        <div className="rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">Revenue Snapshot</h2>
              <p className="text-sm text-muted-foreground">
                Show organizers what Tesotunes ticketing is earning, costing, and paying out.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/api/backend/artist/events/${id}/analytics/export`}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </a>
              <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {analytics.fee_contract_coverage.orders_with_fee_breakdown}/{analytics.confirmed_orders} fee-tracked orders
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Gross Ticket Revenue</p>
              <p className="mt-2 text-2xl font-bold">UGX {analytics.gross_revenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Tesotunes Fee Revenue</p>
              <p className="mt-2 text-2xl font-bold">UGX {analytics.tesotunes_fee_revenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Estimated Organizer Payout</p>
              <p className="mt-2 text-2xl font-bold">UGX {analytics.estimated_organizer_payout.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Average Order Value</p>
              <p className="mt-2 text-2xl font-bold">UGX {analytics.average_order_value.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Customer paid total</p>
              <p className="mt-1 font-semibold">UGX {analytics.customer_paid_total.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Platform commission</p>
              <p className="mt-1 font-semibold">UGX {analytics.platform_commission_revenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Processing fees</p>
              <p className="mt-1 font-semibold">UGX {analytics.processing_fee_revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border bg-card p-4 text-sm">
              <p className="text-muted-foreground">Pending payout</p>
              <p className="mt-1 font-semibold">UGX {analytics.payouts.pending_balance.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-sm">
              <p className="text-muted-foreground">Ready to settle</p>
              <p className="mt-1 font-semibold">UGX {analytics.payouts.ready_balance.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-sm">
              <p className="text-muted-foreground">Paid out</p>
              <p className="mt-1 font-semibold">UGX {analytics.payouts.settled_balance.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-sm">
              <p className="text-muted-foreground">Failed payout value</p>
              <p className="mt-1 font-semibold">UGX {analytics.payouts.failed_balance.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">Promotion Attribution</h3>
                <p className="text-sm text-muted-foreground">
                  See which Tesotunes promotion links are actually converting.
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{analytics.marketing.attributed_orders} attributed orders</p>
                <p className="text-muted-foreground">UGX {analytics.marketing.attributed_revenue.toLocaleString()} revenue</p>
              </div>
            </div>

            {analytics.marketing.top_sources.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {analytics.marketing.top_sources.slice(0, 4).map((source) => (
                  <div key={source.source} className="rounded-xl bg-muted/40 p-4 text-sm">
                    <p className="font-medium">{source.source}</p>
                    <p className="mt-1 text-muted-foreground">
                      {source.orders} orders, {source.tickets_sold} tickets
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <p className="font-semibold">UGX {source.gross_revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Payout UGX {source.estimated_organizer_payout.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No tracked promotion conversions yet. Shared campaign links will start showing up here once buyers check out through them.
              </p>
            )}
          </div>

          <div className="mt-4 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">Sales Channels</h3>
                <p className="text-sm text-muted-foreground">
                  See how Tesotunes-native sales compare with tracked promo, manual/offline, and external intake.
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{analytics.sales_channels.channels[0]?.label || 'No sales yet'}</p>
                <p className="text-muted-foreground">
                  {analytics.sales_channels.channels[0]?.order_share_percent?.toFixed(1) || '0.0'}% top order share
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {analytics.sales_channels.channels.map((channel) => (
                <div key={channel.key} className="rounded-xl bg-muted/40 p-4 text-sm">
                  <p className="font-medium">{channel.label}</p>
                  <p className="mt-1 text-muted-foreground">
                    {channel.orders} orders, {channel.tickets_sold} tickets
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="font-semibold">UGX {channel.gross_revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel.order_share_percent.toFixed(1)}% of confirmed orders
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Organizer payout UGX {channel.estimated_organizer_payout.toLocaleString()} • Tesotunes fees UGX {channel.tesotunes_fee_revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">Source ROI</h3>
                <p className="text-sm text-muted-foreground">
                  Combine campaign spend with payout and revenue so you can see what actually paid off.
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">UGX {analytics.roi.total_net_profit.toLocaleString()}</p>
                <p className="text-muted-foreground">net organizer return after spend</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Tracked spend</p>
                <p className="mt-1 font-semibold">UGX {analytics.roi.total_spend.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Gross revenue</p>
                <p className="mt-1 font-semibold">UGX {analytics.roi.total_gross_revenue.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Organizer payout</p>
                <p className="mt-1 font-semibold">UGX {analytics.roi.total_organizer_payout.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Tracked sources</p>
                <p className="mt-1 font-semibold">{analytics.roi.tracked_sources}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {analytics.roi.by_source.length > 0 ? analytics.roi.by_source.map((source) => (
                <div key={source.key} className="rounded-xl bg-muted/40 p-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{source.label}</p>
                      <p className="text-muted-foreground">
                        {source.orders} orders, {source.tickets_sold} tickets
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">UGX {source.net_profit.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Net after UGX {source.spend.toLocaleString()} spend
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {source.roas !== null ? `${source.roas.toFixed(2)}x ROAS` : 'Add spend to calculate ROAS'}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">
                  No tracked campaign conversions yet. Save spend below now, and ROI will start filling in as tracked sales arrive.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium">Campaign Spend Tracker</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter manual ad or promoter spend per campaign label to power ROI reporting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCampaignSpendRow}
                  className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
                >
                  Add Campaign
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {campaignSpendRows.map((row, index) => (
                  <div key={`${row.key}-${index}`} className="grid gap-3 md:grid-cols-[1.1fr_0.8fr_1fr_auto]">
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateCampaignSpendRow(index, 'label', e.target.value)}
                      placeholder="Campaign label or source"
                      className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => updateCampaignSpendRow(index, 'amount', e.target.value)}
                      min={0}
                      placeholder="Spend in UGX"
                      className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => updateCampaignSpendRow(index, 'notes', e.target.value)}
                      placeholder="Notes"
                      className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeCampaignSpendRow(index)}
                      disabled={campaignSpendRows.length === 1}
                      className="rounded-lg border px-3 py-2 text-xs hover:bg-muted disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={saveCampaignSpend}
                  disabled={updateEvent.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  Save Spend
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">Settlement Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Track payout-ready cycles and campaign-level settlement value.
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">UGX {analytics.settlements.event_totals.organizer_net_amount.toLocaleString()}</p>
                <p className="text-muted-foreground">net event settlement value</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(analytics.settlements.by_campaign.length > 0 ? analytics.settlements.by_campaign.slice(0, 4) : []).map((campaign) => (
                <div key={campaign.label} className="rounded-xl bg-muted/40 p-4 text-sm">
                  <p className="font-medium">{campaign.label}</p>
                  <p className="mt-1 text-muted-foreground">
                    {campaign.orders} orders, {campaign.tickets_sold} tickets
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="font-semibold">UGX {campaign.organizer_net_amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Gross UGX {campaign.gross_revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {analytics.settlements.by_payout_cycle.length > 0 ? (
              <div className="mt-4 space-y-3">
                {analytics.settlements.by_payout_cycle.slice(0, 4).map((cycle, index) => (
                  <div key={`${cycle.cycle_date || 'unassigned'}-${index}`} className="flex items-center justify-between rounded-xl bg-muted/40 p-4 text-sm">
                    <div>
                      <p className="font-medium">
                        {cycle.cycle_date ? new Date(cycle.cycle_date).toLocaleDateString() : 'Unassigned cycle'}
                      </p>
                      <p className="text-muted-foreground">
                        {cycle.entry_count} ledger entries • {cycle.dominant_status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">UGX {cycle.organizer_net_amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Fees UGX {cycle.tesotunes_fee_revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Settlement cycles will appear once payouts start moving from pending to ready or paid.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Payout Center</h2>
              <p className="text-sm text-muted-foreground">
                Track whether this event is payout-ready and whether your organizer payout setup is complete.
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-medium ${event.payout_center?.setup_complete ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
              {event.payout_center?.setup_complete ? 'Payout setup ready' : 'Setup incomplete'}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Payout method</p>
              <p className="mt-1 font-semibold">{event.payout_center?.method_label || 'Not configured'}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Verification status</p>
              <p className="mt-1 font-semibold capitalize">{event.payout_center?.verification_status || 'pending'}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Ready balance</p>
              <p className="mt-1 font-semibold">UGX {(event.payout_center?.ready_balance || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Minimum payout</p>
              <p className="mt-1 font-semibold">UGX {(event.payout_center?.minimum_payout || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            {event.payout_center?.mobile_money_provider && event.payout_center?.mobile_money_number && (
              <p>Mobile money: {event.payout_center.mobile_money_provider} {event.payout_center.mobile_money_number}</p>
            )}
            {event.payout_center?.bank_name && event.payout_center?.bank_account_masked && (
              <p>Bank: {event.payout_center.bank_name} {event.payout_center.bank_account_masked}</p>
            )}
            <p>
              {event.payout_center?.money_payout_enabled
                ? 'Money payouts are enabled for this organizer account.'
                : 'Money payouts are not enabled yet for this organizer account.'}
            </p>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">Operations Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These rules shape buyer confidence, support requests, and door operations.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Registration deadline</p>
              <p className="mt-1 font-semibold">
                {event.registration_deadline
                  ? new Date(event.registration_deadline).toLocaleString()
                  : 'Not set'}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Age restriction</p>
              <p className="mt-1 font-semibold">{event.contact_info?.age_restriction || 'Not set'}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Support email</p>
              <p className="mt-1 font-semibold">{event.contact_info?.support_email || 'Not set'}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Support phone</p>
              <p className="mt-1 font-semibold">{event.contact_info?.support_phone || 'Not set'}</p>
            </div>
          </div>

          {(event.refund_policy || event.cancellation_policy || event.contact_info?.door_notes || event.contact_info?.tax_vat_notes || event.requirements?.length) && (
            <div className="mt-4 space-y-4 text-sm">
              {event.refund_policy && (
                <div>
                  <p className="font-medium">Refund policy</p>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{event.refund_policy}</p>
                </div>
              )}
              {event.cancellation_policy && (
                <div>
                  <p className="font-medium">Cancellation policy</p>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{event.cancellation_policy}</p>
                </div>
              )}
              {event.contact_info?.door_notes && (
                <div>
                  <p className="font-medium">Door notes</p>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{event.contact_info.door_notes}</p>
                </div>
              )}
              {event.contact_info?.tax_vat_notes && (
                <div>
                  <p className="font-medium">Tax / VAT notes</p>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{event.contact_info.tax_vat_notes}</p>
                </div>
              )}
              {event.requirements && event.requirements.length > 0 && (
                <div>
                  <p className="font-medium">Attendee requirements</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.requirements.map((requirement) => (
                      <span key={requirement} className="rounded-full bg-muted px-3 py-1 text-xs">
                        {requirement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Discount Codes</h2>
            <p className="text-sm text-muted-foreground">
              Give promoters and buyers controlled event offers without breaking Tesotunes fee math.
            </p>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {event.discount_codes?.length || 0} active codes
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="text"
            value={discountDraft.name}
            onChange={(e) => setDiscountDraft((current) => ({ ...current, name: e.target.value }))}
            placeholder="Promo name"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="text"
            value={discountDraft.code}
            onChange={(e) => setDiscountDraft((current) => ({ ...current, code: e.target.value.toUpperCase() }))}
            placeholder="Code"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm uppercase"
          />
          <select
            value={discountDraft.discount_type}
            onChange={(e) => setDiscountDraft((current) => ({ ...current, discount_type: e.target.value as DiscountCodeDraft['discount_type'] }))}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          >
            <option value="percentage">Percentage off</option>
            <option value="fixed_amount">Fixed UGX off</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={discountDraft.discount_value}
            onChange={(e) => setDiscountDraft((current) => ({ ...current, discount_value: e.target.value }))}
            placeholder={discountDraft.discount_type === 'percentage' ? 'Discount %' : 'Discount UGX'}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="number"
            min="0"
            step="1"
            value={discountDraft.max_discount_ugx}
            onChange={(e) => setDiscountDraft((current) => ({ ...current, max_discount_ugx: e.target.value }))}
            placeholder="Max discount UGX"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="number"
            min="0"
            step="1"
            value={discountDraft.usage_limit}
            onChange={(e) => setDiscountDraft((current) => ({ ...current, usage_limit: e.target.value }))}
            placeholder="Usage limit"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="number"
            min="0"
            step="1"
            value={discountDraft.min_order_amount_ugx}
            onChange={(e) => setDiscountDraft((current) => ({ ...current, min_order_amount_ugx: e.target.value }))}
            placeholder="Minimum order UGX"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <button
            onClick={() => saveDiscountCode.mutate()}
            disabled={!discountDraft.code || !discountDraft.discount_value || saveDiscountCode.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            Save Code
          </button>
        </div>

        {event.ticket_tiers && event.ticket_tiers.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Apply to ticket tiers</p>
            <div className="flex flex-wrap gap-2">
              {event.ticket_tiers.map((tier) => {
                const selected = discountDraft.applies_to_ticket_ids.includes(tier.id);

                return (
                  <button
                    key={tier.id}
                    onClick={() => setDiscountDraft((current) => ({
                      ...current,
                      applies_to_ticket_ids: selected
                        ? current.applies_to_ticket_ids.filter((ticketId) => ticketId !== tier.id)
                        : [...current.applies_to_ticket_ids, tier.id],
                    }))}
                    className={`rounded-full border px-3 py-1 text-xs ${selected ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                  >
                    {tier.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Leave all tiers unselected to let the code work across every Tesotunes ticket tier for this event.
            </p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {(event.discount_codes || []).length > 0 ? (event.discount_codes || []).map((discountCode) => (
            <div key={discountCode.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-4 text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{discountCode.code}</p>
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {discountCode.discount_type === 'percentage'
                      ? `${discountCode.discount_value}% off`
                      : `UGX ${discountCode.discount_value.toLocaleString()} off`}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {discountCode.name || 'Untitled code'}
                  {discountCode.min_order_amount_ugx ? ` • Min order UGX ${discountCode.min_order_amount_ugx.toLocaleString()}` : ''}
                  {discountCode.usage_limit ? ` • ${discountCode.usage_count || 0}/${discountCode.usage_limit} used` : ''}
                </p>
              </div>
              <button
                onClick={() => removeDiscountCode.mutate(discountCode.id)}
                disabled={removeDiscountCode.isPending}
                className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
              >
                Remove
              </button>
            </div>
          )) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No event discount codes yet. Add one to power influencer offers, early drops, or private promo pushes.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Promote With Tesotunes</h2>
            <p className="text-sm text-muted-foreground">
              Build tracked links for homepage boosts, partner drops, and creator referrals so conversions show up in your event revenue view.
            </p>
          </div>
          <Link
            href={`/events/${event.id}`}
            target="_blank"
            className="text-sm text-primary hover:underline"
          >
            Open public page
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickCampaigns.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setCampaignSource(preset.source);
                setCampaignMedium(preset.medium);
                setCampaignName(`${event.slug}-${preset.medium}`);
              }}
              className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Campaign Code</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Source</label>
            <input
              type="text"
              value={campaignSource}
              onChange={(e) => setCampaignSource(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Channel</label>
            <input
              type="text"
              value={campaignMedium}
              onChange={(e) => setCampaignMedium(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-muted/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tracked link</p>
          <p className="mt-2 break-all font-mono text-sm">{campaignLink}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </button>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(`${campaignName},${campaignSource},${campaignMedium},${campaignLink}`);
                toast.success('Campaign row copied for your tracker');
              }}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Copy Tracker Row
            </button>
          </div>
        </div>
      </div>

      {/* Event Details + Ticket Tiers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Event Details</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">
                  {eventDate
                    ? new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Date TBA'}
                </p>
                <p className="text-sm text-muted-foreground">{eventTime}</p>
              </div>
            </div>
            {event.is_virtual ? (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">Online Event</p>
                  {event.virtual_link && (
                    <a href={event.virtual_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      Join Link
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">{getEventVenueLabel(event) || 'Venue TBA'}</p>
                  <p className="text-sm text-muted-foreground">
                    {getEventLocationSummary(event)}
                  </p>
                </div>
              </div>
            )}
            {event.category && (
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-muted text-xs rounded-full">{event.category}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Ticket Tiers */}
      {event.ticket_tiers && event.ticket_tiers.length > 0 && (
        <div className="rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Ticket Tiers</h2>
          <div className="space-y-3">
            {event.ticket_tiers.map((tier) => {
              const tierTotal = tier.quantity_total || tier.quantity || 0;
              const tierSold = tier.quantity_sold || 0;
              const tierAvailable = tier.available ?? (tierTotal - tierSold);
              const tierProgress = tierTotal > 0 ? (tierSold / tierTotal) * 100 : 0;

              return (
                <div key={tier.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{tier.name}</p>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {tier.is_free ? (
                        <p className="font-bold text-green-500">Free</p>
                      ) : (
                        <>
                          <p className="font-bold">UGX {(tier.price_ugx || tier.price || 0).toLocaleString()}</p>
                          {(tier.price_credits ?? 0) > 0 && (
                            <p className="text-xs text-muted-foreground">{tier.price_credits?.toLocaleString()} credits</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(tierProgress, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {tierSold}/{tierTotal} sold
                    </span>
                    {tierAvailable <= 0 && (
                      <span className="text-xs text-red-500 font-medium">Sold out</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
