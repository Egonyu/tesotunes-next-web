'use client';

import { use, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Download, Share2, ChevronLeft, Mail, Send, Gift, Smartphone, ShieldAlert, BadgeDollarSign } from 'lucide-react';
import { useRequestTicketCase, useResendTicket, useTicket, useTicketCases, useTransferTicket } from '@/hooks/useEvents';
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
  const [caseType, setCaseType] = useState<'refund_request' | 'payment_dispute'>('refund_request');
  const [disputeCategory, setDisputeCategory] = useState('payment_not_confirmed');
  const [caseReason, setCaseReason] = useState('');
  const [gatewayReference, setGatewayReference] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [requestedRefundAmount, setRequestedRefundAmount] = useState('');
  const { data: ticket, isLoading } = useTicket(ticketId);
  const { data: ticketCases = [] } = useTicketCases(ticketId);
  const resendTicket = useResendTicket(ticketId);
  const transferTicket = useTransferTicket(ticketId);
  const requestTicketCase = useRequestTicketCase(ticketId);

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

  const handleDownloadPassCard = () => {
    if (!ticket || !qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrImage = new window.Image();

    canvas.width = 1200;
    canvas.height = 1800;

    qrImage.onload = () => {
      if (!ctx) return;

      ctx.fillStyle = '#f5efe3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 460);
      gradient.addColorStop(0, '#16324f');
      gradient.addColorStop(1, '#27667b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 460);

      ctx.fillStyle = '#fff7ed';
      ctx.font = '700 64px Georgia';
      ctx.fillText(ticket.event?.title || 'Tesotunes Event', 72, 120);

      ctx.font = '400 28px Arial';
      ctx.fillStyle = '#dbeafe';
      ctx.fillText('Tesotunes Mobile Ticket', 72, 174);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 30px Arial';
      ctx.fillText(ticket.status.toUpperCase(), 72, 240);

      ctx.fillStyle = '#102a43';
      ctx.fillRect(48, 392, canvas.width - 96, canvas.height - 440);

      ctx.fillStyle = '#fffdf8';
      ctx.fillRect(64, 408, canvas.width - 128, canvas.height - 472);

      ctx.fillStyle = '#5b4636';
      ctx.font = '600 24px Arial';
      ctx.fillText('Holder', 108, 500);
      ctx.font = '700 42px Arial';
      ctx.fillStyle = '#111827';
      ctx.fillText(ticket.holder_name || 'Ticket Holder', 108, 552);

      ctx.font = '600 24px Arial';
      ctx.fillStyle = '#5b4636';
      ctx.fillText('Ticket Number', 108, 648);
      ctx.font = '700 36px Courier New';
      ctx.fillStyle = '#111827';
      ctx.fillText(ticket.ticket_number, 108, 696);

      ctx.font = '600 24px Arial';
      ctx.fillStyle = '#5b4636';
      ctx.fillText('Date & Time', 108, 792);
      ctx.font = '700 34px Arial';
      ctx.fillStyle = '#111827';
      const eventDateText = ticket.event?.starts_at
        ? `${new Date(ticket.event.starts_at).toLocaleDateString('en', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })} • ${new Date(ticket.event.starts_at).toLocaleTimeString('en', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}`
        : 'To be announced';
      ctx.fillText(eventDateText, 108, 840);

      ctx.font = '600 24px Arial';
      ctx.fillStyle = '#5b4636';
      ctx.fillText('Venue', 108, 936);
      ctx.font = '700 34px Arial';
      ctx.fillStyle = '#111827';
      const venueText = [ticket.event?.venue_name, ticket.event?.city].filter(Boolean).join(', ') || 'Venue pending';
      ctx.fillText(venueText, 108, 984);

      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(108, 1060, canvas.width - 216, 566);
      ctx.drawImage(qrImage, 300, 1120, 600, 600);

      ctx.fillStyle = '#6b7280';
      ctx.font = '500 26px Arial';
      ctx.fillText('Show this pass or QR code at the entrance.', 300, 1710);

      const downloadLink = document.createElement('a');
      downloadLink.download = `tesotunes-ticket-pass-${ticket.ticket_number}.png`;
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.click();

      toast.success('Phone-ready ticket pass downloaded');
    };

    qrImage.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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

  const handleWhatsAppShare = () => {
    if (!ticket) return;

    const message = [
      `Tesotunes ticket for ${ticket.event?.title || 'Event'}`,
      ticket.event?.starts_at
        ? `Date: ${new Date(ticket.event.starts_at).toLocaleString('en', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}`
        : 'Date: TBA',
      `Ticket: ${ticket.ticket_number}`,
      `Holder: ${ticket.holder_name}`,
      window.location.href,
    ]
      .filter(Boolean)
      .join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
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
  const openTicketCase = ticketCases.find((item) => item.status === 'open');

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
            <div className="rounded-xl border bg-muted/30 p-4 text-left">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Add To Phone</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Apple Wallet and Google Wallet need issuer accounts and certificates on the Tesotunes side. For now, the safest real-world flow is to save the phone-ready pass image, keep the calendar entry, and resend or share the ticket directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadPassCard}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <Smartphone className="h-5 w-5" />
                Save Ticket Pass
              </button>
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
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border bg-background hover:bg-muted transition-colors"
              >
                <Send className="h-5 w-5" />
                Send on WhatsApp
              </button>
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

          <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-500/10 p-2 text-amber-600 dark:text-amber-300">
                {caseType === 'refund_request' ? <BadgeDollarSign className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
              </div>
              <div>
                <h3 className="font-semibold">Ticket Support</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use this if you need organizer help with a refund review or a payment problem. Physical and offline ticket buyers will be handled in the later reconciliation workflow.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value as 'refund_request' | 'payment_dispute')}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
              >
                <option value="refund_request">Request refund review</option>
                <option value="payment_dispute">Report payment issue</option>
              </select>
              {caseType === 'payment_dispute' && (
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
                >
                  <option value="payment_not_confirmed">Payment not confirmed</option>
                  <option value="charged_twice">Charged twice</option>
                  <option value="wrong_amount">Wrong amount charged</option>
                  <option value="ticket_not_received">Ticket not received</option>
                  <option value="chargeback_notice">Chargeback notice</option>
                </select>
              )}
              <input
                type="number"
                min="0"
                step="1"
                value={requestedRefundAmount}
                onChange={(e) => setRequestedRefundAmount(e.target.value)}
                placeholder="Requested refund amount (UGX)"
                disabled={caseType !== 'refund_request'}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm disabled:opacity-50"
              />
              {caseType === 'payment_dispute' && (
                <>
                  <input
                    type="text"
                    value={gatewayReference}
                    onChange={(e) => setGatewayReference(e.target.value)}
                    placeholder="Payment reference / transaction ID"
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
                  />
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="Evidence link (optional)"
                    className="w-full rounded-lg border bg-background px-4 py-3 text-sm"
                  />
                </>
              )}
              <textarea
                value={caseReason}
                onChange={(e) => setCaseReason(e.target.value)}
                placeholder={caseType === 'refund_request'
                  ? 'Tell the organizer why you need a refund review.'
                  : 'Describe the payment problem clearly so support can investigate.'}
                rows={4}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm sm:col-span-2"
              />
              {caseType === 'payment_dispute' && (
                <textarea
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Extra payment evidence notes for finance review"
                  rows={3}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm sm:col-span-2"
                />
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {openTicketCase
                  ? `Open case: ${openTicketCase.case_type === 'refund_request' ? 'Refund review' : 'Payment issue'} submitted ${openTicketCase.created_at ? new Date(openTicketCase.created_at).toLocaleString('en') : 'recently'}.`
                  : 'No open ticket support request yet.'}
              </p>
              <button
                onClick={async () => {
                  if (caseReason.trim().length < 10) {
                    toast.error('Add a clearer reason so support can review it');
                    return;
                  }

                  try {
                    const result = await requestTicketCase.mutateAsync({
                      case_type: caseType,
                      dispute_category: caseType === 'payment_dispute' ? disputeCategory : undefined,
                      reason: caseReason.trim(),
                      gateway_reference: caseType === 'payment_dispute' ? gatewayReference.trim() || undefined : undefined,
                      evidence_url: caseType === 'payment_dispute' ? evidenceUrl.trim() || undefined : undefined,
                      evidence_notes: caseType === 'payment_dispute' ? evidenceNotes.trim() || undefined : undefined,
                      requested_refund_amount: caseType === 'refund_request' && requestedRefundAmount ? Number(requestedRefundAmount) : undefined,
                    });
                    toast.success(result.message || 'Support request submitted');
                    setCaseReason('');
                    if (caseType === 'refund_request') {
                      setRequestedRefundAmount('');
                    } else {
                      setGatewayReference('');
                      setEvidenceUrl('');
                      setEvidenceNotes('');
                    }
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Failed to submit support request');
                  }
                }}
                disabled={requestTicketCase.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {requestTicketCase.isPending ? 'Submitting...' : 'Submit Support Request'}
              </button>
            </div>

            {ticketCases.length > 0 && (
              <div className="space-y-3 pt-2">
                {ticketCases.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-background p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.case_type === 'refund_request' ? 'Refund review' : 'Payment issue'}
                        </span>
                        <span className="rounded-full border px-2 py-0.5 text-xs capitalize">{item.status}</span>
                        {item.case_type === 'payment_dispute' && item.escalation_status === 'review' && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                            Finance review
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.created_at ? new Date(item.created_at).toLocaleString('en') : ''}
                      </span>
                    </div>
                    <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{item.reason}</p>
                    {item.case_type === 'payment_dispute' && (
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {item.dispute_category && <p>Category: {item.dispute_category.replaceAll('_', ' ')}</p>}
                        {item.gateway_reference && <p>Reference: {item.gateway_reference}</p>}
                        {item.evidence_url && <p>Evidence: {item.evidence_url}</p>}
                        {item.evidence_notes && <p>Evidence notes: {item.evidence_notes}</p>}
                      </div>
                    )}
                    {item.resolution_notes && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Resolution: {item.resolution_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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
