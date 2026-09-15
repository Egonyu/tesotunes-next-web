import { redirect } from 'next/navigation';

/**
 * Retired ticket purchase page.
 *
 * Nothing linked here any more — the event page sends buyers to /checkout —
 * but the page still worked if reached directly, and it priced tickets with a
 * flat 5% fee it made up in the browser. The backend charges commission plus
 * processing (12.9% by default, per-organiser), so this page quoted less than
 * people paid. Old links land on the event page, where tickets are chosen and
 * checkout uses the backend's own quote.
 */
export default async function RetiredTicketsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/events/${encodeURIComponent(id)}`);
}
