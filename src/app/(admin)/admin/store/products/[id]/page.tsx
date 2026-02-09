'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Edit, Trash2, Package, ShoppingCart, Eye, ArrowUpRight, 
  Calendar, TrendingUp, Tag, Box, Store 
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  stock: number;
  sold: number;
  category: { id: string; name: string };
  store: { id: string; name: string; slug: string };
  artist?: { id: string; name: string; slug: string };
  images: string[];
  status: string;
  is_featured: boolean;
  is_digital: boolean;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  quantity: number;
  price: number;
  created_at: string;
  order: {
    id: string;
    customer_name: string;
    status: string;
  };
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'product', id],
    queryFn: () => apiGet<{ data: Product }>(`/admin/store/products/${id}`),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin', 'store', 'product', id, 'orders'],
    queryFn: () => apiGet<{ data: OrderItem[] }>(`/admin/store/products/${id}/orders`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/admin/store/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'products'] });
      router.push('/admin/store/products');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () => apiPost(`/admin/store/api/products/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'product', id] });
    },
  });

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

  if (!product?.data) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Link href="/admin/store/products" className="text-primary hover:underline mt-2 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  const p = product.data;
  const profit = p.price - (p.cost || 0);
  const profitMargin = p.cost ? ((profit / p.price) * 100).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={p.name}
        description={`SKU: ${p.sku || 'N/A'}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Store', href: '/admin/store' },
          { label: 'Products', href: '/admin/store/products' },
          { label: p.name },
        ]}
        backHref="/admin/store/products"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/store/products/${p.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              View Live
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href={`/admin/store/products/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="relative aspect-video bg-muted">
              {p.images.length > 0 ? (
                <Image
                  src={p.images[selectedImage]}
                  alt={p.name}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            {p.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {p.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt={`${p.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {p.description || 'No description provided.'}
            </p>
          </div>

          {/* Recent Orders */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Orders</h3>
              <Link href={`/admin/store/orders?product=${id}`} className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {recentOrders?.data?.length ? (
              <div className="divide-y">
                {recentOrders.data.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link 
                        href={`/admin/store/orders/${item.order_id}`}
                        className="font-medium hover:text-primary"
                      >
                        Order #{item.order_id.slice(0, 8)}
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.quantity}x @ UGX {item.price.toLocaleString()}</p>
                      <StatusBadge status={item.order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={p.status} />
              {p.is_featured && <StatusBadge status="featured" variant="info" />}
            </div>
            <button
              onClick={() => toggleStatusMutation.mutate()}
              disabled={toggleStatusMutation.isPending}
              className="w-full py-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              {p.status === 'active' ? 'Deactivate' : 'Activate'} Product
            </button>
          </div>

          {/* Pricing */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="font-semibold">Pricing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-bold text-lg">UGX {p.price.toLocaleString()}</span>
              </div>
              {p.compare_price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compare at</span>
                  <span className="line-through text-muted-foreground">
                    UGX {p.compare_price.toLocaleString()}
                  </span>
                </div>
              )}
              {p.cost && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span>UGX {p.cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Profit</span>
                    <span className="text-green-600 font-medium">
                      UGX {profit.toLocaleString()} ({profitMargin}%)
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Box className="h-4 w-4" />
              Inventory
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Stock</span>
                <span className={p.stock === 0 ? 'text-red-600 font-bold' : p.stock < 20 ? 'text-yellow-600 font-bold' : 'font-bold'}>
                  {p.stock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sold</span>
                <span className="font-medium">{p.sold}</span>
              </div>
              {p.barcode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode</span>
                  <span className="font-mono text-sm">{p.barcode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Organization */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="font-semibold">Organization</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Store
                </span>
                <Link href={`/admin/store/shops/${p.store.id}`} className="text-primary hover:underline">
                  {p.store.name}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </span>
                <span>{p.category?.name || 'Uncategorized'}</span>
              </div>
              {p.artist && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Artist</span>
                  <Link href={`/admin/artists/${p.artist.id}`} className="text-primary hover:underline">
                    {p.artist.name}
                  </Link>
                </div>
              )}
            </div>
            {p.tags.length > 0 && (
              <div className="pt-3 border-t">
                <span className="text-sm text-muted-foreground mb-2 block">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-muted rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span>{p.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversion</span>
                <span>{p.views > 0 ? ((p.sold / p.views) * 100).toFixed(2) : 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">UGX {(p.sold * p.price).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="border rounded-xl p-6 bg-card space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created
              </span>
              <span>{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last updated</span>
              <span>{new Date(p.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Product"
        description={`Are you sure you want to delete "${p.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
