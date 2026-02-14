'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, Calendar, MapPin, DollarSign, Ticket, Loader2, Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { useUpdateEvent, Event, UpdateEventRequest } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TicketTierForm {
  id?: number;
  name: string;
  description: string;
  price: number;
  price_credits: number;
  quantity: number;
  max_per_order: number;
}

export default function EditArtistEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const updateEvent = useUpdateEvent();

  const { data: event, isLoading } = useQuery({
    queryKey: ['artist', 'events', id],
    queryFn: () => apiGet<{ data: Event }>(`/artist/events/${id}`).then(r => r.data),
    enabled: !!id,
  });

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
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState('draft');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // Ticket tiers
  const [ticketTiers, setTicketTiers] = useState<TicketTierForm[]>([]);

  // Load event data
  useEffect(() => {
    if (!event) return;
    setTitle(event.title || '');
    setDescription(event.description || '');
    setCategory(event.category || 'concert');
    setStatus(event.status || 'draft');
    setCountry(event.country || 'Uganda');
    setCity(event.city || '');
    setVenue(event.venue_name || event.venue || '');
    setLocation(event.location || '');
    setCapacity(String(event.attendee_limit || event.capacity || ''));

    // Parse date/time from starts_at
    if (event.starts_at) {
      const dt = new Date(event.starts_at);
      setDate(dt.toISOString().split('T')[0]);
      setTime(dt.toISOString().split('T')[1]?.substring(0, 5) || '');
    } else if (event.date) {
      setDate(event.date);
      setTime(event.time || '');
    }
    if (event.ends_at) {
      setEndDate(new Date(event.ends_at).toISOString().split('T')[0]);
    } else if (event.end_date) {
      setEndDate(event.end_date);
    }

    // Image preview
    setImagePreview(event.artwork || event.image || '');

    // Ticket tiers
    if (event.ticket_tiers && event.ticket_tiers.length > 0) {
      setTicketTiers(event.ticket_tiers.map(t => ({
        id: t.id,
        name: t.name || '',
        description: t.description || '',
        price: t.price_ugx || t.price || 0,
        price_credits: t.price_credits || 0,
        quantity: t.quantity_total || t.quantity || 0,
        max_per_order: t.max_per_order || 10,
      })));
    }
  }, [event]);

  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, { name: '', description: '', price: 0, price_credits: 0, quantity: 0, max_per_order: 10 }]);
  };

  const removeTicketTier = (index: number) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(ticketTiers.filter((_, i) => i !== index));
    }
  };

  const updateTier = (index: number, field: keyof TicketTierForm, value: string | number) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !date || !time || !venue || !city) {
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

    try {
      await updateEvent.mutateAsync({
        id: parseInt(id),
        title,
        description,
        category,
        date,
        end_date: endDate || undefined,
        time,
        venue,
        location: location || `${city}, ${country}`,
        city,
        country,
        capacity: capacity ? parseInt(capacity) : undefined,
        image: image || undefined,
        ticket_tiers: ticketTiers.map(t => ({
          name: t.name,
          description: t.description,
          price: t.price,
          quantity: t.quantity,
          max_per_order: t.max_per_order,
        })),
      } as UpdateEventRequest);
      toast.success('Event updated successfully!');
      router.push(`/artist/events/${id}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update event');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Event not found</h2>
        <Link href="/artist/events" className="text-primary hover:underline">Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/artist/events/${id}`} className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
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
              <label className="block text-sm font-medium mb-2">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              >
                <option value="concert">Concert</option>
                <option value="festival">Festival</option>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="party">Party</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min={0}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>
          </div>
        </section>

        {/* Venue */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Venue
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Venue Name *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border bg-background"
              />
            </div>
          </div>
        </section>

        {/* Cover Image */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Cover Image
          </h2>
          <div className="flex items-center gap-4">
            {(imagePreview || image) && (
              <div className="relative h-24 w-36 rounded-lg overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image ? URL.createObjectURL(image) : imagePreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer hover:bg-muted">
              <ImageIcon className="h-4 w-4" />
              {imagePreview || image ? 'Change Image' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImage(file);
                }}
              />
            </label>
          </div>
        </section>

        {/* Ticket Tiers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Tiers
            </h2>
            <button type="button" onClick={addTicketTier} className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus className="h-4 w-4" /> Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {ticketTiers.map((tier, index) => (
              <div key={index} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Tier {index + 1}</p>
                  {ticketTiers.length > 1 && (
                    <button type="button" onClick={() => removeTicketTier(index)} className="text-red-500 hover:underline text-sm">
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => updateTier(index, 'name', e.target.value)}
                      placeholder="e.g. Regular"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={tier.description}
                      onChange={(e) => updateTier(index, 'description', e.target.value)}
                      placeholder="Standard entry"
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Price (UGX) *</label>
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updateTier(index, 'price', parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => updateTier(index, 'quantity', parseInt(e.target.value) || 0)}
                      min={1}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Max Per Order</label>
                    <input
                      type="number"
                      value={tier.max_per_order}
                      onChange={(e) => updateTier(index, 'max_per_order', parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Price (Credits)</label>
                    <input
                      type="number"
                      value={tier.price_credits}
                      onChange={(e) => updateTier(index, 'price_credits', parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updateEvent.isPending}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
              updateEvent.isPending
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {updateEvent.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Event'
            )}
          </button>
          <Link
            href={`/artist/events/${id}`}
            className="px-6 py-3 rounded-lg border hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
