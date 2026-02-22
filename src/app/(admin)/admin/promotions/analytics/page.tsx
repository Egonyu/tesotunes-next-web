"use client";

import { Loader2, BarChart3, ArrowLeft, TrendingUp, Users, CreditCard, AlertTriangle, Megaphone, Star } from "lucide-react";
import Link from "next/link";
import { useAdminAnalytics } from "@/hooks/usePromotions";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface TopPromoter {
  id: number;
  name: string;
  active_promotions: number;
  total_orders: number;
  total_revenue_credits: number;
  avg_rating: number | null;
}

export default function AdminPromotionsAnalyticsPage() {
  const { data: analytics, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/promotions"
          className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Promotions Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Platform-wide promotions performance overview
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Megaphone className="h-4 w-4" />}
          label="Total Promotions"
          value={analytics.total_promotions}
          color="text-primary"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Active Promotions"
          value={analytics.active_promotions}
          color="text-emerald-500"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total Orders"
          value={formatNumber(analytics.total_orders)}
          color="text-blue-500"
        />
        <StatCard
          icon={<CreditCard className="h-4 w-4" />}
          label="GMV (Credits)"
          value={formatNumber(analytics.total_gmv_credits)}
          color="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={<CreditCard className="h-4 w-4" />}
          label="GMV (UGX)"
          value={formatCurrency(analytics.total_gmv_ugx)}
          color="text-green-600"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Dispute Rate"
          value={`${(analytics.dispute_rate * 100).toFixed(1)}%`}
          color={
            analytics.dispute_rate > 0.05
              ? "text-red-500"
              : "text-emerald-500"
          }
        />
      </div>

      {/* Top Promoters */}
      {analytics.top_promoters && analytics.top_promoters.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            Top Promoters
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-muted-foreground font-medium">
                    Promoter
                  </th>
                  <th className="text-right p-2 text-muted-foreground font-medium">
                    Active
                  </th>
                  <th className="text-right p-2 text-muted-foreground font-medium">
                    Orders
                  </th>
                  <th className="text-right p-2 text-muted-foreground font-medium">
                    Revenue
                  </th>
                  <th className="text-right p-2 text-muted-foreground font-medium">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {(analytics.top_promoters as unknown as TopPromoter[]).map(
                  (promoter, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="p-2 font-medium">
                        {promoter.name}
                      </td>
                      <td className="p-2 text-right">
                        {promoter.active_promotions}
                      </td>
                      <td className="p-2 text-right">
                        {formatNumber(promoter.total_orders)}
                      </td>
                      <td className="p-2 text-right">
                        {formatNumber(promoter.total_revenue_credits)} cr
                      </td>
                      <td className="p-2 text-right">
                        {promoter.avg_rating?.toFixed(1) || "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Type Breakdown */}
      {analytics.top_promotion_types && analytics.top_promotion_types.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Breakdown by Type</h2>
          <div className="space-y-3">
            {analytics.top_promotion_types.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between"
              >
                <span className="text-sm capitalize">
                  {item.type?.replace(/_/g, " ")}
                </span>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{item.count} promotions</span>
                  <span>{formatNumber(item.revenue)} credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className={`flex items-center gap-2 text-xs mb-1 ${color}`}>
        {icon}
        <span className="text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
