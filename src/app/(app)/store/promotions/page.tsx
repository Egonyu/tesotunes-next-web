"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Tag, Clock, Percent, Gift, ArrowRight, Copy, CheckCircle, Package } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Promotion {
  id: number;
  title: string;
  description: string;
  code?: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  minimum_order?: number;
  maximum_discount?: number;
  image_url?: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  products?: {
    id: number;
    title: string;
    slug: string;
    image_url: string | null;
    price: number;
    original_price: number;
  }[];
}

function PromotionCard({ promotion }: { promotion: Promotion }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (promotion.code) {
      navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDiscountText = () => {
    switch (promotion.discount_type) {
      case "percentage":
        return `${promotion.discount_value}% OFF`;
      case "fixed":
        return `${formatCurrency(promotion.discount_value)} OFF`;
      case "free_shipping":
        return "Free Shipping";
    }
  };

  const endsAt = new Date(promotion.ends_at);
  const now = new Date();
  const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isEndingSoon = daysLeft <= 3 && daysLeft > 0;

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="relative h-32 bg-linear-to-r from-primary to-primary/60 flex items-center justify-center">
        {promotion.image_url ? (
          <Image
            src={promotion.image_url}
            alt={promotion.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="text-center text-white">
            <div className="text-4xl font-bold">{getDiscountText()}</div>
          </div>
        )}

        {isEndingSoon && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{promotion.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {promotion.description}
        </p>

        {/* Promo Code */}
        {promotion.code && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-muted rounded-lg px-4 py-2 font-mono text-center border-2 border-dashed">
              {promotion.code}
            </div>
            <button
              onClick={copyCode}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          {promotion.minimum_order && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Min. order: {formatCurrency(promotion.minimum_order)}
            </div>
          )}
          {promotion.maximum_discount && promotion.discount_type === "percentage" && (
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Max discount: {formatCurrency(promotion.maximum_discount)}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Valid until {formatDate(promotion.ends_at)}
          </div>
        </div>

        {/* Featured Products */}
        {promotion.products && promotion.products.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Featured Products</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {promotion.products.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/store/products/${product.slug}`}
                  className="flex-shrink-0 w-16"
                >
                  <div className="relative aspect-square bg-muted rounded overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </Link>
              ))}
              {promotion.products.length > 4 && (
                <div className="flex-shrink-0 w-16 aspect-square bg-muted rounded flex items-center justify-center text-sm font-medium">
                  +{promotion.products.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        <Link
          href={`/store?promo=${promotion.code || promotion.id}`}
          className="flex items-center justify-center gap-2 w-full py-2 mt-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Shop Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const { data: promotions, isLoading } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => apiGet<Promotion[]>("/store/promotions"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activePromotions = promotions?.filter((p) => p.is_active) || [];
  const upcomingPromotions = promotions?.filter((p) => new Date(p.starts_at) > new Date()) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Gift className="h-5 w-5" />
          Special Offers
        </div>
        <h1 className="text-4xl font-bold mb-2">Promotions & Deals</h1>
        <p className="text-muted-foreground text-lg">
          Save big on your favorite products
        </p>
      </div>

      {/* Active Promotions */}
      {activePromotions.length > 0 ? (
        <>
          <h2 className="text-2xl font-bold mb-6">Active Promotions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {activePromotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border mb-12">
          <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No Active Promotions</h2>
          <p className="text-muted-foreground mb-6">
            Check back soon for new deals and discounts
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Browse Store
          </Link>
        </div>
      )}

      {/* Upcoming Promotions */}
      {upcomingPromotions.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-6">Coming Soon</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingPromotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-card rounded-lg border overflow-hidden opacity-75"
              >
                <div className="relative h-32 bg-linear-to-r from-muted to-muted/60 flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Starts {formatDate(promo.starts_at)}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1">{promo.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {promo.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Newsletter */}
      <div className="mt-12 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold mb-2">Don't Miss Out!</h3>
        <p className="text-muted-foreground mb-6">
          Subscribe to get notified about new promotions and exclusive deals
        </p>
        <div className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg border bg-background"
          />
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
