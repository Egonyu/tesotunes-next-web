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
  useEventExternalAllocations,
  useEventOfflineSales,
  useStoreOfflineSale,
  useStorePrintedTicketImport,
  useSyncPrintedTicketImport,
  useStoreExternalAllocation,
  useEventTicketCases,
  useReleaseExternalAllocation,
  useResolveEventTicketCase,
  useUpdateEvent,
  useVoidOfflineSale,
} from '@/hooks/useEvents';
import { toast } from 'sonner';

interface CampaignSpendRow {
  key: string;
  label: string;
  amount: string;
  notes: string;
}

interface CampaignPresetRow {
  key: string;
  name: string;
  source: string;
  medium: string;
  campaign_code: string;
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
  const [campaignNotes, setCampaignNotes] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'finance' | 'check_in_staff' | 'promoter' | 'analyst'>('finance');
  const [staffNotes, setStaffNotes] = useState('');
  const [checkInQuery, setCheckInQuery] = useState('');
  const [checkInNote, setCheckInNote] = useState('');
  const [selectedTicketNumber, setSelectedTicketNumber] = useState<string | null>(null);
  const [supportResolutionNote, setSupportResolutionNote] = useState('');
  const [offlineHolderName, setOfflineHolderName] = useState('');
  const [offlineHolderEmail, setOfflineHolderEmail] = useState('');
  const [offlineHolderPhone, setOfflineHolderPhone] = useState('');
  const [offlineQuantity, setOfflineQuantity] = useState('1');
  const [offlineUnitPrice, setOfflineUnitPrice] = useState('');
  const [offlineSource, setOfflineSource] = useState<'printed_ticket' | 'door_sale' | 'phone_booking' | 'complimentary'>('printed_ticket');
  const [offlineNotes, setOfflineNotes] = useState('');
  const [offlineTierId, setOfflineTierId] = useState<number | null>(null);
  const [offlineVoidReason, setOfflineVoidReason] = useState('');
  const [printedCodes, setPrintedCodes] = useState('');
  const [printedValidationNotes, setPrintedValidationNotes] = useState('');
  const [selectedPrintedOrderId, setSelectedPrintedOrderId] = useState<string | null>(null);
  const [syncPrintedHolderName, setSyncPrintedHolderName] = useState('');
  const [syncPrintedHolderEmail, setSyncPrintedHolderEmail] = useState('');
  const [syncPrintedHolderPhone, setSyncPrintedHolderPhone] = useState('');
  const [syncPrintedNotes, setSyncPrintedNotes] = useState('');
  const [syncPrintedValidationNotes, setSyncPrintedValidationNotes] = useState('');
  const [externalTierId, setExternalTierId] = useState<number | null>(null);
  const [externalQuantity, setExternalQuantity] = useState('1');
  const [externalChannelLabel, setExternalChannelLabel] = useState('External outlet');
  const [externalNotes, setExternalNotes] = useState('');
  const [externalReleaseReason, setExternalReleaseReason] = useState('');
  const [campaignSpendRows, setCampaignSpendRows] = useState<CampaignSpendRow[]>([]);
  const [campaignPresetRows, setCampaignPresetRows] = useState<CampaignPresetRow[]>([]);
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
  const { data: offlineSales = [] } = useEventOfflineSales(id);
  const { data: externalAllocations = [] } = useEventExternalAllocations(id);
  const storeOfflineSale = useStoreOfflineSale(id);
  const storePrintedTicketImport = useStorePrintedTicketImport(id);
  const syncPrintedTicketImport = useSyncPrintedTicketImport(id);
  const storeExternalAllocation = useStoreExternalAllocation(id);
  const { data: ticketCases = [] } = useEventTicketCases(id);
  const resolveTicketCase = useResolveEventTicketCase(id);
  const voidOfflineSale = useVoidOfflineSale(id);
  const releaseExternalAllocation = useReleaseExternalAllocation(id);
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
  const isHybrid = event.ticketing_mode === 'hybrid';
  const isExternalOnly = event.ticketing_mode === 'external_only';
  const ticketingSummary = event.ticketing_summary;
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

  useEffect(() => {
    const presets = event?.marketing_settings?.campaign_presets || [];

    if (presets.length === 0) {
      setCampaignPresetRows([
        {
          key: 'tesotunes-boost',
          name: 'Tesotunes Boost',
          source: 'tesotunes_promote',
          medium: 'featured_banner',
          campaign_code: event?.slug ? `${event.slug}-featured-banner` : 'tesotunes-promote',
          notes: '',
        },
      ]);
      return;
    }

    setCampaignPresetRows(presets.map((preset, index) => ({
      key: preset.key || `campaign-preset-${index + 1}`,
      name: preset.name,
      source: preset.source,
      medium: preset.medium,
      campaign_code: preset.campaign_code,
      notes: preset.notes || '',
    })));
  }, [event?.marketing_settings?.campaign_presets, event?.slug]);

  useEffect(() => {
    if (!offlineTierId && event?.ticket_tiers?.length) {
      setOfflineTierId(event.ticket_tiers[0].id);
      const firstPrice = event.ticket_tiers[0].price_ugx || event.ticket_tiers[0].price || 0;
      setOfflineUnitPrice(firstPrice > 0 ? String(firstPrice) : '');
    }
  }, [event?.ticket_tiers, offlineTierId]);

  useEffect(() => {
    if (!externalTierId && event?.ticket_tiers?.length) {
      setExternalTierId(event.ticket_tiers[0].id);
    }
  }, [event?.ticket_tiers, externalTierId]);

  const campaignLink = useMemo(
    () => buildCampaignLink(),
    [campaignMedium, campaignName, campaignSource, event]
  );

  const promotionMarketplaceLink = useMemo(() => {
    if (!event) {
      return "/promotions";
    }

    const params = new URLSearchParams();
    params.set("target_type", "event");
    params.set("event_id", String(event.id));
    params.set("event_name", event.title);
    params.set("event_slug", event.slug);

    if (event.starts_at) {
      params.set("event_starts_at", event.starts_at);
    }

    if (event.venue_name) {
      params.set("event_venue", event.venue_name);
    }

    if (event.city) {
      params.set("event_city", event.city);
    }

    return `/promotions?${params.toString()}`;
  }, [event]);

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

  function buildCampaignLink(options?: {
    source?: string;
    medium?: string;
    campaignCode?: string;
  }) {
    if (!event) {
      return '';
    }

    const params = new URLSearchParams();
    const source = options?.source || campaignSource || 'tesotunes_promote';
    const medium = options?.medium || campaignMedium || 'featured_banner';
    const campaignCode = options?.campaignCode || campaignName || `${event.slug}-promote`;

    params.set('source', source);
    params.set('channel', medium);
    params.set('campaign_code', campaignCode);
    params.set('utm_source', source);
    params.set('utm_medium', medium);
    params.set('utm_campaign', campaignCode);

    return `${window.location.origin}/events/${event.id}?${params.toString()}`;
  }

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
          campaign_presets: event?.marketing_settings?.campaign_presets || [],
        },
      });

      toast.success('Campaign spend saved');
      queryClient.invalidateQueries({ queryKey: ['artist', 'events', id] });
      queryClient.invalidateQueries({ queryKey: ['artist', 'events', id, 'analytics'] });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign spend');
    }
  };

  const updateCampaignPresetRow = (index: number, field: keyof CampaignPresetRow, value: string) => {
    setCampaignPresetRows((current) => current.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
  };

  const addCampaignPresetRow = () => {
    setCampaignPresetRows((current) => [
      ...current,
      {
        key: `campaign-preset-${current.length + 1}`,
        name: '',
        source: 'tesotunes_promote',
        medium: 'featured_banner',
        campaign_code: event ? `${event.slug}-campaign-${current.length + 1}` : `campaign-${current.length + 1}`,
        notes: '',
      },
    ]);
  };

  const removeCampaignPresetRow = (index: number) => {
    setCampaignPresetRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const applyCampaignPreset = (preset: CampaignPresetRow) => {
    setCampaignName(preset.campaign_code);
    setCampaignSource(preset.source);
    setCampaignMedium(preset.medium);
    setCampaignNotes(preset.notes);
    toast.success(`Loaded ${preset.name}`);
  };

  const saveCampaignPresets = async () => {
    if (!event) {
      return;
    }

    const payload = campaignPresetRows
      .map((row, index) => ({
        key: row.key || `campaign-preset-${index + 1}`,
        name: row.name.trim(),
        source: row.source.trim(),
        medium: row.medium.trim(),
        channel: row.medium.trim(),
        campaign_code: row.campaign_code.trim(),
        notes: row.notes.trim() || null,
      }))
      .filter((row) => row.name || row.source || row.medium || row.campaign_code);

    if (payload.length === 0) {
      toast.error('Add at least one preset before saving');
      return;
    }

    try {
      await updateEvent.mutateAsync({
        id: event.id,
        marketing_settings: {
          campaign_spend: event.marketing_settings?.campaign_spend || [],
          campaign_presets: payload,
        },
      });
      toast.success('Campaign presets saved');
      refreshEvent();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign presets');
    }
  };

  const copyPresetLink = async (preset: CampaignPresetRow) => {
    await navigator.clipboard.writeText(buildCampaignLink({
      source: preset.source,
      medium: preset.medium,
      campaignCode: preset.campaign_code,
    }));
    toast.success(`${preset.name} link copied`);
  };

  const copyPresetTrackerRow = async (preset: CampaignPresetRow) => {
    const link = buildCampaignLink({
      source: preset.source,
      medium: preset.medium,
      campaignCode: preset.campaign_code,
    });
    await navigator.clipboard.writeText(`${preset.name},${preset.source},${preset.medium},${preset.campaign_code},${link}`);
    toast.success(`${preset.name} tracker row copied`);
  };

  const loadPrintedBatchForSync = (sale: typeof offlineSales[number]) => {
    setSelectedPrintedOrderId(sale.order_id);
    setSyncPrintedHolderName(sale.holder_name || '');
    setSyncPrintedHolderEmail(sale.holder_email || '');
    setSyncPrintedHolderPhone(sale.holder_phone || '');
    setSyncPrintedNotes(sale.notes || '');
    setSyncPrintedValidationNotes(sale.validation_notes || '');
    toast.success('Printed batch loaded for sync');
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

      {(isHybrid || isExternalOnly) && ticketingSummary && (
        <div className={`rounded-xl border p-6 ${isHybrid ? 'border-sky-200 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/20' : 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {ticketingSummary.mode_label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isHybrid
                  ? 'Tesotunes checkout is active while the same event can also reconcile external and manual inventory. Use the ops panels below to keep online, outlet, and printed ticket counts aligned.'
                  : 'Tesotunes is promoting this event while organizer-managed or partner channels handle ticketing. Use the ops panels below to keep external and manual movement visible in one place.'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background/80 p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tesotunes available</p>
                <p className="mt-1 font-semibold">
                  {ticketingSummary.tesotunes_available == null ? 'Open' : ticketingSummary.tesotunes_available.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border bg-background/80 p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">External reserved</p>
                <p className="mt-1 font-semibold">{ticketingSummary.external_allocated.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border bg-background/80 p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tesotunes sold</p>
                <p className="mt-1 font-semibold">{ticketingSummary.tesotunes_sold.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <h2 className="font-semibold">Offline Sales Reconciliation</h2>
            <p className="text-sm text-muted-foreground">
              Log printed, door, and phone-booked tickets as real attendees so remaining capacity, sell-through, and check-in stay accurate for non-smartphone buyers too.
            </p>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {isHybrid ? 'Hybrid ops' : `${offlineSales.length} logged batch${offlineSales.length === 1 ? '' : 'es'}`}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={offlineTierId ?? ''}
            onChange={(e) => {
              const nextTierId = Number(e.target.value);
              setOfflineTierId(nextTierId);
              const selectedTier = event.ticket_tiers?.find((tier) => tier.id === nextTierId);
              if (selectedTier) {
                const price = selectedTier.price_ugx || selectedTier.price || 0;
                setOfflineUnitPrice(price > 0 ? String(price) : '');
              }
            }}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          >
            <option value="" disabled>Select ticket tier</option>
            {(event.ticket_tiers || []).map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="100"
            value={offlineQuantity}
            onChange={(e) => setOfflineQuantity(e.target.value)}
            placeholder="Quantity"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="number"
            min="0"
            step="1"
            value={offlineUnitPrice}
            onChange={(e) => setOfflineUnitPrice(e.target.value)}
            placeholder="Unit price UGX"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <select
            value={offlineSource}
            onChange={(e) => setOfflineSource(e.target.value as 'printed_ticket' | 'door_sale' | 'phone_booking' | 'complimentary')}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          >
            <option value="printed_ticket">Printed ticket</option>
            <option value="door_sale">Door sale</option>
            <option value="phone_booking">Phone booking</option>
            <option value="complimentary">Complimentary</option>
          </select>
          <input
            type="text"
            value={offlineHolderName}
            onChange={(e) => setOfflineHolderName(e.target.value)}
            placeholder="Buyer or batch holder name"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="email"
            value={offlineHolderEmail}
            onChange={(e) => setOfflineHolderEmail(e.target.value)}
            placeholder="Buyer email"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="tel"
            value={offlineHolderPhone}
            onChange={(e) => setOfflineHolderPhone(e.target.value)}
            placeholder="Buyer phone"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="text"
            value={offlineNotes}
            onChange={(e) => setOfflineNotes(e.target.value)}
            placeholder="Notes"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Logged offline tickets are counted as confirmed attendees and can be found later in door lookup by ticket code or holder name.
          </p>
          <button
            onClick={async () => {
              if (!offlineTierId) {
                toast.error('Choose a ticket tier first');
                return;
              }

              try {
                const result = await storeOfflineSale.mutateAsync({
                  ticket_tier_id: offlineTierId,
                  quantity: Number(offlineQuantity || 1),
                  holder_name: offlineHolderName || undefined,
                  holder_email: offlineHolderEmail || undefined,
                  holder_phone: offlineHolderPhone || undefined,
                  unit_price_ugx: offlineUnitPrice ? Number(offlineUnitPrice) : undefined,
                  sale_source: offlineSource,
                  notes: offlineNotes || undefined,
                });
                toast.success(result.message || 'Offline sale logged');
                setOfflineHolderName('');
                setOfflineHolderEmail('');
                setOfflineHolderPhone('');
                setOfflineQuantity('1');
                setOfflineNotes('');
                setOfflineVoidReason('');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to log offline sale');
              }
            }}
            disabled={storeOfflineSale.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {storeOfflineSale.isPending ? 'Logging...' : 'Log Offline Sale'}
          </button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={offlineVoidReason}
            onChange={(e) => setOfflineVoidReason(e.target.value)}
            placeholder="Optional void reason for duplicate or cancelled booklet entries"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
        </div>

        <div className="mt-4 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium">Printed Ticket Import</h3>
              <p className="text-sm text-muted-foreground">
                Paste pre-printed physical ticket codes from a booklet or outlet run so they validate and check in as real Tesotunes event attendees.
              </p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Booklet sync
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <textarea
              value={printedCodes}
              onChange={(e) => setPrintedCodes(e.target.value)}
              placeholder={"BOOK-001\nBOOK-002\nBOOK-003"}
              rows={5}
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
            />
            <div className="space-y-4">
              <input
                type="text"
                value={printedValidationNotes}
                onChange={(e) => setPrintedValidationNotes(e.target.value)}
                placeholder="Validation notes, for example Orange wristband booklet"
                className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Imported printed codes use the same ticket tier, buyer details, and pricing you set above, but they keep their physical booklet codes instead of random offline codes.
              </p>
              <button
                onClick={async () => {
                  if (!offlineTierId) {
                    toast.error('Choose a ticket tier first');
                    return;
                  }

                  if (!printedCodes.trim()) {
                    toast.error('Paste at least one printed ticket code');
                    return;
                  }

                  try {
                    const result = await storePrintedTicketImport.mutateAsync({
                      ticket_tier_id: offlineTierId,
                      codes: printedCodes,
                      holder_name: offlineHolderName || undefined,
                      holder_email: offlineHolderEmail || undefined,
                      holder_phone: offlineHolderPhone || undefined,
                      unit_price_ugx: offlineUnitPrice ? Number(offlineUnitPrice) : undefined,
                      notes: offlineNotes || undefined,
                      validation_notes: printedValidationNotes || undefined,
                    });
                    toast.success(result.message || 'Printed ticket import completed');
                    setPrintedCodes('');
                    setPrintedValidationNotes('');
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Failed to import printed ticket codes');
                  }
                }}
                disabled={storePrintedTicketImport.isPending}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
              >
                {storePrintedTicketImport.isPending ? 'Importing...' : 'Import Printed Codes'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium">Printed Batch Sync</h3>
              <p className="text-sm text-muted-foreground">
                Load an imported printed batch below to correct holder details or update booklet validation instructions without re-importing the ticket codes.
              </p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {selectedPrintedOrderId ? 'Batch selected' : 'Pick a batch'}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <input
              type="text"
              value={syncPrintedHolderName}
              onChange={(e) => setSyncPrintedHolderName(e.target.value)}
              placeholder="Batch holder name"
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
            />
            <input
              type="email"
              value={syncPrintedHolderEmail}
              onChange={(e) => setSyncPrintedHolderEmail(e.target.value)}
              placeholder="Batch holder email"
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
            />
            <input
              type="tel"
              value={syncPrintedHolderPhone}
              onChange={(e) => setSyncPrintedHolderPhone(e.target.value)}
              placeholder="Batch holder phone"
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
            />
            <input
              type="text"
              value={syncPrintedValidationNotes}
              onChange={(e) => setSyncPrintedValidationNotes(e.target.value)}
              placeholder="Validation notes"
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
            />
            <input
              type="text"
              value={syncPrintedNotes}
              onChange={(e) => setSyncPrintedNotes(e.target.value)}
              placeholder="Batch notes"
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              This sync keeps the original printed ticket codes intact. It only updates the booklet batch details Tesotunes shows during door lookup and validation.
            </p>
            <button
              onClick={async () => {
                if (!selectedPrintedOrderId) {
                  toast.error('Load a printed batch first');
                  return;
                }

                try {
                  const result = await syncPrintedTicketImport.mutateAsync({
                    order_id: selectedPrintedOrderId,
                    holder_name: syncPrintedHolderName || undefined,
                    holder_email: syncPrintedHolderEmail || undefined,
                    holder_phone: syncPrintedHolderPhone || undefined,
                    notes: syncPrintedNotes || undefined,
                    validation_notes: syncPrintedValidationNotes || undefined,
                  });
                  toast.success(result.message || 'Printed batch synced');
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to sync printed batch');
                }
              }}
              disabled={!selectedPrintedOrderId || syncPrintedTicketImport.isPending}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              {syncPrintedTicketImport.isPending ? 'Syncing...' : 'Sync Printed Batch'}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {offlineSales.length > 0 ? offlineSales.map((sale) => (
            <div key={sale.order_id} className="rounded-xl border p-4 text-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{sale.ticket_tier?.name || 'Offline sale batch'}</p>
                    <span className="rounded-full border px-2 py-0.5 text-xs capitalize">{sale.status}</span>
                    {sale.sale_source && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                        {sale.sale_source.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {[sale.holder_name, sale.holder_phone, sale.order_id].filter(Boolean).join(' • ')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sale.quantity} tickets • UGX {sale.total_amount.toLocaleString()} total
                    {sale.logged_at ? ` • Logged ${new Date(sale.logged_at).toLocaleString()}` : ''}
                  </p>
                  {sale.ticket_numbers.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Codes: {sale.ticket_numbers.join(', ')}
                      {sale.quantity > sale.ticket_numbers.length ? ' ...' : ''}
                    </p>
                  )}
                  {sale.validation_notes && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Validation notes: {sale.validation_notes}
                    </p>
                  )}
                  {sale.last_synced_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last synced {new Date(sale.last_synced_at).toLocaleString()}
                    </p>
                  )}
                  {sale.notes && (
                    <p className="mt-2 text-xs text-muted-foreground">{sale.notes}</p>
                  )}
                </div>
                {sale.status === 'active' ? (
                  <div className="flex flex-col gap-2">
                    {sale.printed_ticket_import && (
                      <button
                        onClick={() => loadPrintedBatchForSync(sale)}
                        className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
                      >
                        Load for Sync
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          const result = await voidOfflineSale.mutateAsync({
                            orderId: sale.order_id,
                            reason: offlineVoidReason || undefined,
                          });
                          toast.success(result.message || 'Offline sale voided');
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : 'Failed to void offline sale');
                        }
                      }}
                      disabled={voidOfflineSale.isPending}
                      className="rounded-lg border px-3 py-2 text-xs hover:bg-muted disabled:opacity-60"
                    >
                      Void Batch
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Voided {sale.voided_count}/{sale.quantity}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              No offline ticket batches logged yet. Use this for physical tickets, door sales, and manual phone bookings.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">External Capacity Allocation</h2>
            <p className="text-sm text-muted-foreground">
              Reserve ticket capacity for outside channels without marking those tickets as sold on Tesotunes. This keeps hybrid inventory honest before partner outlets reconcile back.
            </p>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {isHybrid ? 'Hybrid capacity' : `${externalAllocations.filter((item) => item.status === 'active').length} active reservation${externalAllocations.filter((item) => item.status === 'active').length === 1 ? '' : 's'}`}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={externalTierId ?? ''}
            onChange={(e) => setExternalTierId(Number(e.target.value))}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          >
            <option value="" disabled>Select ticket tier</option>
            {(event.ticket_tiers || []).map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="100000"
            value={externalQuantity}
            onChange={(e) => setExternalQuantity(e.target.value)}
            placeholder="Quantity"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="text"
            value={externalChannelLabel}
            onChange={(e) => setExternalChannelLabel(e.target.value)}
            placeholder="Outlet / partner label"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
          <input
            type="text"
            value={externalNotes}
            onChange={(e) => setExternalNotes(e.target.value)}
            placeholder="Notes"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Use this when a partner box office, physical outlet, or third-party channel needs reserved capacity before final reconciliation.
          </p>
          <button
            onClick={async () => {
              if (!externalTierId) {
                toast.error('Choose a ticket tier first');
                return;
              }

              try {
                const result = await storeExternalAllocation.mutateAsync({
                  ticket_tier_id: externalTierId,
                  quantity: Number(externalQuantity || 1),
                  channel_label: externalChannelLabel || 'External outlet',
                  notes: externalNotes || undefined,
                });
                toast.success(result.message || 'External allocation saved');
                setExternalQuantity('1');
                setExternalChannelLabel('External outlet');
                setExternalNotes('');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to save external allocation');
              }
            }}
            disabled={storeExternalAllocation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {storeExternalAllocation.isPending ? 'Saving...' : 'Reserve External Capacity'}
          </button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={externalReleaseReason}
            onChange={(e) => setExternalReleaseReason(e.target.value)}
            placeholder="Optional release reason when external partner returns inventory"
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
          />
        </div>

        <div className="mt-4 space-y-3">
          {externalAllocations.length > 0 ? externalAllocations.map((allocation) => (
            <div key={allocation.id} className="rounded-xl border p-4 text-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{allocation.channel_label}</p>
                    <span className="rounded-full border px-2 py-0.5 text-xs capitalize">{allocation.status}</span>
                    {allocation.ticket_tier?.name && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{allocation.ticket_tier.name}</span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {allocation.quantity} reserved
                    {allocation.logged_by?.name ? ` • Logged by ${allocation.logged_by.name}` : ''}
                    {allocation.created_at ? ` • ${new Date(allocation.created_at).toLocaleString()}` : ''}
                  </p>
                  {allocation.ticket_tier?.available !== undefined && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Remaining Tesotunes capacity after this reservation: {allocation.ticket_tier.available}
                    </p>
                  )}
                  {allocation.notes && (
                    <p className="mt-2 text-xs text-muted-foreground">{allocation.notes}</p>
                  )}
                  {allocation.released_at && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Released {new Date(allocation.released_at).toLocaleString()}
                      {allocation.release_reason ? ` • ${allocation.release_reason}` : ''}
                    </p>
                  )}
                </div>
                {allocation.status === 'active' ? (
                  <button
                    onClick={async () => {
                      try {
                        const result = await releaseExternalAllocation.mutateAsync({
                          allocationId: allocation.id,
                          reason: externalReleaseReason || undefined,
                        });
                        toast.success(result.message || 'External allocation released');
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Failed to release external allocation');
                      }
                    }}
                    disabled={releaseExternalAllocation.isPending}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-muted disabled:opacity-60"
                  >
                    Release Reservation
                  </button>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Released
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              No external capacity reserved yet. Add reservations here when hybrid events need inventory held back for partner outlets or other non-Tesotunes channels.
            </div>
          )}
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

      <div className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Ticket Support Queue</h2>
            <p className="text-sm text-muted-foreground">
              Review refund requests and payment issues before they turn into manual support noise. Approvals cancel the ticket and post an adjustment into event payout reporting.
            </p>
          </div>
          <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {ticketCases.filter((item) => item.status === 'open').length} open
          </div>
        </div>

          {analytics?.support_cases && (
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Open cases</p>
                <p className="mt-1 font-semibold">{analytics.support_cases.open}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 text-sm">
              <p className="text-muted-foreground">Approved</p>
              <p className="mt-1 font-semibold">{analytics.support_cases.approved}</p>
            </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Refund requests</p>
                <p className="mt-1 font-semibold">{analytics.support_cases.refund_requests}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Chargeback review</p>
                <p className="mt-1 font-semibold">{analytics.support_cases.chargeback_review_cases}</p>
              </div>
            </div>
          )}

          {analytics?.support_cases && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Chargeback exposure</p>
                <p className="mt-1 font-semibold">UGX {analytics.support_cases.chargeback_exposure_amount.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Approved refund amount</p>
                <p className="mt-1 font-semibold">UGX {analytics.support_cases.approved_refund_amount.toLocaleString()}</p>
              </div>
            </div>
          )}

        <div className="mt-4">
          <textarea
            value={supportResolutionNote}
            onChange={(e) => setSupportResolutionNote(e.target.value)}
            placeholder="Optional organizer note for case decisions"
            rows={3}
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
          />
        </div>

        <div className="mt-4 space-y-3">
          {ticketCases.length > 0 ? ticketCases.map((item) => (
            <div key={item.id} className="rounded-xl border p-4 text-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {item.case_type === 'refund_request' ? 'Refund review' : 'Payment issue'}
                      </p>
                      <span className="rounded-full border px-2 py-0.5 text-xs capitalize">{item.status}</span>
                      {item.case_type === 'payment_dispute' && item.escalation_status === 'review' && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                          Chargeback review
                        </span>
                      )}
                      {item.attendee?.ticket_tier?.name && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{item.attendee.ticket_tier.name}</span>
                    )}
                  </div>
                    <p className="mt-1 text-muted-foreground">
                      {[item.attendee?.holder_name, item.attendee?.holder_email, item.attendee?.ticket_number].filter(Boolean).join(' • ')}
                    </p>
                    {item.case_type === 'payment_dispute' && (
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {item.dispute_category && <p>Category: {item.dispute_category.replaceAll('_', ' ')}</p>}
                        {item.gateway_reference && <p>Reference: {item.gateway_reference}</p>}
                        {item.evidence_url && <p>Evidence: {item.evidence_url}</p>}
                        {item.evidence_notes && <p>Evidence notes: {item.evidence_notes}</p>}
                      </div>
                    )}
                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{item.reason}</p>
                  {item.requested_refund_amount !== null && item.requested_refund_amount !== undefined && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Requested refund: UGX {item.requested_refund_amount.toLocaleString()}
                    </p>
                  )}
                  {item.resolution_notes && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Resolution: {item.resolution_notes}
                    </p>
                  )}
                </div>

                {item.status === 'open' ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={async () => {
                        try {
                          const result = await resolveTicketCase.mutateAsync({
                            caseId: item.id,
                            decision: 'approve',
                            resolution_notes: supportResolutionNote || undefined,
                            approved_refund_amount: item.requested_refund_amount ?? item.attendee?.price_paid,
                          });
                          toast.success(result.message || 'Support case approved');
                          setSupportResolutionNote('');
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : 'Failed to approve support case');
                        }
                      }}
                      disabled={resolveTicketCase.isPending}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const result = await resolveTicketCase.mutateAsync({
                            caseId: item.id,
                            decision: 'reject',
                            resolution_notes: supportResolutionNote || undefined,
                          });
                          toast.success(result.message || 'Support case rejected');
                          setSupportResolutionNote('');
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : 'Failed to reject support case');
                        }
                      }}
                      disabled={resolveTicketCase.isPending}
                      className="rounded-lg border px-3 py-2 text-xs hover:bg-muted disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {item.resolved_at ? `Resolved ${new Date(item.resolved_at).toLocaleString()}` : 'Resolved'}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              No ticket support cases yet. Refund reviews and payment disputes will appear here when buyers raise them.
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
                <h3 className="font-medium">Promotion Funnel</h3>
                <p className="text-sm text-muted-foreground">
                  Track visits, checkout starts, and paid orders in one funnel view.
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{analytics.funnel.totals.visits} visits</p>
                <p className="text-muted-foreground">{analytics.funnel.totals.checkout_starts} checkout starts</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Visits</p>
                <p className="mt-1 font-semibold">{analytics.funnel.totals.visits.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Checkout starts</p>
                <p className="mt-1 font-semibold">{analytics.funnel.totals.checkout_starts.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Paid orders</p>
                <p className="mt-1 font-semibold">{analytics.funnel.totals.paid_orders.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">Tickets sold</p>
                <p className="mt-1 font-semibold">{analytics.funnel.totals.tickets_sold.toLocaleString()}</p>
              </div>
            </div>

            {analytics.funnel.by_source.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Source</th>
                      <th className="pb-3 pr-4 font-medium">Visits</th>
                      <th className="pb-3 pr-4 font-medium">Checkouts</th>
                      <th className="pb-3 pr-4 font-medium">Orders</th>
                      <th className="pb-3 pr-4 font-medium">Tickets</th>
                      <th className="pb-3 pr-4 font-medium">Visit → Checkout</th>
                      <th className="pb-3 font-medium">Checkout → Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.funnel.by_source.map((row) => (
                      <tr key={`funnel-${row.label}`} className="border-t">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium">{row.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {[row.channel, row.campaign_code].filter(Boolean).join(' • ') || 'Tracked source'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">{row.visits.toLocaleString()}</td>
                        <td className="py-3 pr-4">{row.checkout_starts.toLocaleString()}</td>
                        <td className="py-3 pr-4">{row.paid_orders.toLocaleString()}</td>
                        <td className="py-3 pr-4">{row.tickets_sold.toLocaleString()}</td>
                        <td className="py-3 pr-4">{row.visit_to_checkout_rate.toFixed(1)}%</td>
                        <td className="py-3">{row.checkout_to_order_rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Funnel data will appear here as visitors land on the event page and start checkout.
              </p>
            )}
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
                  <h4 className="font-medium">Campaign Comparison</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare named sources side by side across orders, payout, fees, and return.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {analytics.roi.by_source.length} tracked campaign{analytics.roi.by_source.length === 1 ? '' : 's'}
                </div>
              </div>

              {analytics.roi.by_source.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="pb-3 pr-4 font-medium">Campaign</th>
                        <th className="pb-3 pr-4 font-medium">Orders</th>
                        <th className="pb-3 pr-4 font-medium">Revenue</th>
                        <th className="pb-3 pr-4 font-medium">Payout</th>
                        <th className="pb-3 pr-4 font-medium">Tesotunes Fees</th>
                        <th className="pb-3 pr-4 font-medium">Spend</th>
                        <th className="pb-3 pr-4 font-medium">Net</th>
                        <th className="pb-3 font-medium">ROAS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.roi.by_source.map((source) => (
                        <tr key={`comparison-${source.key}`} className="border-t">
                          <td className="py-3 pr-4">
                            <div>
                              <p className="font-medium">{source.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {[source.channel, source.campaign_code].filter(Boolean).join(' • ') || 'Tracked link'}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 pr-4">{source.orders}</td>
                          <td className="py-3 pr-4">UGX {source.gross_revenue.toLocaleString()}</td>
                          <td className="py-3 pr-4">UGX {source.estimated_organizer_payout.toLocaleString()}</td>
                          <td className="py-3 pr-4">UGX {source.tesotunes_fee_revenue.toLocaleString()}</td>
                          <td className="py-3 pr-4">UGX {source.spend.toLocaleString()}</td>
                          <td className="py-3 pr-4">UGX {source.net_profit.toLocaleString()}</td>
                          <td className="py-3">{source.roas !== null ? `${source.roas.toFixed(2)}x` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Campaign comparison will appear here once at least one tracked source has spend or conversion data.
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
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={promotionMarketplaceLink}
              className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Buy marketplace promotion
            </Link>
            <Link
              href={`/events/${event.id}`}
              target="_blank"
              className="text-sm text-primary hover:underline"
            >
              Open public page
            </Link>
          </div>
        </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {event.promotion_requests && event.promotion_requests.length > 0 && (
              <div className="w-full rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium">Marketplace Promotion Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      Review Tesotunes approval status for event-linked marketplace packages.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.promotion_requests.length} request{event.promotion_requests.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {event.promotion_requests.map((request) => (
                    <div key={request.id} className="rounded-xl bg-background/80 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{request.promotion_title}</p>
                          <p className="text-xs text-muted-foreground">
                            {[request.promotion_platform, request.promotion_type].filter(Boolean).join(' • ') || 'Promotion package'}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          request.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : request.status === 'rejected'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {request.status === 'active' ? 'Approved' : request.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-muted-foreground">
                        <p>UGX {request.price_ugx.toLocaleString()} · {request.price_credits.toLocaleString()} credits</p>
                        {request.request_notes && (
                          <p className="mt-2">{request.request_notes}</p>
                        )}
                        {request.moderation_notes && (
                          <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
                            Tesotunes note: {request.moderation_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {quickCampaigns.map((preset) => (
              <button
                key={preset.label}
              onClick={() => {
                setCampaignSource(preset.source);
                setCampaignMedium(preset.medium);
                setCampaignName(`${event.slug}-${preset.medium}`);
                setCampaignNotes('');
              }}
              className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          <div>
            <label className="mb-1 block text-sm font-medium">Preset Notes</label>
            <input
              type="text"
              value={campaignNotes}
              onChange={(e) => setCampaignNotes(e.target.value)}
              placeholder="Optional reminder"
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
            <button
              onClick={async () => {
                const nextKey = `campaign-preset-${campaignPresetRows.length + 1}`;
                const nextPreset: CampaignPresetRow = {
                  key: nextKey,
                  name: campaignName || `${event.slug}-campaign`,
                  source: campaignSource || 'tesotunes_promote',
                  medium: campaignMedium || 'featured_banner',
                  campaign_code: campaignName || `${event.slug}-campaign`,
                  notes: campaignNotes,
                };

                setCampaignPresetRows((current) => [...current, nextPreset]);
                await navigator.clipboard.writeText(campaignLink);
                toast.success('Preset added locally and link copied');
              }}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Save As Preset
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium">Saved Campaign Presets</h3>
              <p className="text-sm text-muted-foreground">
                Reuse named tracked links for recurring promo channels and copy them in one click.
              </p>
            </div>
            <button
              type="button"
              onClick={addCampaignPresetRow}
              className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
            >
              Add Preset
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {campaignPresetRows.map((preset, index) => (
              <div key={`${preset.key}-${index}`} className="rounded-xl bg-muted/40 p-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <input
                    type="text"
                    value={preset.name}
                    onChange={(e) => updateCampaignPresetRow(index, 'name', e.target.value)}
                    placeholder="Preset name"
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={preset.source}
                    onChange={(e) => updateCampaignPresetRow(index, 'source', e.target.value)}
                    placeholder="Source"
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={preset.medium}
                    onChange={(e) => updateCampaignPresetRow(index, 'medium', e.target.value)}
                    placeholder="Channel"
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={preset.campaign_code}
                    onChange={(e) => updateCampaignPresetRow(index, 'campaign_code', e.target.value)}
                    placeholder="Campaign code"
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeCampaignPresetRow(index)}
                    disabled={campaignPresetRows.length === 1}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-muted disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[1.5fr_auto_auto_auto]">
                  <input
                    type="text"
                    value={preset.notes}
                    onChange={(e) => updateCampaignPresetRow(index, 'notes', e.target.value)}
                    placeholder="Notes"
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => applyCampaignPreset(preset)}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => copyPresetLink(preset)}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
                  >
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={() => copyPresetTrackerRow(preset)}
                    className="rounded-lg border px-3 py-2 text-xs hover:bg-muted"
                  >
                    Copy Row
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={saveCampaignPresets}
              disabled={updateEvent.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Save Presets
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
              const tierExternalAllocated = tier.quantity_external_allocated || 0;
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
                    {tierExternalAllocated > 0 && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {tierExternalAllocated} external
                      </span>
                    )}
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
