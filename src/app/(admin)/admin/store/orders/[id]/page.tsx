'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, Truck, CheckCircle, XCircle, Clock, CreditCard,
  MapPin, Phone, Mail, User, Calendar, RefreshCw, RotateCcw,
  Printer, Download
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog, FormField } from '@/components/admin';

interface OrderItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
  quantity: number;
  unit_price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  shipping_address: {
    name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  billing_address?: {
    name: string;
    address_line_1: string;
    city: string;
    country: string;
  };
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

interface OrderHistory {
  id: string;
  status: string;
  note: string;
  created_at: string;
  user: { name: string };
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'order', id],
    queryFn: () => apiGet<{ data: Order }>(`/admin/store/orders/${id}`),
  });

  const { data: historyData } = useQuery({
    queryKey: ['admin', 'store', 'order', id, 'history'],
    queryFn: () => apiGet<{ data: OrderHistory[] }>(`/admin/store/orders/${id}/history`),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: string; note?: string; tracking_number?: string }) =>
      apiPost(`/admin/store/orders/${id}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'orders'] });
      setShowStatusDialog(false);
      setNewStatus('');
      setStatusNote('');
      setTrackingNumber('');
    },
  });

  const refundMutation = useMutation({
    mutationFn: () => apiPost(`/admin/store/orders/${id}/refund`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'order', id] });
      setShowRefundDialog(false);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'processing': return <RefreshCw className="h-5 w-5" />;
      case 'shipped': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      case 'refunded': return <RotateCcw className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order?.data) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Link href="/admin/store/orders" className="text-primary hover:underline mt-2 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const o = order.data;

  const handleQuickStatus = (status: string) => {
    if (status === 'shipped') {
      setNewStatus(status);
      setShowStatusDialog(true);
    } else {
      updateStatusMutation.mutate({ status });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${o.order_number}`}
        description={`Placed on ${new Date(o.created_at).toLocaleDateString()}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Store', href: '/admin/store' },
          { label: 'Orders', href: '/admin/store/orders' },
          { label: `#${o.order_number}` },
        ]}
        backHref="/admin/store/orders"
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
              <Download className="h-4 w-4" />
              Invoice
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Bar */}
          <div className="border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {getStatusIcon(o.status)}
                <div>
                  <StatusBadge status={o.status} className="text-sm" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Last updated {new Date(o.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <StatusBadge status={o.payment_status} />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {o.status === 'pending' && (
                <button
                  onClick={() => handleQuickStatus('processing')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Processing
                </button>
              )}
              {o.status === 'processing' && (
                <button
                  onClick={() => handleQuickStatus('shipped')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Shipped
                </button>
              )}
              {o.status === 'shipped' && (
                <button
                  onClick={() => handleQuickStatus('delivered')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Delivered
                </button>
              )}
              {!['cancelled', 'refunded', 'delivered'].includes(o.status) && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
              {o.payment_status === 'paid' && !['refunded'].includes(o.status) && (
                <button
                  onClick={() => setShowRefundDialog(true)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted"
                >
                  Issue Refund
                </button>
              )}
            </div>

            {o.tracking_number && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-mono font-medium">{o.tracking_number}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Order Items ({o.items.length})</h3>
            </div>
            <div className="divide-y">
              {o.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 m-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/store/products/${item.product_id}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × UGX {item.unit_price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">UGX {item.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>UGX {o.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>UGX {o.shipping_cost.toLocaleString()}</span>
              </div>
              {o.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>UGX {o.tax.toLocaleString()}</span>
                </div>
              )}
              {o.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-UGX {o.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>UGX {o.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="border rounded-xl p-6 bg-card">
            <h3 className="font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {historyData?.data?.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-primary mt-1.5" />
                    {index < (historyData.data?.length || 0) - 1 && (
                      <div className="absolute top-4 left-1.5 w-0.5 h-full -ml-px bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={event.status} />
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    {event.note && (
                      <p className="text-sm text-muted-foreground mt-1">{event.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">by {event.user.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="font-semibold">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Link 
                    href={`/admin/users/${o.customer.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {o.customer.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${o.customer.email}`} className="text-sm hover:text-primary">
                  {o.customer.email}
                </a>
              </div>
              {o.customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${o.customer.phone}`} className="text-sm hover:text-primary">
                    {o.customer.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{o.shipping_address.name}</p>
              <p>{o.shipping_address.address_line_1}</p>
              {o.shipping_address.address_line_2 && <p>{o.shipping_address.address_line_2}</p>}
              <p>
                {o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.postal_code}
              </p>
              <p>{o.shipping_address.country}</p>
              {o.shipping_address.phone && <p className="pt-2">{o.shipping_address.phone}</p>}
            </div>
          </div>

          {/* Payment Info */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">{o.payment_method.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={o.payment_status} />
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {o.notes && (
            <div className="border rounded-xl p-6 bg-card space-y-4">
              <h3 className="font-semibold">Order Notes</h3>
              <p className="text-sm text-muted-foreground">{o.notes}</p>
            </div>
          )}

          {/* Dates */}
          <div className="border rounded-xl p-6 bg-card space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ordered
              </span>
              <span>{new Date(o.created_at).toLocaleDateString()}</span>
            </div>
            {o.shipped_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipped</span>
                <span>{new Date(o.shipped_at).toLocaleDateString()}</span>
              </div>
            )}
            {o.delivered_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivered</span>
                <span>{new Date(o.delivered_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Dialog */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={() => updateStatusMutation.mutate({
          status: newStatus,
          note: statusNote,
          tracking_number: trackingNumber || undefined,
        })}
        title={`Update Order Status`}
        confirmLabel="Update Status"
        isLoading={updateStatusMutation.isPending}
      >
        <div className="space-y-4 pt-4">
          {newStatus === 'shipped' && (
            <FormField
              label="Tracking Number"
              name="tracking_number"
              value={trackingNumber}
              onChange={setTrackingNumber}
              placeholder="Enter tracking number"
            />
          )}
          <FormField
            label="Note (optional)"
            name="note"
            type="textarea"
            value={statusNote}
            onChange={setStatusNote}
            placeholder="Add a note about this status change..."
            rows={3}
          />
        </div>
      </ConfirmDialog>

      {/* Refund Dialog */}
      <ConfirmDialog
        isOpen={showRefundDialog}
        onClose={() => setShowRefundDialog(false)}
        onConfirm={() => refundMutation.mutate()}
        title="Issue Refund"
        description={`Are you sure you want to refund UGX ${o.total.toLocaleString()} to ${o.customer.name}?`}
        confirmLabel="Issue Refund"
        variant="warning"
        isLoading={refundMutation.isPending}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={() => {
          updateStatusMutation.mutate({ status: 'cancelled', note: 'Order cancelled by admin' });
          setShowCancelDialog(false);
        }}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel Order"
        variant="danger"
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
