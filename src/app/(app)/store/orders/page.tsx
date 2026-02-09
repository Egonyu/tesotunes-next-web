"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, Search } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Order {
  id: number;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items_count: number;
  items: {
    id: number;
    product: {
      title: string;
      image_url: string | null;
    };
    quantity: number;
    price: number;
  }[];
  created_at: string;
  shipping_address: {
    city: string;
    district: string;
  };
}

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Pending" },
  processing: { icon: Package, color: "text-blue-500", bg: "bg-blue-500/10", label: "Processing" },
  shipped: { icon: Truck, color: "text-purple-500", bg: "bg-purple-500/10", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Cancelled" },
};

export default function OrdersPage() {
  const [filter, setFilter] = useState<string>("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", filter],
    queryFn: () =>
      apiGet<Order[]>(`/store/orders${filter !== "all" ? `?status=${filter}` : ""}`),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
        <Link
          href="/store"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {status === "all" ? "All Orders" : status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {!orders?.length ? (
        <div className="text-center py-16 bg-card rounded-lg border">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to see your orders here
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            return (
              <Link
                key={order.id}
                href={`/store/orders/${order.order_number}`}
                className="block bg-card rounded-lg border p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div
                        key={item.id}
                        className="relative w-16 h-16 rounded-lg border-2 border-background bg-muted overflow-hidden"
                        style={{ zIndex: 3 - i }}
                      >
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="relative w-16 h-16 rounded-lg border-2 border-background bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                    </p>
                    <p className="font-medium truncate">
                      {order.items.map((i) => i.product.title).join(", ")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_address.city}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
