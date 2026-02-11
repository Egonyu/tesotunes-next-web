'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';
import { 
  Eye, Edit, Trash2, Package, ShoppingBag, TrendingUp, DollarSign, Filter 
} from 'lucide-react';
import { DataTable, PageHeader, StatusBadge, ConfirmDialog, Column } from '@/components/admin';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  sold: number;
  category: { id: string; name: string };
  store: { id: string; name: string };
  artist?: { id: string; name: string };
  images: string[];
  status: 'active' | 'draft' | 'out_of_stock';
  created_at: string;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface StatsResponse {
  total_products: number;
  total_orders: number;
  revenue: number;
  growth: number;
}

export default function StoreProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'store', 'stats'],
    queryFn: () => apiGet<StatsResponse>('/api/admin/store/api/stats'),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'products', { page, search, category, status }],
    queryFn: () => apiGet<ProductsResponse>('/api/admin/store/api/products', { 
      params: { page, search, category, status, per_page: 15 }
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/store/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'stats'] });
      setDeleteProduct(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => apiDelete(`/admin/store/api/products/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'products'] });
      setSelectedProducts([]);
    },
  });

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <Package className="h-6 w-6 m-3 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.store?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product) => (
        <span className="px-2 py-1 bg-muted rounded text-sm">
          {product.category?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (product) => (
        <span className="font-medium">UGX {product.price.toLocaleString()}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => (
        <span className={product.stock === 0 ? 'text-red-600 font-medium' : product.stock < 20 ? 'text-yellow-600 font-medium' : ''}>
          {product.stock}
        </span>
      ),
    },
    {
      key: 'sold',
      header: 'Sold',
      render: (product) => <span>{product.sold}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => <StatusBadge status={product.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/store/products/${product.id}`}
            className="p-2 hover:bg-muted rounded-lg"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/store/products/${product.id}/edit`}
            className="p-2 hover:bg-muted rounded-lg"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setDeleteProduct(product)}
            className="p-2 hover:bg-muted rounded-lg text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = statsData || { total_products: 0, total_orders: 0, revenue: 0, growth: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Products"
        description="Manage all products across stores"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Store', href: '/admin/store' },
          { label: 'Products' },
        ]}
        createHref="/admin/store/products/create"
        createLabel="Add Product"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats.total_products.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats.total_orders.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Orders This Month</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">UGX {(stats.revenue / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-muted-foreground">Revenue This Month</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">+{stats.growth}%</p>
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
        <Link href="/admin/store/shops" className="px-4 py-2 border rounded-lg hover:bg-muted whitespace-nowrap">
          Shops
        </Link>
        <Link href="/admin/store/promotions" className="px-4 py-2 border rounded-lg hover:bg-muted whitespace-nowrap">
          Promotions
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">All Categories</option>
          <option value="cds">CDs</option>
          <option value="vinyl">Vinyl</option>
          <option value="apparel">Apparel</option>
          <option value="accessories">Accessories</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <DataTable
        data={productsData?.data || []}
        columns={columns}
        isLoading={isLoading}
        selectable
        selectedItems={selectedProducts}
        onSelectionChange={setSelectedProducts}
        getItemId={(product) => product.id}
        searchPlaceholder="Search products..."
        onSearch={setSearch}
        pagination={productsData?.meta ? {
          page: productsData.meta.current_page,
          perPage: productsData.meta.per_page,
          total: productsData.meta.total,
          onPageChange: setPage,
        } : undefined}
        bulkActions={
          <>
            <button 
              onClick={() => bulkDeleteMutation.mutate(selectedProducts)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Selected
            </button>
          </>
        }
        emptyMessage="No products found"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
