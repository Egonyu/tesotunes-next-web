'use client';

import { use, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  Minus, 
  Plus,
  CreditCard,
  Smartphone,
  Ticket,
  Shield,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvent, usePurchaseTickets, PurchaseTicketRequest } from '@/hooks/useEvents';
import { useValidatePhone } from '@/hooks/usePayments';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface TicketTier {
  id: number;
  name: string;
  price: number;
  description: string;
  available: number;
  max_per_order: number;
}

function TicketPurchaseContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedTier = searchParams.get('tier');
  
  const [selectedTier, setSelectedTier] = useState<number | null>(
    preselectedTier ? parseInt(preselectedTier) : null
  );
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mtn_momo' | 'airtel_money'>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const { data: event, isLoading } = useEvent(eventId);
  const purchaseTickets = usePurchaseTickets();
  const validatePhone = useValidatePhone();
  
  const selectedTicket = event?.ticket_tiers?.find(t => t.id === selectedTier);
  const subtotal = selectedTicket ? selectedTicket.price * quantity : 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;
  
  const handlePurchase = async () => {
    if (!selectedTicket || !session?.user) {
      toast.error('Please log in to purchase tickets');
      return;
    }
    
    // Validate phone for mobile money
    if (paymentMethod !== 'wallet' && !phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }
    
    // Validate phone number format
    if (paymentMethod !== 'wallet') {
      try {
        const validation = await validatePhone.mutateAsync(phoneNumber);
        if (!validation.valid) {
          toast.error('Invalid phone number format');
          return;
        }
      } catch (error) {
        toast.error('Failed to validate phone number');
        return;
      }
    }
    
    const purchaseData: PurchaseTicketRequest = {
      event_id: parseInt(eventId),
      ticket_tier_id: selectedTicket.id,
      quantity,
      payment_method: paymentMethod,
      phone: paymentMethod !== 'wallet' ? phoneNumber : undefined,
      holder_name: session.user.name || '',
      holder_email: session.user.email || '',
      holder_phone: phoneNumber || undefined,
    };
    
    try {
      const result = await purchaseTickets.mutateAsync(purchaseData);
      toast.success(result.message || 'Tickets purchased successfully!');
      
      // Redirect to tickets page
      setTimeout(() => {
        router.push('/tickets');
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to purchase tickets');
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl space-y-8">
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Event not found</p>
          <Link href="/events" className="text-primary hover:underline mt-4 inline-block">
            Browse all events
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      {/* Back Link */}
      <Link 
        href={`/events/${eventId}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to event
      </Link>
      
      {/* Event Summary */}
      <div className="flex gap-4 p-4 rounded-xl border bg-card mb-8">
        <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={event.image || '/images/event-placeholder.jpg'}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(event.date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {event.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Ticket Selection */}
        <div className="lg:col-span-3 space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-4">Select Ticket Type</h2>
            <div className="space-y-3">
              {event.ticket_tiers?.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => tier.available > 0 && setSelectedTier(tier.id)}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all',
                    tier.available === 0 && 'opacity-50 cursor-not-allowed',
                    selectedTier === tier.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-foreground'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        selectedTier === tier.id ? 'border-primary' : 'border-muted-foreground'
                      )}>
                        {selectedTier === tier.id && (
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tier.name}</p>
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">UGX {tier.price.toLocaleString()}</p>
                      {tier.available === 0 ? (
                        <span className="text-xs text-red-500">Sold out</span>
                      ) : tier.available < 50 ? (
                        <span className="text-xs text-orange-500">{tier.available} left</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Quantity */}
          {selectedTicket && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Quantity</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-3 font-medium min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedTicket.max_per_order, quantity + 1))}
                    className="p-3 hover:bg-muted"
                    disabled={quantity >= selectedTicket.max_per_order}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Max {selectedTicket.max_per_order} per order
                </span>
              </div>
            </section>
          )}
          
          {/* Payment Method */}
          {selectedTicket && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {/* Wallet */}
                <div
                  onClick={() => setPaymentMethod('wallet')}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all',
                    paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'hover:border-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">TesoWallet</p>
                      <p className="text-sm text-muted-foreground">Pay with your wallet balance</p>
                    </div>
                  </div>
                </div>
                
                {/* MTN MoMo */}
                <div
                  onClick={() => setPaymentMethod('mtn_momo')}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all',
                    paymentMethod === 'mtn_momo' ? 'border-primary bg-primary/5' : 'hover:border-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#FFCC00] flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <p className="font-medium">MTN Mobile Money</p>
                      <p className="text-sm text-muted-foreground">Pay with your MTN MoMo account</p>
                    </div>
                  </div>
                </div>
                
                {/* Airtel Money */}
                <div
                  onClick={() => setPaymentMethod('airtel_money')}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all',
                    paymentMethod === 'airtel_money' ? 'border-primary bg-primary/5' : 'hover:border-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#E40000] flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Airtel Money</p>
                      <p className="text-sm text-muted-foreground">Pay with your Airtel Money account</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Phone Number Input for Mobile Money */}
              {paymentMethod !== 'wallet' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    {paymentMethod === 'mtn_momo' ? 'MTN' : 'Airtel'} Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={paymentMethod === 'mtn_momo' ? '0770 000 000' : '0750 000 000'}
                    className="w-full px-4 py-3 rounded-lg border bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You will receive a payment prompt on your phone
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 p-6 rounded-xl border bg-card">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{selectedTicket.name} x {quantity}</span>
                  <span>UGX {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Service Fee</span>
                  <span>UGX {serviceFee.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t flex justify-between font-bold">
                  <span>Total</span>
                  <span>UGX {total.toLocaleString()}</span>
                </div>
                
                <button
                  onClick={handlePurchase}
                  disabled={purchaseTickets.isPending || (paymentMethod !== 'wallet' && !phoneNumber)}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors',
                    purchaseTickets.isPending || (paymentMethod !== 'wallet' && !phoneNumber)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {purchaseTickets.isPending ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Ticket className="h-5 w-5" />
                      Complete Purchase
                    </>
                  )}
                </button>
                
                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Secure payment powered by ZengaPay
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a ticket type to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  return (
    <Suspense fallback={
      <div className="container py-8 max-w-4xl space-y-8">
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    }>
      <TicketPurchaseContent eventId={id} />
    </Suspense>
  );
}
