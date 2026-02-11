'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPostForm } from '@/lib/api';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import { Upload, X, Calendar, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

interface EventFormData {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  event_type: string;
  venue_name: string;
  venue_address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  timezone: string;
  is_online: boolean;
  online_url: string;
  is_free: boolean;
  currency: string;
  min_age: string;
  max_capacity: string;
  is_featured: boolean;
  status: string;
  artist_ids: string[];
  cover_image: File | null;
  ticket_tiers: TicketTier[];
}

const initialFormData: EventFormData = {
  title: '',
  slug: '',
  description: '',
  short_description: '',
  event_type: 'concert',
  venue_name: '',
  venue_address: '',
  city: '',
  country: '',
  latitude: '',
  longitude: '',
  start_date: '',
  start_time: '',
  end_date: '',
  end_time: '',
  timezone: 'Africa/Dar_es_Salaam',
  is_online: false,
  online_url: '',
  is_free: false,
  currency: 'TZS',
  min_age: '',
  max_capacity: '',
  is_featured: false,
  status: 'draft',
  artist_ids: [],
  cover_image: null,
  ticket_tiers: [],
};

interface Artist {
  id: string;
  name: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const { data: artistsData } = useQuery({
    queryKey: ['admin', 'artists-select'],
    queryFn: () => apiGet<{ data: Artist[] }>('/api/admin/artists?select=true'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPostForm('/api/admin/events', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      router.push('/admin/events');
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Auto-generate slug
    if (name === 'title') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleArtistToggle = (artistId: string) => {
    setFormData(prev => ({
      ...prev,
      artist_ids: prev.artist_ids.includes(artistId)
        ? prev.artist_ids.filter(id => id !== artistId)
        : [...prev.artist_ids, artistId],
    }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const addTicketTier = () => {
    setFormData(prev => ({
      ...prev,
      ticket_tiers: [
        ...prev.ticket_tiers,
        { id: Date.now().toString(), name: '', price: 0, quantity: 0, description: '' },
      ],
    }));
  };

  const updateTicketTier = (id: string, field: keyof TicketTier, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      ticket_tiers: prev.ticket_tiers.map(tier =>
        tier.id === id ? { ...tier, [field]: value } : tier
      ),
    }));
  };

  const removeTicketTier = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ticket_tiers: prev.ticket_tiers.filter(tier => tier.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      
      if (key === 'artist_ids') {
        (value as string[]).forEach((id, index) => {
          data.append(`artist_ids[${index}]`, id);
        });
      } else if (key === 'ticket_tiers') {
        data.append('ticket_tiers', JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        data.append(key, value ? '1' : '0');
      } else if (value instanceof File) {
        data.append(key, value);
      } else {
        data.append(key, String(value));
      }
    });
    
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Event"
        description="Add a new event"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Events', href: '/admin/events' },
          { label: 'Create' },
        ]}
        backHref="/admin/events"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Event Information" description="Basic event details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Title"
              name="title"
              value={formData.title}
              onChangeEvent={handleChange}
              error={errors.title}
              required
              placeholder="Summer Music Festival 2024"
            />
            <FormField
              label="Slug"
              name="slug"
              value={formData.slug}
              onChangeEvent={handleChange}
              error={errors.slug}
              required
              placeholder="summer-music-festival-2024"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Type</label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="concert">Concert</option>
                <option value="festival">Festival</option>
                <option value="club_night">Club Night</option>
                <option value="live_stream">Live Stream</option>
                <option value="album_release">Album Release</option>
                <option value="meet_greet">Meet & Greet</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
                <option value="sold_out">Sold Out</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brief summary of the event..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Detailed event description..."
            />
          </div>
        </FormSection>

        <FormSection title="Date & Time" description="When the event takes place">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChangeEvent={handleChange}
              error={errors.start_date}
              required
            />
            <FormField
              label="Start Time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChangeEvent={handleChange}
              error={errors.start_time}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChangeEvent={handleChange}
              error={errors.end_date}
            />
            <FormField
              label="End Time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChangeEvent={handleChange}
              error={errors.end_time}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Africa/Dar_es_Salaam">East Africa Time (EAT)</option>
                <option value="Africa/Nairobi">Nairobi</option>
                <option value="Africa/Lagos">Lagos</option>
                <option value="Africa/Johannesburg">Johannesburg</option>
                <option value="Europe/London">London</option>
                <option value="America/New_York">New York</option>
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Location" description="Where the event takes place">
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_online"
                checked={formData.is_online}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">This is an online event</span>
            </label>
          </div>

          {formData.is_online ? (
            <FormField
              label="Online Event URL"
              name="online_url"
              type="url"
              value={formData.online_url}
              onChangeEvent={handleChange}
              error={errors.online_url}
              placeholder="https://youtube.com/live/..."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Venue Name"
                  name="venue_name"
                  value={formData.venue_name}
                  onChangeEvent={handleChange}
                  error={errors.venue_name}
                  placeholder="National Stadium"
                />
                <FormField
                  label="Venue Address"
                  name="venue_address"
                  value={formData.venue_address}
                  onChangeEvent={handleChange}
                  error={errors.venue_address}
                  placeholder="123 Main Street"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChangeEvent={handleChange}
                  error={errors.city}
                  placeholder="Dar es Salaam"
                />
                <FormField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChangeEvent={handleChange}
                  error={errors.country}
                  placeholder="Tanzania"
                />
              </div>
            </>
          )}
        </FormSection>

        <FormSection title="Cover Image" description="Event banner image">
          <div className="flex items-start gap-6">
            {coverPreview ? (
              <div className="relative w-64 h-36 rounded-lg overflow-hidden">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview(null);
                    setFormData(prev => ({ ...prev, cover_image: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-64 h-36 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div>
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted">
                <Upload className="h-4 w-4" />
                <span>Upload Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: 1920x1080 or 16:9 ratio
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection title="Performing Artists" description="Artists appearing at this event">
          <div className="flex flex-wrap gap-2 mb-4">
            {artistsData?.data?.map((artist) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => handleArtistToggle(artist.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  formData.artist_ids.includes(artist.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                {artist.name}
              </button>
            ))}
          </div>
          {formData.artist_ids.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {formData.artist_ids.length} artist(s) selected
            </p>
          )}
        </FormSection>

        <FormSection title="Tickets" description="Ticket pricing and availability">
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_free"
                checked={formData.is_free}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">This is a free event</span>
            </label>
          </div>

          {!formData.is_free && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="TZS">TZS (Tanzanian Shilling)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="UGX">UGX (Ugandan Shilling)</option>
                  </select>
                </div>
                <FormField
                  label="Max Capacity"
                  name="max_capacity"
                  type="number"
                  value={formData.max_capacity}
                  onChangeEvent={handleChange}
                  error={errors.max_capacity}
                  placeholder="5000"
                />
                <FormField
                  label="Min Age"
                  name="min_age"
                  type="number"
                  value={formData.min_age}
                  onChangeEvent={handleChange}
                  error={errors.min_age}
                  placeholder="18"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Ticket Tiers</label>
                  <button
                    type="button"
                    onClick={addTicketTier}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    Add Tier
                  </button>
                </div>

                {formData.ticket_tiers.map((tier, index) => (
                  <div key={tier.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">Tier {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTicketTier(tier.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => updateTicketTier(tier.id, 'name', e.target.value)}
                        placeholder="Tier name (e.g., VIP)"
                        className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="number"
                        value={tier.price || ''}
                        onChange={(e) => updateTicketTier(tier.id, 'price', Number(e.target.value))}
                        placeholder="Price"
                        className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="number"
                        value={tier.quantity || ''}
                        onChange={(e) => updateTicketTier(tier.id, 'quantity', Number(e.target.value))}
                        placeholder="Quantity"
                        className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <input
                      type="text"
                      value={tier.description}
                      onChange={(e) => updateTicketTier(tier.id, 'description', e.target.value)}
                      placeholder="Tier description (optional)"
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}

                {formData.ticket_tiers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                    No ticket tiers added. Click "Add Tier" to create one.
                  </p>
                )}
              </div>
            </>
          )}
        </FormSection>

        <FormSection title="Settings" description="Event visibility options">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">Featured Event</span>
          </label>
        </FormSection>

        <FormActions
          cancelHref="/admin/events"
          isLoading={createMutation.isPending}
          submitLabel="Create Event"
        />
      </form>
    </div>
  );
}
