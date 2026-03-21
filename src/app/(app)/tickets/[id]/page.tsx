'use client';

import { use, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Download, Share2, ChevronLeft, Mail, Send, Gift } from 'lucide-react';
import { useResendTicket, useTicket, useTransferTicket } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'text-yellow-500 bg-yellow-500/10',
  confirmed: 'text-green-500 bg-green-500/10',
  attended: 'text-blue-500 bg-blue-500/10',
  cancelled: 'text-red-500 bg-red-500/10',
};

function TicketDetailContent({ ticketId }: { ticketId: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferName, setTransferName] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [transferPhone, setTransferPhone] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const { data: ticket, isLoading } = useTicket(ticketId);
  const resendTicket = useResendTicket(ticketId);
  const transferTicket = useTransferTicket(ticketId);

  const canTransfer = ticket?.status === 'pending' || ticket?.status === 'confirmed';
  const latestTransfer = useMemo(() => {
    const history = ticket?.metadata?.wallet_actions?.transfer_history || [];
    return history.length > 0 ? history[history.length - 1] : null;
  }, [ticket?.metadata?.wallet_actions?.transfer_history]);

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
          title: `Ticket for ${ticket.event?.title || 'Event'}`,
          text: `My ticket for ${ticket.event?.title || 'Event'} on ${ticket.event?.starts_at ? new Date(ticket.event.starts_at).toLocaleDateString() : 'TBA'}`,
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

  const handleCalendarExport = () => {
    if (!ticket?.event?.starts_at) {
      toast.error('This event does not have a calendar-ready start time yet');
      return;
    }

    const startDate = new Date(ticket.event.starts_at);
    const endDate = ticket.event.ends_at
      ? new Date(ticket.event.ends_at)
      : new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tesotunes//Events//EN',
      'BEGIN:VEVENT',
      `UID:ticket-${ticket.id}@tesotunes`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${escapeText(ticket.event.title || 'Tesotunes Event')}`,
      `LOCATION:${escapeText([ticket.event.venue_name, ticket.event.city].filter(Boolean).join(', '))}`,
      `DESCRIPTION:${escapeText(`Ticket ${ticket.ticket_number} for ${ticket.holder_name}`)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tesotunes-ticket-${ticket.ticket_number}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Calendar file downloaded');
  };

  const handleResend = async () => {
    try {
      const result = await resendTicket.mutateAsync();
      toast.success(result.message || 'Ticket email resent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend ticket');
    }
  };

  const handleTransfer = async () => {
    if (!transferName.trim()) {
      toast.error('Add the new ticket holder name');
      return;
    }

    try {
      const result = await transferTicket.mutateAsync({
        holder_name: transferName.trim(),
        holder_email: transferEmail.trim() || undefined,
        holder_phone: transferPhone.trim() || undefined,
        message: transferMessage.trim() || undefined,
      });

      toast.success(result.message || 'Ticket transferred');
      setShowTransferForm(false);
      setTransferMessage('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to transfer ticket');
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

  const resendCount = ticket.metadata?.wallet_actions?.resend_count ?? 0;

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
            src={ticket.event?.artwork || '/images/event-placeholder.jpg'}
            alt={ticket.event?.title || 'Event'}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-1">{ticket.event?.title || 'Event'}</h1>
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
                  {ticket.event?.starts_at
                    ? new Date(ticket.event.starts_at).toLocaleDateString('en', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'TBA'}
                  {ticket.event?.starts_at && (
                    <>{' at '}{new Date(ticket.event.starts_at).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', hour12: true })}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="font-medium">{ticket.event?.venue_name || 'TBA'}</p>
                {ticket.event?.city && (
                  <p className="text-sm text-muted-foreground">{ticket.event.city}</p>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Ticket Info */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium capitalize">{ticket.payment_method || 'N/A'}</p>
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

            {latestTransfer && (
              <div>
                <p className="text-sm text-muted-foreground">Last transfer</p>
                <p className="font-medium">
                  {latestTransfer.to?.name || ticket.holder_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(latestTransfer.transferred_at).toLocaleString('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

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
                onClick={handleCalendarExport}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <Calendar className="h-5 w-5" />
                Add to Calendar
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Share Ticket
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleResend}
                disabled={resendTicket.isPending}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors disabled:opacity-60"
              >
                <Mail className="h-5 w-5" />
                {resendTicket.isPending ? 'Resending...' : 'Resend Ticket Email'}
              </button>
              <button
                onClick={() => {
                  setTransferName(ticket.holder_name || '');
                  setTransferEmail(ticket.holder_email || '');
                  setTransferPhone(ticket.holder_phone || '');
                  setShowTransferForm((value) => !value);
                }}
                disabled={!canTransfer || transferTicket.isPending}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors disabled:opacity-60"
              >
                <Gift className="h-5 w-5" />
                Transfer or Gift Ticket
              </button>
            </div>

            {(resendCount > 0 || ticket.metadata?.wallet_actions?.last_resent_to) && (
              <p className="text-xs text-muted-foreground">
                Resent {resendCount} time{resendCount === 1 ? '' : 's'}
                {ticket.metadata?.wallet_actions?.last_resent_to ? ` to ${ticket.metadata.wallet_actions.last_resent_to}` : ''}
              </p>
            )}
          </div>

          {showTransferForm && (
            <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
              <div>
                <h3 className="font-semibold">Transfer or gift this ticket</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This updates the ticket holder details and can resend the confirmation to the new email.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={transferName}
                  onChange={(e) => setTransferName(e.target.value)}
                  placeholder="New holder name"
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
                />
                <input
                  type="email"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  placeholder="New holder email"
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
                />
                <input
                  type="tel"
                  value={transferPhone}
                  onChange={(e) => setTransferPhone(e.target.value)}
                  placeholder="New holder phone"
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm sm:col-span-2"
                />
                <textarea
                  value={transferMessage}
                  onChange={(e) => setTransferMessage(e.target.value)}
                  placeholder="Optional gift message"
                  rows={3}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm sm:col-span-2"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleTransfer}
                  disabled={transferTicket.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {transferTicket.isPending ? 'Updating Ticket...' : 'Confirm Transfer'}
                </button>
                <button
                  onClick={() => setShowTransferForm(false)}
                  className="px-6 py-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Important Note */}
          {ticket.status === 'confirmed' && (
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
