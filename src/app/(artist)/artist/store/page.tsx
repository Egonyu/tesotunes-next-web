'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  MoreVertical,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  category: 'merchandise' | 'digital' | 'tickets' | 'bundles';
  stock_quantity: number;
  is_active: boolean;
  total_sold: number;
  total_revenue: number;
  created_at: string;
}

interface Order {
  id: number;
  order_number: string;
  customer: {
    name: string;
    email: string;
    avatar_url: string | null;
  };
  items: { product_name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

interface StoreStats {
  total_revenue: number;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  total_products: number;
  total_views: number;
}

// ============================================================================
// Component
// ============================================================================

export default function SellerDashboardPage() {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'overview' | 'products' | 'orders'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', category: 'merchandise' as Product['category'],
  });

  // Data fetching
  const { data: stats } = useQuery({
    queryKey: ['artist', 'store', 'stats'],
    queryFn: () => apiGet<StoreStats>('/artist/store/stats'),
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['artist', 'store', 'products'],
    queryFn: () => apiGet<Product[]>('/artist/store/products'),
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['artist', 'store', 'orders'],
    queryFn: () => apiGet<Order[]>('/artist/store/orders'),
    enabled: activeView === 'orders' || activeView === 'overview',
  });

  // Mutations
  const createProduct = useMutation({
    mutationFn: (data: typeof newProduct) => apiPost('/artist/store/products', {
      ...data,
      price: parseFloat(data.price),
    }),
    onSuccess: () => {
      toast.success('Product created');
      queryClient.invalidateQueries({ queryKey: ['artist', 'store'] });
      setShowAddProduct(false);
      setNewProduct({ name: '', description: '', price: '', category: 'merchandise' });
    },
    onError: () => toast.error('Failed to create product'),
  });

  const toggleProduct = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      apiPut(`/api/artist/store/products/${id}`, { is_active }),
    onSuccess: () => {
      toast.success('Product updated');
      queryClient.invalidateQueries({ queryKey: ['artist', 'store', 'products'] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/artist/store/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['artist', 'store'] });
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) =>
      apiPut(`/api/artist/store/orders/${id}`, { status }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['artist', 'store', 'orders'] });
    },
  });

  const filteredProducts = products?.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string }> = {
    pending: { icon: Clock, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-950' },
    processing: { icon: Package, color: 'text-blue-500 bg-blue-100 dark:bg-blue-950' },
    shipped: { icon: TrendingUp, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950' },
    delivered: { icon: CheckCircle, color: 'text-green-500 bg-green-100 dark:bg-green-950' },
    cancelled: { icon: XCircle, color: 'text-red-500 bg-red-100 dark:bg-red-950' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your merchandise and digital products</p>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Revenue',
              value: formatCurrency(stats.total_revenue),
              change: stats.revenue_change,
              icon: DollarSign,
              color: 'text-green-500',
            },
            { label: 'Orders', value: formatNumber(stats.total_orders), change: stats.orders_change, icon: ShoppingCart, color: 'text-blue-500' },
            { label: 'Products', value: stats.total_products, icon: Package, color: 'text-purple-500' },
            { label: 'Views', value: formatNumber(stats.total_views), icon: Eye, color: 'text-amber-500' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              {'change' in stat && stat.change !== undefined && (
                <p className={cn('text-xs mt-1', stat.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                  {stat.change >= 0 ? '+' : ''}{stat.change}% this month
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(['overview', 'products', 'orders'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors',
              activeView === view ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="rounded-xl border bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Recent Orders</h3>
              <button onClick={() => setActiveView('orders')} className="text-sm text-primary">View All</button>
            </div>
            <div className="divide-y">
              {!orders?.length ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No orders yet</div>
              ) : orders.slice(0, 5).map((order) => {
                const config = statusConfig[order.status];
                const StatusIcon = config?.icon || Clock;
                return (
                  <div key={order.id} className="p-4 flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config?.color)}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.name} • {formatDate(order.created_at)}</p>
                    </div>
                    <span className="font-medium text-sm">{formatCurrency(order.total)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-xl border bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Top Products</h3>
              <button onClick={() => setActiveView('products')} className="text-sm text-primary">View All</button>
            </div>
            <div className="divide-y">
              {!products?.length ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No products yet</div>
              ) : [...(products || [])].sort((a, b) => b.total_sold - a.total_sold).slice(0, 5).map((product) => (
                <div key={product.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} width={40} height={40} className="object-cover" />
                    ) : (
                      <Package className="w-5 h-5 m-2.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.total_sold} sold</p>
                  </div>
                  <span className="font-medium text-sm">{formatCurrency(product.total_revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products View */}
      {activeView === 'products' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : !filteredProducts?.length ? (
            <div className="text-center py-12 rounded-xl border bg-card">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No products found</p>
              <button onClick={() => setShowAddProduct(true)} className="mt-3 text-primary text-sm hover:underline">
                Add your first product
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="rounded-xl border bg-card overflow-hidden">
                  <div className="relative h-40 bg-muted">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    ) : (
                      <ImageIcon className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full font-medium',
                        product.is_active ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-muted text-muted-foreground'
                      )}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold truncate">{product.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                      </div>
                      <span className="font-bold">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{product.total_sold} sold</span>
                      <span>{product.stock_quantity} in stock</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <button
                        onClick={() => toggleProduct.mutate({ id: product.id, is_active: !product.is_active })}
                        className="p-1.5 hover:bg-muted rounded"
                        title={product.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {product.is_active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button className="p-1.5 hover:bg-muted rounded" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this product?')) deleteProduct.mutate(product.id);
                        }}
                        className="p-1.5 hover:bg-muted rounded text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders View */}
      {activeView === 'orders' && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loadingOrders ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : !orders?.length ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
                ) : orders.map((order) => {
                  const config = statusConfig[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="p-4 font-medium text-sm">{order.order_number}</td>
                      <td className="p-4 text-sm">{order.customer.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="p-4 font-medium text-sm">{formatCurrency(order.total)}</td>
                      <td className="p-4">
                        <span className={cn('text-xs font-medium px-2 py-1 rounded-full capitalize', config?.color)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus.mutate({ id: order.id, status: e.target.value as Order['status'] })}
                          className="text-xs bg-muted border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddProduct(false)}>
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Add Product</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Product description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Price (UGX)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as Product['category'] })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  >
                    <option value="merchandise">Merchandise</option>
                    <option value="digital">Digital</option>
                    <option value="tickets">Tickets</option>
                    <option value="bundles">Bundles</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 py-2 border rounded-lg text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => newProduct.name && newProduct.price && createProduct.mutate(newProduct)}
                disabled={!newProduct.name || !newProduct.price || createProduct.isPending}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 hover:bg-primary/90"
              >
                {createProduct.isPending ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
