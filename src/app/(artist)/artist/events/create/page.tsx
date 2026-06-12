'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { useCreateEvent, CreateEventRequest } from '@/hooks/useEvents';
import EventCommissionEstimator from '@/components/events/EventCommissionEstimator';
import { cn, getErrorMessage, getValidationErrors } from '@/lib/utils';
import { toast } from 'sonner';

interface TicketTierForm {
  name: string;
  description: string;
  price: string;
  quantity: string;
  max_per_order: string;
  sales_start_date?: string;
  sales_end_date?: string;
}

const TICKETING_MODE_OPTIONS = [
  { value: 'tesotunes_managed', label: 'Tesotunes ticketing', description: 'Sell and validate tickets fully through Tesotunes.' },
  { value: 'hybrid', label: 'Hybrid ticketing', description: 'Use Tesotunes alongside your own external or printed allocation.' },
  { value: 'external_only', label: 'External only', description: 'Promote here, but send buyers to your own ticketing channel.' },
  { value: 'free_rsvp', label: 'Free RSVP', description: 'Collect attendance without paid checkout.' },
] as const;

const steps = [
  { id: 'basics', label: 'Your event', description: 'What, when, and where.' },
  { id: 'ticketing', label: 'Tickets', description: 'Prices and how many.' },
  { id: 'operations', label: 'Extras', description: 'All optional — skip if unsure.' },
  { id: 'media', label: 'Photos & publish', description: 'Add images and publish.' },
] as const;

function sanitizeIntegerInput(value: string): string {
  return value.replace(/[^\d]/g, '');
}

function sanitizeDecimalInput(value: string): string {
  return value.replace(/[^\d.]/g, '');
}

function parsePositiveInteger(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseNonNegativeNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formatCurrency(value: number): string {
  return `UGX ${Math.round(value).toLocaleString()}`;
}

function createEmptyTier(): TicketTierForm {
  return { name: '', description: '', price: '', quantity: '', max_per_order: '10' };
}

function getStepForField(field: string): number {
  if ([
    'title',
    'description',
    'category',
    'date',
    'start_date',
    'starts_at',
    'time',
    'start_time',
    'end_date',
    'ends_at',
    'venue_name',
    'venue',
    'venue_address',
    'location',
    'city',
    'country',
    'capacity',
    'attendee_limit',
  ].includes(field)) {
    return 0;
  }

  if (field.startsWith('ticket_tiers') || ['ticketing_mode', 'is_free'].includes(field)) {
    return 1;
  }

  if ([
    'registration_deadline',
    'refund_policy',
    'cancellation_policy',
    'requirements',
    'contact_info',
    'website',
  ].includes(field)) {
    return 2;
  }

  if (['cover_image', 'image', 'banner_image'].includes(field)) {
    return 3;
  }

  return 0;
}

function formatFieldLabel(field: string): string {
  if (field === '_form') {
    return 'Form';
  }

  return field
    .replace(/\.\d+\./g, ' ')
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('concert');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [capacity, setCapacity] = useState('');
  const [ticketingMode, setTicketingMode] = useState<CreateEventRequest['ticketing_mode']>('tesotunes_managed');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [refundPolicy, setRefundPolicy] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [invoiceIssuerName, setInvoiceIssuerName] = useState('');
  const [invoiceSupportEmail, setInvoiceSupportEmail] = useState('');
  const [taxRegistrationNumber, setTaxRegistrationNumber] = useState('');
  const [taxRatePercent, setTaxRatePercent] = useState('');
  const [taxIsInclusive, setTaxIsInclusive] = useState(true);
  const [ageRestriction, setAgeRestriction] = useState('');
  const [doorNotes, setDoorNotes] = useState('');
  const [taxVatNotes, setTaxVatNotes] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [website, setWebsite] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [ticketTiers, setTicketTiers] = useState<TicketTierForm[]>([
    { name: 'General Admission', description: 'Standard entry', price: '0', quantity: '100', max_per_order: '10' },
  ]);

  const isFreeRsvp = ticketingMode === 'free_rsvp';

  const normalizedTicketTiers = useMemo(() => ticketTiers.map((tier) => ({
    name: tier.name.trim(),
    description: tier.description.trim(),
    price: isFreeRsvp ? 0 : parseNonNegativeNumber(tier.price) ?? 0,
    quantity: parsePositiveInteger(tier.quantity) ?? 0,
    max_per_order: parsePositiveInteger(tier.max_per_order) ?? 0,
    sales_start_date: tier.sales_start_date || undefined,
    sales_end_date: tier.sales_end_date || undefined,
  })), [isFreeRsvp, ticketTiers]);

  const ticketSummary = useMemo(() => {
    const totalQuantity = normalizedTicketTiers.reduce((sum, tier) => sum + tier.quantity, 0);
    const grossPotential = normalizedTicketTiers.reduce((sum, tier) => sum + (tier.price * tier.quantity), 0);
    const lowestLimit = normalizedTicketTiers.reduce((lowest, tier) => {
      if (tier.max_per_order <= 0) return lowest;
      return lowest === null ? tier.max_per_order : Math.min(lowest, tier.max_per_order);
    }, null as number | null);
    return { totalQuantity, grossPotential, lowestLimit };
  }, [normalizedTicketTiers]);

  const errorEntries = Object.entries(validationErrors);
  const stepErrorCounts = useMemo(() => {
    const counts = [0, 0, 0, 0];

    for (const field of Object.keys(validationErrors)) {
      counts[getStepForField(field)] += 1;
    }

    return counts;
  }, [validationErrors]);

  const addTicketTier = () => setTicketTiers((current) => [...current, createEmptyTier()]);
  const removeTicketTier = (index: number) => {
    setTicketTiers((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current));
  };
  const updateTicketTier = (index: number, field: keyof TicketTierForm, value: string) => {
    setTicketTiers((current) => current.map((tier, tierIndex) => tierIndex === index ? { ...tier, [field]: value } : tier));
  };

  const validateBasicsStep = () => {
    if (!title.trim() || !description.trim() || !date || !time || !venue.trim() || !location.trim() || !city.trim()) {
      toast.error('Please complete the event basics before moving on.');
      return false;
    }
    return true;
  };

  const validateTicketingStep = () => {
    if (normalizedTicketTiers.length === 0) {
      toast.error('Add at least one ticket tier.');
      return false;
    }

    for (const tier of normalizedTicketTiers) {
      if (!tier.name || !tier.description) {
        toast.error('Each ticket tier needs a name and description.');
        return false;
      }
      if (tier.quantity < 1) {
        toast.error('Each ticket tier needs a quantity greater than 0.');
        return false;
      }
      if (tier.max_per_order < 1) {
        toast.error('Each ticket tier needs a max per order greater than 0.');
        return false;
      }
      if (tier.max_per_order > tier.quantity) {
        toast.error(`"${tier.name}" has a max per order higher than its available quantity.`);
        return false;
      }
    }

    return true;
  };

  const goToNextStep = () => {
    if (currentStep === 0 && !validateBasicsStep()) return;
    if (currentStep === 1 && !validateTicketingStep()) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    if (!validateBasicsStep() || !validateTicketingStep()) return;

    const eventData: CreateEventRequest = {
      title: title.trim(),
      description: description.trim(),
      category,
      date,
      end_date: endDate || undefined,
      time,
      venue: venue.trim(),
      location: location.trim(),
      city: city.trim(),
      country: country.trim(),
      is_free: isFreeRsvp,
      ticketing_mode: ticketingMode,
      capacity: parsePositiveInteger(capacity) ?? undefined,
      registration_deadline: registrationDeadline || undefined,
      refund_policy: refundPolicy.trim() || undefined,
      cancellation_policy: cancellationPolicy.trim() || undefined,
      requirements: requirementsText.split('\n').map((item) => item.trim()).filter(Boolean),
      contact_info: {
        support_email: supportEmail.trim() || undefined,
        support_phone: supportPhone.trim() || undefined,
        invoice_issuer_name: invoiceIssuerName.trim() || undefined,
        invoice_support_email: invoiceSupportEmail.trim() || undefined,
        tax_registration_number: taxRegistrationNumber.trim() || undefined,
        tax_rate_percent: parseNonNegativeNumber(taxRatePercent) ?? undefined,
        tax_is_inclusive: taxRatePercent.trim() ? taxIsInclusive : undefined,
        age_restriction: ageRestriction.trim() || undefined,
        door_notes: doorNotes.trim() || undefined,
        tax_vat_notes: taxVatNotes.trim() || undefined,
      },
      website: website.trim() || undefined,
      image: image || undefined,
      banner_image: bannerImage || undefined,
      ticket_tiers: normalizedTicketTiers.map((tier) => ({ ...tier, price: isFreeRsvp ? 0 : tier.price })),
    };

    try {
      const result = await createEvent.mutateAsync(eventData);
      toast.success('Event created successfully!');
      setValidationErrors({});
      const eventId = (result.data as Record<string, unknown>)?.id || (result.data as Record<string, unknown>)?.slug || '';
      router.push(`/artist/events/${eventId}`);
    } catch (error: unknown) {
      const extractedErrors = getValidationErrors(error);
      setValidationErrors(extractedErrors);
      const firstField = Object.keys(extractedErrors)[0];
      if (firstField) {
        setCurrentStep(getStepForField(firstField));
      }
      toast.error(getErrorMessage(error, 'Failed to create event'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Create an event</h1>
        <p className="text-muted-foreground">
          Four short steps. Only the first two need filling in — everything else has sensible defaults.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-lg border bg-card p-4">
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'w-full rounded-lg border px-4 py-3 text-left transition-colors',
                    isActive ? 'border-primary bg-primary/5' : isComplete ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                      isActive ? 'bg-primary text-primary-foreground' : isComplete ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                    )}>
                      {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                      {stepErrorCounts[index] > 0 && (
                        <p className="mt-1 text-xs text-red-600">
                          {stepErrorCounts[index]} validation {stepErrorCounts[index] === 1 ? 'issue' : 'issues'}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium">Quick summary</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>{ticketSummary.totalQuantity || 0} tickets planned</p>
              <p>{formatCurrency(ticketSummary.grossPotential)} gross potential</p>
              <p>{ticketSummary.lowestLimit ? `Smallest order cap is ${ticketSummary.lowestLimit} per checkout` : 'Set order caps on ticket tiers'}</p>
            </div>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorEntries.length > 0 && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-medium">Some fields still need attention.</p>
              <ul className="mt-2 space-y-1">
                {errorEntries.map(([field, message]) => (
                  <li key={field}>
                    {formatFieldLabel(field)}: {message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === 0 && (
            <section className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5" />
                  Event Basics
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start with the public-facing details people need before they ever think about buying.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Event Title *</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Amazing Concert" className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Description *</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes this event worth showing up for?" rows={5} className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Category *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border bg-background px-4 py-3">
                      <option value="concert">Concert</option>
                      <option value="festival">Festival</option>
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="comedy">Comedy Show</option>
                      <option value="sports">Sports</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Capacity</label>
                    <input type="text" inputMode="numeric" value={capacity} onChange={(e) => setCapacity(sanitizeIntegerInput(e.target.value))} placeholder="1000" className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Start Date *</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Time *</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">End Date</label>
                    <input type="date" value={endDate} min={date} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5" />
                  Venue & Location
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Venue Name *</label>
                    <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Lugogo Cricket Oval" className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Street Address *</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lugogo Bypass" className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">City *</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kampala" className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Country *</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Uganda" className="w-full rounded-lg border bg-background px-4 py-3" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentStep === 1 && (
            <section className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Ticket className="h-5 w-5" />
                  Ticketing Setup
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose how sales work, then define the inventory and buyer limits for each tier.
                </p>

                <div className="mt-6">
                  <label className="mb-3 block text-sm font-medium">Ticketing Mode *</label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {TICKETING_MODE_OPTIONS.map((option) => {
                      const active = option.value === ticketingMode;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setTicketingMode(option.value)}
                          className={cn('rounded-lg border px-4 py-4 text-left transition-colors', active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30')}
                        >
                          <p className="font-medium">{option.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Ticket Tiers</h3>
                    <p className="text-sm text-muted-foreground">
                      Max per order means the most one checkout can buy from that tier in a single purchase.
                    </p>
                  </div>
                  <button type="button" onClick={addTicketTier} className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 hover:bg-muted/40">
                    <Plus className="h-4 w-4" />
                    Add Tier
                  </button>
                </div>

                <div className="mt-4 rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  Example: if a tier has 100 tickets and max per order is 4, one buyer can grab at most 4 in a single checkout, which helps stop one order from wiping out the whole tier.
                </div>

                <div className="mt-6 space-y-4">
                  {ticketTiers.map((tier, index) => (
                    <div key={index} className="rounded-lg border bg-background p-4">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">Tier {index + 1}</p>
                          <p className="text-sm text-muted-foreground">Pricing, stock, and order cap for this ticket.</p>
                        </div>
                        {ticketTiers.length > 1 && (
                          <button type="button" onClick={() => removeTicketTier(index)} className="rounded-lg p-2 text-red-500 hover:bg-red-500/10">
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium">Tier Name *</label>
                          <input type="text" value={tier.name} onChange={(e) => updateTicketTier(index, 'name', e.target.value)} placeholder="VIP, Early Bird, General" className="w-full rounded-lg border bg-background px-4 py-3" />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Price (UGX) *</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={isFreeRsvp ? '0' : tier.price}
                            onChange={(e) => updateTicketTier(index, 'price', sanitizeDecimalInput(e.target.value))}
                            placeholder="50000"
                            disabled={isFreeRsvp}
                            className="w-full rounded-lg border bg-background px-4 py-3 disabled:cursor-not-allowed disabled:bg-muted"
                          />
                          {isFreeRsvp && <p className="mt-1 text-xs text-muted-foreground">Free RSVP mode forces prices to 0.</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">Description *</label>
                          <input type="text" value={tier.description} onChange={(e) => updateTicketTier(index, 'description', e.target.value)} placeholder="What comes with this ticket?" className="w-full rounded-lg border bg-background px-4 py-3" />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Quantity Available *</label>
                          <input type="text" inputMode="numeric" value={tier.quantity} onChange={(e) => updateTicketTier(index, 'quantity', sanitizeIntegerInput(e.target.value))} placeholder="100" className="w-full rounded-lg border bg-background px-4 py-3" />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Max Per Order *</label>
                          <input type="text" inputMode="numeric" value={tier.max_per_order} onChange={(e) => updateTicketTier(index, 'max_per_order', sanitizeIntegerInput(e.target.value))} placeholder="10" className="w-full rounded-lg border bg-background px-4 py-3" />
                          <p className="mt-1 text-xs text-muted-foreground">Use a lower cap for scarce tiers like VIP, and a higher cap for general admission or group-friendly tiers.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <EventCommissionEstimator
                  ticketingMode={ticketingMode}
                  currency="UGX"
                  ticketTiers={normalizedTicketTiers.map((tier) => ({ name: tier.name, price: tier.price, quantity: tier.quantity }))}
                />

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold">Ticket Snapshot</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="text-muted-foreground">Total planned inventory</p>
                      <p className="mt-1 text-xl font-semibold">{ticketSummary.totalQuantity || 0}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="text-muted-foreground">Gross sell-out value</p>
                      <p className="mt-1 text-xl font-semibold">{formatCurrency(ticketSummary.grossPotential)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="text-muted-foreground">Lowest buyer cap</p>
                      <p className="mt-1 text-xl font-semibold">{ticketSummary.lowestLimit ? `${ticketSummary.lowestLimit} per order` : 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <ShieldCheck className="h-5 w-5" />
                      Extras
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Everything here is optional. You can publish without touching any of it
                      and add details later from the event page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted/40"
                  >
                    Skip this step
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <details className="rounded-lg border">
                    <summary className="cursor-pointer px-4 py-3 font-medium hover:bg-muted/30">
                      How people reach you
                      <span className="ml-2 text-xs font-normal text-muted-foreground">phone, email, website</span>
                    </summary>
                    <div className="grid gap-4 border-t p-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Support phone</label>
                        <input type="text" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="+256..." className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Support email</label>
                        <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="tickets@yourevent.com" className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Event website</label>
                        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Last day to register</label>
                        <input type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                    </div>
                  </details>

                  <details className="rounded-lg border">
                    <summary className="cursor-pointer px-4 py-3 font-medium hover:bg-muted/30">
                      Rules for attendees
                      <span className="ml-2 text-xs font-normal text-muted-foreground">age limit, refunds, entry rules</span>
                    </summary>
                    <div className="space-y-4 border-t p-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Age limit</label>
                        <input type="text" value={ageRestriction} onChange={(e) => setAgeRestriction(e.target.value)} placeholder="e.g. 18+ only" className="w-full rounded-lg border bg-background px-4 py-3 md:max-w-xs" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Refunds</label>
                        <textarea value={refundPolicy} onChange={(e) => setRefundPolicy(e.target.value)} rows={2} placeholder="e.g. Full refund up to 48 hours before the show." className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">If the event is cancelled or moved</label>
                        <textarea value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} rows={2} placeholder="e.g. Tickets stay valid for the new date, or money back." className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Entry rules &amp; door notes</label>
                        <textarea value={doorNotes} onChange={(e) => setDoorNotes(e.target.value)} rows={2} placeholder="Gate times, bag policy, security notes." className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">What attendees should bring</label>
                        <textarea value={requirementsText} onChange={(e) => setRequirementsText(e.target.value)} rows={3} placeholder={'One per line\nBring ID\nNo outside food'} className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                    </div>
                  </details>

                  <details className="rounded-lg border">
                    <summary className="cursor-pointer px-4 py-3 font-medium hover:bg-muted/30">
                      Tax &amp; invoicing
                      <span className="ml-2 text-xs font-normal text-muted-foreground">only for registered businesses</span>
                    </summary>
                    <div className="grid gap-4 border-t p-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Business name on invoices</label>
                        <input type="text" value={invoiceIssuerName} onChange={(e) => setInvoiceIssuerName(e.target.value)} placeholder="Your event company name" className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Billing email</label>
                        <input type="email" value={invoiceSupportEmail} onChange={(e) => setInvoiceSupportEmail(e.target.value)} placeholder="billing@yourevent.com" className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Tax registration number</label>
                        <input type="text" value={taxRegistrationNumber} onChange={(e) => setTaxRegistrationNumber(e.target.value)} placeholder="TIN / VAT number" className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Tax rate (%)</label>
                        <input type="text" inputMode="decimal" value={taxRatePercent} onChange={(e) => setTaxRatePercent(sanitizeDecimalInput(e.target.value))} placeholder="18" className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                      <div className="md:col-span-2 rounded-lg border bg-muted/20 px-4 py-4">
                        <label className="flex items-center gap-3 text-sm font-medium">
                          <input type="checkbox" checked={taxIsInclusive} onChange={(e) => setTaxIsInclusive(e.target.checked)} className="h-4 w-4 rounded border" />
                          Ticket price already includes tax
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium">Tax / VAT notes</label>
                        <input type="text" value={taxVatNotes} onChange={(e) => setTaxVatNotes(e.target.value)} placeholder="VAT included in ticket price" className="w-full rounded-lg border bg-background px-4 py-3" />
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <ImageIcon className="h-5 w-5" />
                  Media
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Event Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full rounded-lg border bg-background px-4 py-3" />
                    <p className="mt-1 text-xs text-muted-foreground">Square image recommended.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Banner Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setBannerImage(e.target.files?.[0] || null)} className="w-full rounded-lg border bg-background px-4 py-3" />
                    <p className="mt-1 text-xs text-muted-foreground">Wide image recommended.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold">Review</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Event</p>
                    <p className="mt-1 font-semibold">{title || 'Untitled event'}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{category}</p>
                    <p className="text-sm text-muted-foreground">{date || 'No date'} {time ? `at ${time}` : ''}</p>
                    <p className="text-sm text-muted-foreground">{venue || 'No venue yet'}</p>
                  </div>

                  <div className="rounded-lg border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">Ticketing</p>
                    <p className="mt-1 font-semibold">{TICKETING_MODE_OPTIONS.find((option) => option.value === ticketingMode)?.label}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{ticketSummary.totalQuantity || 0} tickets planned</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(ticketSummary.grossPotential)} gross potential</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => router.back()} className="rounded-lg border bg-background px-4 py-2 hover:bg-muted/40">
                Cancel
              </button>

              {currentStep > 0 && (
                <button type="button" onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))} className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 hover:bg-muted/40">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={goToNextStep} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createEvent.isPending}
                  className={cn('rounded-lg px-4 py-2 font-medium transition-colors', createEvent.isPending ? 'cursor-not-allowed bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90')}
                >
                  {createEvent.isPending ? 'Creating...' : 'Create Event'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
