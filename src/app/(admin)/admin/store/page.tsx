'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  ShoppingBag,
  Package,
  TrendingUp,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet, apiDelete } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  artist: string;
  image: string;
  price: number;
  stock: number;
  sold: number;
  category: string;
  status: 'active' | 'draft' | 'out_of_stock';
}

interface StoreStats {
  total_products: number;
  orders_this_month: number;
  revenue_this_month: number;
  growth_percentage: number;
}

interface PaginatedProducts {
  data: Product[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function StorePage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const { data: stats } = useQuery({
    queryKey: ['admin', 'store', 'stats'],
    queryFn: () => apiGet<StoreStats | { data: StoreStats }>('/api/admin/store/stats')
      .then(res => ('data' in res && res.data) ? res.data as StoreStats : res as StoreStats),
    staleTime: 60 * 1000,
  });

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'products', { search: searchQuery, category: categoryFilter, status: statusFilter, page }],
    queryFn: () => apiGet<PaginatedProducts | Product[]>('/api/admin/store/products', {
      params: {
        search: searchQuery || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        per_page: 10,
      },
    }).then(res => {
      if (Array.isArray(res)) return { data: res, meta: undefined };
      return res as PaginatedProducts;
    }),
  });

  const products = productsRes?.data || [];
  const meta = productsRes?.meta;

  const deleteProduct = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/admin/store/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store'] });
      toast.success('Product deleted');
    },
  });
  
  const statusStyles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    out_of_stock: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  
  const toggleSelect = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatStat = (val: number | undefined, prefix: string = '') => {
    if (val === undefined) return '—';
    if (val >= 1000000) return `${prefix}${(val / 1000000).toFixed(0)}M`;
    if (val >= 1000) return `${prefix}${(val / 1000).toFixed(0)}K`;
    return `${prefix}${val.toLocaleString()}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Store</h1>
          <p className="text-muted-foreground">Manage merchandise and products</p>
        </div>
        <Link
          href="/admin/store/products/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats?.total_products?.toLocaleString() ?? '—'}</p>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats?.orders_this_month?.toLocaleString() ?? '—'}</p>
          <p className="text-sm text-muted-foreground">Orders This Month</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{formatStat(stats?.revenue_this_month, 'UGX ')}</p>
          <p className="text-sm text-muted-foreground">Revenue This Month</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats?.growth_percentage !== undefined ? `+${stats.growth_percentage}%` : '—'}
          </p>
          <p className="text-sm text-muted-foreground">Growth</p>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <Link href="/admin/store/orders" className="px-4 py-2 border rounded-lg hover:bg-muted whitespace-nowrap">
          View Orders
        </Link>
        <Link href="/admin/store/categories" className="px-4 py-2 border rounded-lg hover:bg-muted whitespace-nowrap">
          Categories
        </Link>
        <Link href="/admin/store/shipping" className="px-4 py-2 border rounded-lg hover:bg-muted whitespace-nowrap">
          Shipping
        </Link>
        <Link href="/admin/store/discounts" className="px-4 py-2 border rounded-lg hover:bg-muted whitespace-nowrap">
          Discounts
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Categories</option>
          <option value="cds">CDs</option>
          <option value="vinyl">Vinyl</option>
          <option value="apparel">Apparel</option>
          <option value="accessories">Accessories</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>
      
      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <span className="text-sm">{selectedProducts.length} selected</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
              Update Stock
            </button>
            <button
              onClick={() => {
                selectedProducts.forEach(id => deleteProduct.mutate(id));
                setSelectedProducts([]);
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term' : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={() => setSelectedProducts(
                      selectedProducts.length === products.length ? [] : products.map(p => p.id)
                    )}
                    className="h-4 w-4 rounded"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium">Product</th>
                <th className="p-4 text-left text-sm font-medium">Artist</th>
                <th className="p-4 text-left text-sm font-medium">Category</th>
                <th className="p-4 text-left text-sm font-medium">Price</th>
                <th className="p-4 text-left text-sm font-medium">Stock</th>
                <th className="p-4 text-left text-sm font-medium">Sold</th>
                <th className="p-4 text-left text-sm font-medium">Status</th>
                <th className="p-4 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="h-4 w-4 rounded"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                        <Image
                          src={product.image || '/images/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{product.artist}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-muted rounded text-sm">{product.category}</span>
                  </td>
                  <td className="p-4 font-medium">{formatCurrency(product.price)}</td>
                  <td className="p-4">
                    <span className={cn(
                      'font-medium',
                      product.stock === 0 ? 'text-red-600' : product.stock < 20 ? 'text-yellow-600' : ''
                    )}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">{product.sold}</td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      statusStyles[product.status]
                    )}>
                      {product.status === 'out_of_stock' ? 'Out of Stock' : product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/store/products/${product.id}`}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/store/products/${product.id}/edit`}
                        className="p-2 hover:bg-muted rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('Delete this product?')) deleteProduct.mutate(product.id);
                        }}
                        className="p-2 hover:bg-muted rounded-lg text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((meta.current_page - 1) * meta.per_page) + 1}-{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} products
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'px-3 py-1 rounded-lg',
                    page === pageNum ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            {meta.last_page > 5 && (
              <>
                <span className="px-2">...</span>
                <button
                  onClick={() => setPage(meta.last_page)}
                  className={cn(
                    'px-3 py-1 rounded-lg',
                    page === meta.last_page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  {meta.last_page}
                </button>
              </>
            )}
            <button
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
