'use client';

import { use, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Download, Share2, ChevronLeft, QrCode as QrIcon } from 'lucide-react';
import { useTicket } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  valid: 'text-green-500 bg-green-500/10',
  used: 'text-gray-500 bg-gray-500/10',
  cancelled: 'text-red-500 bg-red-500/10',
  expired: 'text-orange-500 bg-orange-500/10',
};

function TicketDetailContent({ ticketId }: { ticketId: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const { data: ticket, isLoading } = useTicket(ticketId);
  
  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `ticket-${ticket?.ticket_number}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success('QR code downloaded');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };
  
  const handleShare = async () => {
    if (!ticket) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${ticket.event.title}`,
          text: `My ticket for ${ticket.event.title} on ${new Date(ticket.event.date).toLocaleDateString()}`,
          url: window.location.href,
        });
        toast.success('Shared successfully');
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8 max-w-2xl space-y-8">
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }
  
  if (!ticket) {
    return (
      <div className="container py-8 max-w-2xl">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Ticket not found</p>
          <Link href="/tickets" className="text-primary hover:underline mt-4 inline-block">
            View all tickets
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-2xl">
      {/* Back Link */}
      <Link 
        href="/tickets"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to tickets
      </Link>
      
      {/* Ticket Card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Event Banner */}
        <div className="relative h-48 bg-linear-to-br from-primary/20 to-primary/5">
          <Image
            src={ticket.event.banner_image || ticket.event.image || '/images/event-placeholder.jpg'}
            alt={ticket.event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-1">{ticket.event.title}</h1>
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-sm font-medium capitalize',
                statusColors[ticket.status]
              )}
            >
              {ticket.status}
            </span>
          </div>
        </div>
        
        {/* Ticket Details */}
        <div className="p-6 space-y-6">
          {/* Event Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {new Date(ticket.event.date).toLocaleDateString('en', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' at '}{ticket.event.time}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="font-medium">{ticket.event.venue}</p>
                <p className="text-sm text-muted-foreground">{ticket.event.location}</p>
              </div>
            </div>
          </div>
          
          <div className="h-px bg-border" />
          
          {/* Ticket Info */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Type</p>
              <p className="font-medium">{ticket.ticket_tier.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Ticket Number</p>
              <p className="font-mono font-medium">{ticket.ticket_number}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Holder</p>
              <p className="font-medium">{ticket.holder_name}</p>
              <p className="text-sm text-muted-foreground">{ticket.holder_email}</p>
            </div>
            
            {ticket.checked_in_at && (
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="font-medium text-green-500">
                  {new Date(ticket.checked_in_at).toLocaleString('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
          
          <div className="h-px bg-border" />
          
          {/* QR Code */}
          <div className="text-center space-y-4">
            <div className="inline-flex flex-col items-center gap-2">
              <p className="text-sm font-medium">Show this QR code at the entrance</p>
              <div 
                ref={qrRef}
                className="p-4 bg-white rounded-lg"
              >
                <QRCodeSVG
                  value={ticket.qr_code || ticket.ticket_number}
                  size={256}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ticket ID: {ticket.ticket_number}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadQR}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <Download className="h-5 w-5" />
                Download QR Code
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Share Ticket
              </button>
            </div>
          </div>
          
          {/* Important Note */}
          {ticket.status === 'valid' && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-center">
                <strong>Important:</strong> This ticket is valid for one entry only. Do not share this QR code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  return <TicketDetailContent ticketId={id} />;
}
