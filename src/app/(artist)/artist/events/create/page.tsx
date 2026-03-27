'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Image as ImageIcon, Calendar, MapPin, DollarSign, Ticket } from 'lucide-react';
import { useCreateEvent, CreateEventRequest } from '@/hooks/useEvents';
import EventCommissionEstimator from '@/components/events/EventCommissionEstimator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

interface TicketTier {
  name: string;
  description: string;
  price: number;
  quantity: number;
  max_per_order: number;
  sales_start_date?: string;
  sales_end_date?: string;
}

const TICKETING_MODE_OPTIONS = [
  {
    value: 'tesotunes_managed',
    label: 'Tesotunes ticketing',
    description: 'Sell and validate tickets fully through Tesotunes.',
  },
  {
    value: 'hybrid',
    label: 'Hybrid ticketing',
    description: 'Use Tesotunes alongside your own external or printed allocation.',
  },
  {
    value: 'external_only',
    label: 'External only',
    description: 'Promote here, but send buyers to your own ticketing channel.',
  },
  {
    value: 'free_rsvp',
    label: 'Free RSVP',
    description: 'Collect attendance without paid checkout.',
  },
] as const;

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  // Event info
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
  const [capacity, setCapacity] = useState<string>('');
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

  // Ticket tiers
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      name: 'General Admission',
      description: 'Standard entry',
      price: 0,
      quantity: 100,
      max_per_order: 10,
    },
  ]);

  const addTicketTier = () => {
    setTicketTiers([
      ...ticketTiers,
      {
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        max_per_order: 10,
      },
    ]);
  };

  const removeTicketTier = (index: number) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(ticketTiers.filter((_, i) => i !== index));
    }
  };

  const updateTicketTier = (index: number, field: keyof TicketTier, value: TicketTier[keyof TicketTier]) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };

  const isFreeRsvp = ticketingMode === 'free_rsvp';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || !description || !date || !time || !venue || !location || !city) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (ticketTiers.length === 0) {
      toast.error('Please add at least one ticket tier');
      return;
    }

    if (ticketTiers.some(t => !t.name || t.price < 0 || t.quantity < 1)) {
      toast.error('Please complete all ticket tier information');
      return;
    }

    const eventData: CreateEventRequest = {
      title,
      description,
      category,
      date,
      end_date: endDate || undefined,
      time,
      venue,
      location,
      city,
      country,
      is_free: isFreeRsvp,
      ticketing_mode: ticketingMode,
      capacity: capacity ? parseInt(capacity) : undefined,
      registration_deadline: registrationDeadline || undefined,
      refund_policy: refundPolicy || undefined,
      cancellation_policy: cancellationPolicy || undefined,
      requirements: requirementsText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      contact_info: {
        support_email: supportEmail || undefined,
        support_phone: supportPhone || undefined,
        invoice_issuer_name: invoiceIssuerName || undefined,
        invoice_support_email: invoiceSupportEmail || undefined,
        tax_registration_number: taxRegistrationNumber || undefined,
        tax_rate_percent: taxRatePercent ? Number(taxRatePercent) : undefined,
        tax_is_inclusive: taxRatePercent ? taxIsInclusive : undefined,
        age_restriction: ageRestriction || undefined,
        door_notes: doorNotes || undefined,
        tax_vat_notes: taxVatNotes || undefined,
      },
      website: website || undefined,
      image: image || undefined,
      banner_image: bannerImage || undefined,
      ticket_tiers: ticketTiers.map((tier) => ({
        ...tier,
        price: isFreeRsvp ? 0 : tier.price,
      })),
    };

    try {
      const result = await createEvent.mutateAsync(eventData);
      toast.success('Event created successfully!');
      const eventId = (result.data as Record<string, unknown>)?.id || (result.data as Record<string, unknown>)?.slug || '';
      router.push(`/artist/events/${eventId}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to create event'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          Set up your event and start selling tickets
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Amazing Concert"
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event..."
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              >
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
              <label className="block text-sm font-medium mb-2">
                Capacity (optional)
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="1000"
                min="1"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Ticketing Mode *
              </label>
              <select
                value={ticketingMode}
                onChange={(e) => setTicketingMode(e.target.value as CreateEventRequest['ticketing_mode'])}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              >
                {TICKETING_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-muted-foreground">
                {TICKETING_MODE_OPTIONS.find((option) => option.value === ticketingMode)?.description}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Business Rules & Support</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Event Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="tickets@yourevent.com"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Support Phone
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+256..."
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Invoice Issuer Name
              </label>
              <input
                type="text"
                value={invoiceIssuerName}
                onChange={(e) => setInvoiceIssuerName(e.target.value)}
                placeholder="Tesotunes Events Limited"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Invoice Support Email
              </label>
              <input
                type="email"
                value={invoiceSupportEmail}
                onChange={(e) => setInvoiceSupportEmail(e.target.value)}
                placeholder="billing@yourevent.com"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tax Registration Number
              </label>
              <input
                type="text"
                value={taxRegistrationNumber}
                onChange={(e) => setTaxRegistrationNumber(e.target.value)}
                placeholder="TIN / VAT Number"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tax Rate Percent
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                placeholder="18"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2 rounded-lg border bg-muted/20 px-4 py-3">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={taxIsInclusive}
                  onChange={(e) => setTaxIsInclusive(e.target.checked)}
                  className="h-4 w-4 rounded border"
                />
                Ticket price already includes tax
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                This affects invoice presentation only. Tesotunes will not add extra tax at checkout unless a charging contract is introduced later.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Age Restriction
              </label>
              <input
                type="text"
                value={ageRestriction}
                onChange={(e) => setAgeRestriction(e.target.value)}
                placeholder="18+ only"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tax / VAT Notes
              </label>
              <input
                type="text"
                value={taxVatNotes}
                onChange={(e) => setTaxVatNotes(e.target.value)}
                placeholder="VAT included in ticket price"
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Refund Policy
              </label>
              <textarea
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                rows={3}
                placeholder="State your refund terms clearly..."
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Cancellation Policy
              </label>
              <textarea
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                rows={3}
                placeholder="Explain what happens if the event is postponed or cancelled..."
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Door Notes
              </label>
              <textarea
                value={doorNotes}
                onChange={(e) => setDoorNotes(e.target.value)}
                rows={3}
                placeholder="Entry rules, gate times, security notes..."
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Attendee Requirements
              </label>
              <textarea
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                rows={4}
                placeholder={"One requirement per line\nBring ID\nNo outside food"}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>
          </div>
        </section>

        {/* Date & Time */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Date & Time</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={date}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Time *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Lugogo Cricket Oval"
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lugogo Bypass"
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kampala"
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Country *
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Uganda"
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Images
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Square image recommended (1:1 ratio)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Banner Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Wide image recommended (16:9 ratio)
              </p>
            </div>
          </div>
        </section>

        {/* Ticket Tiers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Tiers
            </h2>
            <button
              type="button"
              onClick={addTicketTier}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {ticketTiers.map((tier, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium">Tier {index + 1}</h3>
                  {ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketTier(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tier Name *
                    </label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => updateTicketTier(index, 'name', e.target.value)}
                      placeholder="VIP, Regular, etc."
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price (UGX) *
                    </label>
                    <input
                      type="number"
                      value={isFreeRsvp ? 0 : tier.price}
                      onChange={(e) => updateTicketTier(index, 'price', parseInt(e.target.value) || 0)}
                      placeholder="50000"
                      min="0"
                      required
                      disabled={isFreeRsvp}
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                    />
                    {isFreeRsvp && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Free RSVP mode forces ticket prices to 0.
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={tier.description}
                      onChange={(e) => updateTicketTier(index, 'description', e.target.value)}
                      placeholder="What's included with this ticket?"
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quantity Available *
                    </label>
                    <input
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => updateTicketTier(index, 'quantity', parseInt(e.target.value))}
                      placeholder="100"
                      min="1"
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Per Order *
                    </label>
                    <input
                      type="number"
                      value={tier.max_per_order}
                      onChange={(e) => updateTicketTier(index, 'max_per_order', parseInt(e.target.value))}
                      placeholder="10"
                      min="1"
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <EventCommissionEstimator
          endpoint="/artist/events/commission-simulation"
          ticketingMode={ticketingMode}
          currency="UGX"
          ticketTiers={ticketTiers.map((tier) => ({
            name: tier.name,
            price: isFreeRsvp ? 0 : tier.price,
            quantity: tier.quantity,
          }))}
        />

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createEvent.isPending}
            className={cn(
              'flex-1 px-6 py-3 rounded-lg font-medium transition-colors',
              createEvent.isPending
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {createEvent.isPending ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
