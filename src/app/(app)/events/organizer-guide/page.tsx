import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Organiser guide · Events on TesoTunes',
  description: 'How selling tickets on TesoTunes works: selling options, who pays fees, ticket tiers, sale times, entry rules and tax.',
};

/**
 * The explanations that used to crowd the event form.
 *
 * Each form step links here ("Learn more") so the form itself stays short.
 * Rates are deliberately not written as numbers: they differ per organiser
 * plan and the form shows the organiser's live rates next to the choice.
 */
const sections = [
  {
    id: 'selling',
    title: 'Ways to sell tickets',
    body: [
      ['Sell here', 'Buyers pay with mobile money, wallet or credits on TesoTunes. Tickets have QR codes your staff scan at the gate, and your sales, payouts and attendees are tracked for you.'],
      ['Free RSVP', 'People register for free. You still get an attendee list and check-in, with no payment step.'],
      ['Hybrid', 'Sell on TesoTunes and also through your own outlets or printed tickets. Record outside sales from your event dashboard so capacity stays accurate.'],
      ['Elsewhere', 'Promote the event on TesoTunes but sell somewhere else. No fees apply because nothing is collected here.'],
    ],
  },
  {
    id: 'fees',
    title: 'Who pays the fees',
    body: [
      ['What the fee is', 'Each paid ticket carries a platform commission and a payment processing fee. Your exact rates are shown in the form next to this choice — they can be lower on some organiser plans.'],
      ['Buyer pays (default)', 'Fees are added on top of your ticket price. A buyer sees the full amount on the event page before checkout, and you receive your whole ticket price.'],
      ['I pay', 'Fees are included in your price. Buyers pay exactly the price you set, and the fees are deducted from your payout. Useful when you want round prices like 10,000.'],
      ['Charged once', 'Fees are only ever charged to one side. Payments made with credits carry no fees.'],
    ],
  },
  {
    id: 'tickets',
    title: 'Tickets, limits and sale times',
    body: [
      ['Tiers', 'Create one row per ticket type — Ordinary, VIP, Table. Give each a price and how many exist. You can add tiers or raise quantities later.'],
      ['Tickets that have sold', 'A tier with sales can’t be deleted, and its quantity can’t go below what has sold, so buyers always keep their tickets.'],
      ['Max per order', 'The most tickets one checkout can take from a tier. Keep it low for scarce tiers like VIP so one buyer can’t take them all.'],
      ['Sale times', 'Leave “sales close” blank and a tier sells until your event ends. If you move the event date, blank sale times move with it. Set a date only for things like early-bird pricing.'],
    ],
  },
  {
    id: 'rules',
    title: 'Entry rules',
    body: [
      ['Age limit and door notes', 'Shown on the event page and on tickets, so attendees know before they travel.'],
      ['Refunds', 'Say plainly what happens: for example “No refunds unless the event is cancelled”. If the event is cancelled or moved, tell buyers whether tickets stay valid for the new date.'],
    ],
  },
  {
    id: 'tax',
    title: 'Tax and invoices',
    body: [
      ['Only if you’re registered', 'Fill this in only if your business is registered for tax. Your business name and TIN then appear on buyer invoices.'],
      ['Included or on top', 'Tick “included in price” if your ticket prices already contain tax.'],
    ],
  },
] as const;

export default function OrganizerGuidePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-medium text-primary">Organiser guide</p>
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Selling tickets on TesoTunes</h1>
      <p className="mt-2 text-muted-foreground">Everything behind the event form, in one place.</p>

      <nav className="mt-6 flex flex-wrap gap-2">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted">
            {s.title}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <dl className="mt-3 divide-y rounded-xl border">
              {s.body.map(([term, text]) => (
                <div key={term} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="font-medium">{term}</dt>
                  <dd className="text-sm text-muted-foreground">{text}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-muted/50 p-4 text-sm">
        Ready?{' '}
        <Link href="/artist/events/create" className="font-medium text-primary hover:underline">
          Create an event
        </Link>
      </div>
    </div>
  );
}
