'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import { Calculator, Loader2 } from 'lucide-react';
import { cn, getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

interface SimulationTierInput {
  name?: string;
  price?: number;
  price_ugx?: number;
  price_credits?: number;
  quantity?: number;
}

interface EventCommissionEstimatorProps {
  endpoint?: string;
  ticketingMode?: 'tesotunes_managed' | 'hybrid' | 'external_only' | 'free_rsvp';
  ticketTiers: SimulationTierInput[];
  organizerUserId?: string | number | null;
  currency?: string;
  className?: string;
}

interface EventCommissionSimulation {
  ticketing_mode: string;
  mode_label: string;
  tesotunes_checkout_enabled: boolean;
  currency: string;
  fee_source: string;
  organizer_plan?: {
    id: number;
    name: string;
    slug?: string;
    tier?: string;
  } | null;
  platform_commission_percent: number;
  processing_fee_percent: number;
  totals: {
    ticket_count: number;
    gross_revenue: number;
    customer_paid_total: number;
    tesotunes_fee_revenue: number;
    platform_commission_amount: number;
    processing_fee_amount: number;
    organizer_net_amount: number;
  };
  items: Array<{
    name: string;
    quantity: number;
    gross_revenue: number;
    tesotunes_fee_revenue: number;
    organizer_net_amount: number;
  }>;
  scenarios: Array<{
    key: string;
    label: string;
    sell_through_percent: number;
    ticket_count: number;
    gross_revenue: number;
    customer_paid_total: number;
    tesotunes_fee_revenue: number;
    organizer_net_amount: number;
  }>;
  upgrade_nudges: Array<{
    plan_id: number;
    name: string;
    slug: string;
    tier?: string | null;
    price_local: number;
    currency: string;
    platform_commission_percent: number;
    processing_fee_percent: number;
    estimated_fee_savings: number;
    estimated_organizer_net: number;
    break_even_revenue?: number | null;
  }>;
  notes: string[];
}

function formatMoney(value: number, currency = 'UGX') {
  return `${currency} ${Math.round(value).toLocaleString()}`;
}

function buildLocalSimulation(
  ticketingMode: NonNullable<EventCommissionEstimatorProps['ticketingMode']>,
  currency: string,
  ticketTiers: Array<{ name: string; price: number; quantity: number }>
): EventCommissionSimulation {
  const modeLabelMap: Record<string, string> = {
    tesotunes_managed: 'Tesotunes managed',
    hybrid: 'Hybrid ticketing',
    external_only: 'External only',
    free_rsvp: 'Free RSVP',
  };

  const items = ticketTiers.map((tier) => {
    const grossRevenue = tier.price * tier.quantity;

    return {
      name: tier.name,
      quantity: tier.quantity,
      gross_revenue: grossRevenue,
      tesotunes_fee_revenue: 0,
      organizer_net_amount: grossRevenue,
    };
  });

  const grossRevenue = items.reduce((sum, item) => sum + item.gross_revenue, 0);
  const ticketCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const scenarioPercents = [25, 50, 75, 100];

  return {
    ticketing_mode: ticketingMode,
    mode_label: modeLabelMap[ticketingMode] ?? 'Ticketing',
    tesotunes_checkout_enabled: !['external_only'].includes(ticketingMode),
    currency,
    fee_source: 'local_planner',
    organizer_plan: null,
    platform_commission_percent: 0,
    processing_fee_percent: 0,
    totals: {
      ticket_count: ticketCount,
      gross_revenue: grossRevenue,
      customer_paid_total: grossRevenue,
      tesotunes_fee_revenue: 0,
      platform_commission_amount: 0,
      processing_fee_amount: 0,
      organizer_net_amount: grossRevenue,
    },
    items,
    scenarios: scenarioPercents.map((percent) => {
      const multiplier = percent / 100;

      return {
        key: `sell-through-${percent}`,
        label: `${percent}% sell-through`,
        sell_through_percent: percent,
        ticket_count: Math.round(ticketCount * multiplier),
        gross_revenue: grossRevenue * multiplier,
        customer_paid_total: grossRevenue * multiplier,
        tesotunes_fee_revenue: 0,
        organizer_net_amount: grossRevenue * multiplier,
      };
    }),
    upgrade_nudges: [],
    notes: [
      'This is a local planning estimate.',
      ticketingMode === 'free_rsvp'
        ? 'Free RSVP events show attendance potential only, with no paid checkout revenue.'
        : 'Server-side fee simulation is unavailable here, so fees are shown as 0 and net matches gross.',
    ],
  };
}

export default function EventCommissionEstimator({
  endpoint,
  ticketingMode = 'tesotunes_managed',
  ticketTiers,
  organizerUserId,
  currency = 'UGX',
  className,
}: EventCommissionEstimatorProps) {
  const [simulation, setSimulation] = useState<EventCommissionSimulation | null>(null);

  const payload = useMemo(() => {
    const normalizedTiers = ticketTiers
      .map((tier, index) => ({
        name: tier.name?.trim() || `Tier ${index + 1}`,
        price: Number(tier.price ?? tier.price_ugx ?? 0),
        price_credits: Number(tier.price_credits ?? 0),
        quantity: Number(tier.quantity ?? 0),
      }))
      .filter((tier) => tier.quantity > 0);

    return {
      organizer_user_id: organizerUserId || undefined,
      ticketing_mode: ticketingMode,
      currency,
      ticket_tiers: normalizedTiers,
    };
  }, [currency, organizerUserId, ticketTiers, ticketingMode]);

  const canSimulate = payload.ticket_tiers.length > 0;
  const localSimulation = useMemo(
    () => buildLocalSimulation(ticketingMode, currency, payload.ticket_tiers),
    [currency, payload.ticket_tiers, ticketingMode]
  );

  const simulationMutation = useMutation({
    mutationFn: () =>
      apiPost<{ data: EventCommissionSimulation; success?: boolean }>(endpoint as string, payload),
    onSuccess: (response) => {
      setSimulation(response.data);
    },
    onError: (error: unknown) => {
      setSimulation(localSimulation);
      toast.error(getErrorMessage(error, 'Server estimate unavailable. Showing local planning estimate instead.'));
    },
  });

  const runEstimate = () => {
    if (!canSimulate) {
      return;
    }

    if (!endpoint) {
      setSimulation(localSimulation);
      return;
    }

    simulationMutation.mutate();
  };

  return (
    <section className={cn('rounded-2xl border bg-card p-5 space-y-4', className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calculator className="h-4 w-4" />
            Commission Simulation
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimate organizer payout, Tesotunes fees, and buyer-paid totals before publishing.
          </p>
        </div>
        <button
          type="button"
          onClick={runEstimate}
          disabled={!canSimulate || simulationMutation.isPending}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            !canSimulate || simulationMutation.isPending
              ? 'cursor-not-allowed bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {simulationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          {simulation ? 'Refresh Estimate' : 'Run Estimate'}
        </button>
      </div>

      {!canSimulate && (
        <div className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Add at least one ticket tier with quantity to simulate fees and payout.
        </div>
      )}

      {simulation && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Gross Revenue</p>
              <p className="mt-2 text-lg font-semibold">{formatMoney(simulation.totals.gross_revenue, simulation.currency)}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Buyer Paid Total</p>
              <p className="mt-2 text-lg font-semibold">{formatMoney(simulation.totals.customer_paid_total, simulation.currency)}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tesotunes Fees</p>
              <p className="mt-2 text-lg font-semibold">{formatMoney(simulation.totals.tesotunes_fee_revenue, simulation.currency)}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Organizer Net</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                {formatMoney(simulation.totals.organizer_net_amount, simulation.currency)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {simulation.mode_label} fee contract
                </p>
                <p className="text-xs text-muted-foreground">
                  Source: {simulation.fee_source.replace(/_/g, ' ')}
                  {simulation.organizer_plan?.name ? ` · Plan: ${simulation.organizer_plan.name}` : ''}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Platform {simulation.platform_commission_percent}% · Processing {simulation.processing_fee_percent}%
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Gross</th>
                  <th className="px-4 py-3 font-medium">Fees</th>
                  <th className="px-4 py-3 font-medium">Organizer Net</th>
                </tr>
              </thead>
              <tbody>
                {simulation.items.map((item) => (
                  <tr key={`${item.name}-${item.quantity}`} className="border-t">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{formatMoney(item.gross_revenue, simulation.currency)}</td>
                    <td className="px-4 py-3">{formatMoney(item.tesotunes_fee_revenue, simulation.currency)}</td>
                    <td className="px-4 py-3">{formatMoney(item.organizer_net_amount, simulation.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {simulation.scenarios.map((scenario) => (
              <div key={scenario.key} className="rounded-xl border p-4">
                <p className="text-sm font-medium">{scenario.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {scenario.ticket_count} tickets projected
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p>Gross: {formatMoney(scenario.gross_revenue, simulation.currency)}</p>
                  <p>Fees: {formatMoney(scenario.tesotunes_fee_revenue, simulation.currency)}</p>
                  <p>Net: {formatMoney(scenario.organizer_net_amount, simulation.currency)}</p>
                </div>
              </div>
            ))}
          </div>

          {simulation.upgrade_nudges.length > 0 && (
            <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Potential package savings</p>
                <p className="text-xs text-muted-foreground">
                  If this event performs as projected, these packages could reduce ticketing fees.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {simulation.upgrade_nudges.map((plan) => (
                  <div key={plan.plan_id} className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-semibold">{plan.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {plan.platform_commission_percent}% platform · {plan.processing_fee_percent}% processing
                    </p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p>Plan price: {formatMoney(plan.price_local, plan.currency)}</p>
                      <p>You could save: {formatMoney(plan.estimated_fee_savings, simulation.currency)}</p>
                      {plan.break_even_revenue ? (
                        <p>Break-even: {formatMoney(plan.break_even_revenue, simulation.currency)} in ticket sales</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {simulation.notes.length > 0 && (
            <div className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
              {simulation.notes.join(' ')}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
