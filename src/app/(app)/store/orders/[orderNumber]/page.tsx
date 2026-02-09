"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MapPin,
  CreditCard,
  Download,
  MessageSquare,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderDetail {
  id: number;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  items: {
    id: number;
    product: {
      id: number;
      title: string;
      slug: string;
      image_url: string | null;
    };
    quantity: number;
    price: number;
    total: number;
  }[];
  shipping_address: {
    label: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    district: string;
    phone: string;
  };
  payment_method: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  timeline: {
    status: string;
    date: string;
    description: string;
  }[];
}

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500", label: "Pending" },
  processing: { icon: Package, color: "text-blue-500", bg: "bg-blue-500", label: "Processing" },
  shipped: { icon: Truck, color: "text-purple-500", bg: "bg-purple-500", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500", label: "Cancelled" },
};

const statusOrder = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => apiGet<OrderDetail>(`/store/orders/${orderNumber}`),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find an order with number #{orderNumber}
        </p>
        <Link href="/store/orders" className="text-primary hover:underline">
          View All Orders
        </Link>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const currentStatusIndex = statusOrder.indexOf(order.status);

  return (
    <div className="container mx-auto py-8 px-4">
      <Link
        href="/store/orders"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
            <Download className="h-4 w-4" />
            Invoice
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
            <MessageSquare className="h-4 w-4" />
            Help
          </button>
        </div>
      </div>

      {/* Status Progress */}
      {order.status !== "cancelled" && (
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${config.bg}/10`}>
                <config.icon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <p className="font-bold text-lg">{config.label}</p>
                {order.estimated_delivery && order.status !== "delivered" && (
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery: {formatDate(order.estimated_delivery)}
                  </p>
                )}
                {order.delivered_at && (
                  <p className="text-sm text-green-500">
                    Delivered on {formatDate(order.delivered_at)}
                  </p>
                )}
              </div>
            </div>
            {order.tracking_number && (
              <a
                href={order.tracking_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Track Package: {order.tracking_number}
              </a>
            )}
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex justify-between">
              {statusOrder.map((status, index) => {
                const stepConfig = statusConfig[status as keyof typeof statusConfig];
                const isActive = index <= currentStatusIndex;
                return (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        isActive ? stepConfig.bg : "bg-muted"
                      }`}
                    >
                      <stepConfig.icon
                        className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`}
                      />
                    </div>
                    <span
                      className={`text-xs mt-2 capitalize ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-0">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(currentStatusIndex / (statusOrder.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Notice */}
      {order.status === "cancelled" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="h-6 w-6 text-red-500" />
            <p className="font-bold text-red-500">Order Cancelled</p>
          </div>
          {order.cancellation_reason && (
            <p className="text-muted-foreground">Reason: {order.cancellation_reason}</p>
          )}
          {order.cancelled_at && (
            <p className="text-sm text-muted-foreground mt-2">
              Cancelled on {formatDate(order.cancelled_at)}
            </p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-bold">Order Items ({order.items.length})</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/products/${item.product.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-bold">{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="bg-card rounded-lg border p-4">
              <h2 className="font-bold mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      {index < order.timeline.length - 1 && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-full bg-muted" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium capitalize">{event.status}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          {/* Shipping Address */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-bold">Shipping Address</h3>
            </div>
            <div className="text-sm">
              <p className="font-medium">{order.shipping_address.label}</p>
              <p className="text-muted-foreground">
                {order.shipping_address.address_line_1}
              </p>
              {order.shipping_address.address_line_2 && (
                <p className="text-muted-foreground">
                  {order.shipping_address.address_line_2}
                </p>
              )}
              <p className="text-muted-foreground">
                {order.shipping_address.city}, {order.shipping_address.district}
              </p>
              <p className="text-muted-foreground">{order.shipping_address.phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-bold">Payment Method</h3>
            </div>
            <p className="text-sm text-muted-foreground">{order.payment_method}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping_fee > 0 ? formatCurrency(order.shipping_fee) : "Free"}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-bold mb-2">Order Notes</h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          {order.status === "delivered" && (
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Buy Again
            </button>
          )}
          {order.status === "pending" && (
            <button className="w-full py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
