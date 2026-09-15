import type { CreateEventRequest, Event } from '@/hooks/useEvents';

/**
 * The one shape the event form edits, for artists and admins, create and edit.
 *
 * Four separate forms used to exist, each with its own field names and bugs:
 * edit pages sent tiers without ids (so a save would recreate them), prefilled
 * times in UTC, and the admin form posted fields the API never read.
 */

export const EVENT_TIMEZONE = 'Africa/Kampala';

export type TicketingMode = NonNullable<Event['ticketing_mode']>;
export type FeeHandling = NonNullable<Event['fee_handling']>;

export interface TierDraft {
  /** Local key for React; `id` is the saved tier id, when there is one. */
  key: string;
  id?: number;
  name: string;
  price: string;
  quantity: string;
  description: string;
  maxPerOrder: string;
  saleStartsAt: string; // "YYYY-MM-DDTHH:mm" local, or ''
  saleEndsAt: string;
  sold: number;
}

export interface EventDraft {
  title: string;
  description: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  city: string;
  country: string;
  capacity: string;
  ticketingMode: TicketingMode;
  feeHandling: FeeHandling;
  tiers: TierDraft[];
  cover: File | null;
  coverPreview: string;
  // Optional extras
  supportPhone: string;
  supportEmail: string;
  website: string;
  registrationDeadline: string;
  ageRestriction: string;
  refundPolicy: string;
  cancellationPolicy: string;
  doorNotes: string;
  requirements: string;
  invoiceIssuerName: string;
  invoiceSupportEmail: string;
  taxRegistrationNumber: string;
  taxRatePercent: string;
  taxIsInclusive: boolean;
  taxVatNotes: string;
  // Admin
  status: string;
  isFeatured: boolean;
  artistId: string;
  artistName: string;
}

export const CATEGORIES = [
  { value: 'concert', label: 'Concert' },
  { value: 'club_night', label: 'Club night' },
  { value: 'festival', label: 'Festival' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
] as const;

export const TIER_PRESETS = [
  { name: 'Ordinary', price: '5000', quantity: '300' },
  { name: 'VIP', price: '15000', quantity: '80' },
  { name: 'Table', price: '100000', quantity: '10' },
] as const;

let tierCounter = 0;
export function newTier(partial: Partial<TierDraft> = {}): TierDraft {
  tierCounter += 1;
  return {
    key: `tier-${Date.now()}-${tierCounter}`,
    name: '',
    price: '',
    quantity: '',
    description: '',
    maxPerOrder: '10',
    saleStartsAt: '',
    saleEndsAt: '',
    sold: 0,
    ...partial,
  };
}

export function emptyDraft(): EventDraft {
  return {
    title: '',
    description: '',
    category: 'concert',
    startDate: '',
    startTime: '20:00',
    endDate: '',
    endTime: '',
    venueName: '',
    venueAddress: '',
    city: '',
    country: 'Uganda',
    capacity: '',
    ticketingMode: 'tesotunes_managed',
    feeHandling: 'pass_to_buyer',
    tiers: [newTier({ name: 'Ordinary', price: '', quantity: '' })],
    cover: null,
    coverPreview: '',
    supportPhone: '',
    supportEmail: '',
    website: '',
    registrationDeadline: '',
    ageRestriction: '',
    refundPolicy: '',
    cancellationPolicy: '',
    doorNotes: '',
    requirements: '',
    invoiceIssuerName: '',
    invoiceSupportEmail: '',
    taxRegistrationNumber: '',
    taxRatePercent: '',
    taxIsInclusive: true,
    taxVatNotes: '',
    status: 'draft',
    isFeatured: false,
    artistId: '',
    artistName: '',
  };
}

/** An ISO instant → local {date, time} in the event's timezone (not the browser's, not UTC). */
export function toLocalParts(iso?: string | null, timeZone = EVENT_TIMEZONE): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${hour}:${get('minute')}` };
}

function localDateTime(iso?: string | null, timeZone?: string): string {
  const { date, time } = toLocalParts(iso, timeZone);
  return date ? `${date}T${time}` : '';
}

export function draftFromEvent(event: Event): EventDraft {
  const tz = event.timezone || EVENT_TIMEZONE;
  const start = toLocalParts(event.starts_at, tz);
  const end = toLocalParts(event.ends_at, tz);
  const ci = event.contact_info ?? {};
  const raw = event as Event & { artist_id?: number | null; artwork?: string; organizer?: { artist_id?: number | null; name?: string } };

  return {
    ...emptyDraft(),
    title: event.title ?? '',
    description: event.description ?? '',
    category: event.category || event.event_type || 'concert',
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    venueName: event.venue_name || event.location_obj?.name || '',
    venueAddress: event.venue_address || event.location_obj?.address || '',
    city: event.city || event.location_obj?.city || '',
    country: event.country || 'Uganda',
    capacity: event.attendee_limit ? String(event.attendee_limit) : '',
    ticketingMode: event.ticketing_mode || (event.is_free ? 'free_rsvp' : 'tesotunes_managed'),
    feeHandling: event.fee_handling || 'pass_to_buyer',
    tiers: (event.ticket_tiers ?? []).map((t) =>
      newTier({
        id: t.id,
        name: t.name ?? '',
        price: String(t.price_ugx ?? t.price ?? 0),
        quantity: String(t.quantity_total ?? t.quantity ?? ''),
        description: t.description ?? '',
        maxPerOrder: String(t.max_per_order ?? 10),
        saleStartsAt: localDateTime(t.sale_starts_at ?? t.sales_start_date, tz),
        // A sale end equal to the event's start/end is the automatic default;
        // leave it blank so moving the event moves it too.
        saleEndsAt: [event.starts_at, event.ends_at].includes(t.sale_ends_at ?? t.sales_end_date ?? undefined)
          ? ''
          : localDateTime(t.sale_ends_at ?? t.sales_end_date, tz),
        sold: t.quantity_sold ?? 0,
      }),
    ),
    coverPreview: raw.artwork || '',
    supportPhone: ci.support_phone ?? '',
    supportEmail: ci.support_email ?? '',
    website: event.website ?? '',
    registrationDeadline: localDateTime(event.registration_deadline, tz),
    ageRestriction: ci.age_restriction ?? '',
    refundPolicy: event.refund_policy ?? '',
    cancellationPolicy: event.cancellation_policy ?? '',
    doorNotes: ci.door_notes ?? '',
    requirements: (event.requirements ?? []).join('\n'),
    invoiceIssuerName: ci.invoice_issuer_name ?? '',
    invoiceSupportEmail: ci.invoice_support_email ?? '',
    taxRegistrationNumber: ci.tax_registration_number ?? '',
    taxRatePercent: ci.tax_rate_percent != null ? String(ci.tax_rate_percent) : '',
    taxIsInclusive: ci.tax_is_inclusive ?? true,
    taxVatNotes: ci.tax_vat_notes ?? '',
    status: event.status ?? 'draft',
    isFeatured: Boolean(event.is_featured),
    artistId: String(raw.artist_id ?? raw.organizer?.artist_id ?? ''),
    artistName: raw.organizer?.artist_id ? raw.organizer?.name ?? '' : '',
  };
}

export const isFree = (draft: EventDraft) => draft.ticketingMode === 'free_rsvp';
export const sellsOnTesotunes = (draft: EventDraft) =>
  draft.ticketingMode === 'tesotunes_managed' || draft.ticketingMode === 'hybrid';

const toInt = (value: string) => {
  const n = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};
const toMoney = (value: string) => {
  const n = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export function normalizedTiers(draft: EventDraft) {
  return draft.tiers.map((t) => ({
    ...(t.id ? { id: t.id } : {}),
    name: t.name.trim(),
    description: t.description.trim(),
    price: isFree(draft) ? 0 : toMoney(t.price),
    quantity: toInt(t.quantity),
    max_per_order: Math.max(1, toInt(t.maxPerOrder) || 10),
    sale_starts_at: t.saleStartsAt || undefined,
    sale_ends_at: t.saleEndsAt || undefined,
  }));
}

export type StepErrors = Record<string, string>;

/** Per-step checks, keyed by field so the form can point at the input. */
export function validateStep(step: number, draft: EventDraft): StepErrors {
  const errors: StepErrors = {};

  if (step === 0) {
    if (!draft.title.trim()) errors.title = 'Name your event';
    if (!draft.startDate) errors.startDate = 'Pick a date';
    if (!draft.startTime) errors.startTime = 'Start time';
    if (!draft.venueName.trim()) errors.venueName = 'Where is it?';
    if (!draft.city.trim()) errors.city = 'City';
    if (draft.endDate && draft.endDate < draft.startDate) errors.endDate = 'Ends before it starts';
  }

  if (step === 1 && draft.ticketingMode !== 'external_only') {
    if (draft.tiers.length === 0) errors.tiers = 'Add at least one ticket';
    draft.tiers.forEach((t, i) => {
      if (!t.name.trim()) errors[`tier.${i}.name`] = 'Name';
      if (!isFree(draft) && toMoney(t.price) <= 0) errors[`tier.${i}.price`] = 'Price';
      const qty = toInt(t.quantity);
      if (qty < 1) errors[`tier.${i}.quantity`] = 'Qty';
      else if (qty < t.sold) errors[`tier.${i}.quantity`] = `Min ${t.sold} (sold)`;
    });
  }

  return errors;
}

/** Map API validation keys (ticket_tiers.0.quantity) onto form keys and steps. */
export function mapServerErrors(errors: Record<string, string>): { errors: StepErrors; step: number } {
  const mapped: StepErrors = {};
  let step = 2;
  const fieldToKey: Record<string, [string, number]> = {
    title: ['title', 0], start_date: ['startDate', 0], starts_at: ['startDate', 0], start_time: ['startTime', 0],
    end_date: ['endDate', 0], ends_at: ['endDate', 0], venue_name: ['venueName', 0], city: ['city', 0],
    cover_image: ['cover', 0], description: ['description', 0], ticketing_mode: ['ticketingMode', 1],
    fee_handling: ['feeHandling', 1],
  };
  for (const [field, message] of Object.entries(errors)) {
    const tier = field.match(/^ticket_tiers\.(\d+)\.(\w+)$/);
    if (tier) {
      const key = tier[2] === 'max_per_order' ? 'maxPerOrder' : tier[2] === 'sale_ends_at' ? 'saleEndsAt' : tier[2];
      mapped[`tier.${tier[1]}.${key}`] = message;
      step = Math.min(step, 1);
      continue;
    }
    const known = fieldToKey[field];
    if (known) {
      mapped[known[0]] = message;
      step = Math.min(step, known[1]);
    } else {
      mapped[field] = message;
    }
  }
  return { errors: mapped, step };
}

function contactInfo(draft: EventDraft) {
  const clean = (v: string) => v.trim() || undefined;
  return {
    support_email: clean(draft.supportEmail),
    support_phone: clean(draft.supportPhone),
    invoice_issuer_name: clean(draft.invoiceIssuerName),
    invoice_support_email: clean(draft.invoiceSupportEmail),
    tax_registration_number: clean(draft.taxRegistrationNumber),
    tax_rate_percent: draft.taxRatePercent.trim() ? toMoney(draft.taxRatePercent) : undefined,
    tax_is_inclusive: draft.taxRatePercent.trim() ? draft.taxIsInclusive : undefined,
    age_restriction: clean(draft.ageRestriction),
    door_notes: clean(draft.doorNotes),
    tax_vat_notes: clean(draft.taxVatNotes),
  };
}

/** Payload for /artist/events (create and update). Times are local; the API reads them in the event's timezone. */
export function toArtistRequest(draft: EventDraft, status?: string): CreateEventRequest {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    date: draft.startDate,
    time: draft.startTime,
    end_date: draft.endDate || undefined,
    end_time: draft.endTime || undefined,
    timezone: EVENT_TIMEZONE,
    venue: draft.venueName.trim(),
    venue_address: draft.venueAddress.trim() || undefined,
    city: draft.city.trim(),
    country: draft.country.trim(),
    capacity: toInt(draft.capacity) || undefined,
    is_free: isFree(draft),
    ticketing_mode: draft.ticketingMode,
    fee_handling: draft.feeHandling,
    registration_deadline: draft.registrationDeadline || undefined,
    refund_policy: draft.refundPolicy.trim() || undefined,
    cancellation_policy: draft.cancellationPolicy.trim() || undefined,
    requirements: draft.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
    contact_info: contactInfo(draft),
    website: draft.website.trim() || undefined,
    image: draft.cover ?? undefined,
    status: status ?? draft.status,
    ticket_tiers: draft.ticketingMode === 'external_only' ? undefined : normalizedTiers(draft),
  };
}

/** FormData for /admin/events (create and update). */
export function toAdminFormData(draft: EventDraft, status?: string, isUpdate = false): FormData {
  const data = new FormData();
  if (isUpdate) data.append('_method', 'PUT');
  const put = (key: string, value: string | undefined | null) => {
    if (value !== undefined && value !== null && value !== '') data.append(key, value);
  };
  put('title', draft.title.trim());
  put('description', draft.description.trim());
  put('category', draft.category);
  put('event_type', draft.category);
  put('start_date', draft.startDate);
  put('start_time', draft.startTime);
  put('end_date', draft.endDate);
  put('end_time', draft.endTime);
  put('timezone', EVENT_TIMEZONE);
  put('venue_name', draft.venueName.trim());
  put('venue_address', draft.venueAddress.trim());
  put('city', draft.city.trim());
  put('country', draft.country.trim());
  put('attendee_limit', draft.capacity ? String(toInt(draft.capacity)) : '');
  data.append('is_free', isFree(draft) ? '1' : '0');
  put('ticketing_mode', draft.ticketingMode);
  put('fee_handling', draft.feeHandling);
  put('status', status ?? draft.status);
  data.append('is_featured', draft.isFeatured ? '1' : '0');
  put('artist_id', draft.artistId);
  if (draft.cover) data.append('cover_image', draft.cover);
  if (draft.ticketingMode !== 'external_only') {
    data.append('ticket_tiers', JSON.stringify(normalizedTiers(draft)));
  }
  return data;
}

export function ticketSummary(draft: EventDraft) {
  const tiers = normalizedTiers(draft);
  return {
    count: tiers.reduce((sum, t) => sum + t.quantity, 0),
    grossValue: tiers.reduce((sum, t) => sum + t.price * t.quantity, 0),
  };
}

export const formatUGX = (value: number) => `UGX ${Math.round(value).toLocaleString()}`;
