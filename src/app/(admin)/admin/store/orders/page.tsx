'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api';
import { 
  Eye, Package, Truck, CheckCircle, XCircle, Clock, DollarSign,
  Filter, Download, RefreshCw
} from 'lucide-react';
import { DataTable, PageHeader, StatusBadge, Column } from '@/components/admin';

interface Order {
  id: string;
  order_number: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items_count: number;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: {
    city: string;
    country: string;
  };
  created_at: string;
}

interface OrdersResponse {
  data: Order[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface StatsResponse {
  pending_orders: number;
  processing_orders: number;
  shipped_today: number;
  total_revenue: number;
}

export default function StoreOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'store', 'orders', 'stats'],
    queryFn: () => apiGet<StatsResponse>('/api/admin/store/orders/stats'),
  });

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'orders', { page, search, status, paymentStatus, dateRange }],
    queryFn: () => apiGet<OrdersResponse>('/api/admin/store/api/orders', {
      params: { page, search, status, payment_status: paymentStatus, date_range: dateRange, per_page: 20 }
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) =>
      apiPost(`/api/admin/store/api/orders/${orderId}/status`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'orders'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const columns: Column<Order>[] = [
    {
      key: 'order',
      header: 'Order',
      render: (order) => (
        <div>
          <Link 
            href={`/admin/store/orders/${order.id}`}
            className="font-medium hover:text-primary"
          >
            #{order.order_number}
          </Link>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order) => (
        <div>
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-sm text-muted-foreground">{order.customer.email}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (order) => <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      render: (order) => (
        <span className="font-medium">UGX {order.total.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(order.status)}
          <StatusBadge status={order.status} />
        </div>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (order) => <StatusBadge status={order.payment_status} />,
    },
    {
      key: 'shipping',
      header: 'Location',
      render: (order) => (
        <span className="text-sm text-muted-foreground">
          {order.shipping_address?.city}, {order.shipping_address?.country}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/store/orders/${order.id}`}
            className="p-2 hover:bg-muted rounded-lg"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {order.status === 'pending' && (
            <button
              onClick={() => updateStatusMutation.mutate({ orderId: order.id, newStatus: 'processing' })}
              className="p-2 hover:bg-muted rounded-lg text-blue-600"
              title="Start Processing"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {order.status === 'processing' && (
            <button
              onClick={() => updateStatusMutation.mutate({ orderId: order.id, newStatus: 'shipped' })}
              className="p-2 hover:bg-muted rounded-lg text-green-600"
              title="Mark as Shipped"
            >
              <Truck className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = statsData || { pending_orders: 0, processing_orders: 0, shipped_today: 0, total_revenue: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage store orders and fulfillment"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Store', href: '/admin/store' },
          { label: 'Orders' },
        ]}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
            <Download className="h-4 w-4" />
            Export
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold">{stats.pending_orders}</p>
          <p className="text-sm text-muted-foreground">Pending Orders</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{stats.processing_orders}</p>
          <p className="text-sm text-muted-foreground">Processing</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">{stats.shipped_today}</p>
          <p className="text-sm text-muted-foreground">Shipped Today</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">UGX {(stats.total_revenue / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Orders Table */}
      <DataTable
        data={ordersData?.data || []}
        columns={columns}
        isLoading={isLoading}
        selectable
        selectedItems={selectedOrders}
        onSelectionChange={setSelectedOrders}
        getItemId={(order) => order.id}
        searchPlaceholder="Search orders..."
        onSearch={setSearch}
        pagination={ordersData?.meta ? {
          page: ordersData.meta.current_page,
          perPage: ordersData.meta.per_page,
          total: ordersData.meta.total,
          onPageChange: setPage,
        } : undefined}
        bulkActions={
          <>
            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
              Mark as Processing
            </button>
            <button className="px-3 py-1 text-sm border rounded hover:bg-muted">
              Export Selected
            </button>
          </>
        }
        emptyMessage="No orders found"
      />
    </div>
  );
}
