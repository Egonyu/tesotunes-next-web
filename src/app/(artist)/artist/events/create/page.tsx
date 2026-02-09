'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Image as ImageIcon, Calendar, MapPin, DollarSign, Ticket } from 'lucide-react';
import { useCreateEvent, CreateEventRequest } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TicketTier {
  name: string;
  description: string;
  price: number;
  quantity: number;
  max_per_order: number;
  sales_start_date?: string;
  sales_end_date?: string;
}

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
  
  const updateTicketTier = (index: number, field: keyof TicketTier, value: any) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };
  
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
      capacity: capacity ? parseInt(capacity) : undefined,
      image: image || undefined,
      banner_image: bannerImage || undefined,
      ticket_tiers: ticketTiers,
    };
    
    try {
      const result = await createEvent.mutateAsync(eventData);
      toast.success('Event created successfully!');
      router.push(`/artist/events/${result.id}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create event');
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
                      value={tier.price}
                      onChange={(e) => updateTicketTier(index, 'price', parseInt(e.target.value))}
                      placeholder="50000"
                      min="0"
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-background"
                    />
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
