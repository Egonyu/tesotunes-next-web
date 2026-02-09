'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Upload, X, Plus } from 'lucide-react';
import Image from 'next/image';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';

interface Category {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_price: string;
  cost: string;
  sku: string;
  barcode: string;
  stock: string;
  low_stock_threshold: string;
  category_id: string;
  store_id: string;
  status: string;
  is_featured: boolean;
  is_digital: boolean;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  images: File[];
  tags: string[];
  meta_title: string;
  meta_description: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_price: '',
    cost: '',
    sku: '',
    barcode: '',
    stock: '',
    low_stock_threshold: '10',
    category_id: '',
    store_id: '',
    status: 'draft',
    is_featured: false,
    is_digital: false,
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    images: [],
    tags: [],
    meta_title: '',
    meta_description: '',
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories } = useQuery({
    queryKey: ['store', 'categories'],
    queryFn: () => apiGet<{ data: Category[] }>('/admin/store/categories'),
  });

  const { data: stores } = useQuery({
    queryKey: ['admin', 'stores'],
    queryFn: () => apiGet<{ data: Store[] }>('/admin/store/api/shops'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost('/admin/store/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      router.push('/admin/store/products');
    },
    onError: (error: { response?: { data?: { errors?: Record<string, string[]> } } }) => {
      if (error.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          newErrors[key] = messages[0];
        });
        setErrors(newErrors);
      }
    },
  });

  const updateField = (field: keyof ProductFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'images') {
        (value as File[]).forEach((file, i) => {
          data.append(`images[${i}]`, file);
        });
      } else if (key === 'dimensions') {
        data.append('dimensions', JSON.stringify(value));
      } else if (key === 'tags') {
        data.append('tags', JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        data.append(key, value ? '1' : '0');
      } else {
        data.append(key, String(value));
      }
    });
    
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Create a new product for the store"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Store', href: '/admin/store' },
          { label: 'Products', href: '/admin/store/products' },
          { label: 'Create' },
        ]}
        backHref="/admin/store/products"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Basic Information">
              <FormField
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={(v: string) => updateField('name', v)}
                placeholder="Enter product name"
                required
                error={errors.name}
              />
              <FormField
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={(v: string) => updateField('slug', v)}
                placeholder="product-slug"
                hint="URL-friendly version of the name"
                error={errors.slug}
              />
              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={(v: string) => updateField('description', v)}
                placeholder="Describe the product..."
                rows={6}
                error={errors.description}
              />
            </FormSection>

            <FormSection title="Media">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image src={src} alt={`Preview ${index + 1}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload product images. Recommended size: 800x800px. Max 5MB each.
                </p>
              </div>
            </FormSection>

            <FormSection title="Pricing">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Price (UGX)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={(v: string) => updateField('price', v)}
                  placeholder="0"
                  required
                  min={0}
                  error={errors.price}
                />
                <FormField
                  label="Compare at Price"
                  name="compare_price"
                  type="number"
                  value={formData.compare_price}
                  onChange={(v: string) => updateField('compare_price', v)}
                  placeholder="0"
                  hint="Original price for showing discount"
                  min={0}
                />
                <FormField
                  label="Cost per Item"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(v: string) => updateField('cost', v)}
                  placeholder="0"
                  hint="For profit calculation"
                  min={0}
                />
              </div>
            </FormSection>

            <FormSection title="Inventory">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={(v: string) => updateField('sku', v)}
                  placeholder="PROD-001"
                  error={errors.sku}
                />
                <FormField
                  label="Barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={(v: string) => updateField('barcode', v)}
                  placeholder="123456789012"
                />
                <FormField
                  label="Stock Quantity"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(v: string) => updateField('stock', v)}
                  placeholder="0"
                  required
                  min={0}
                  error={errors.stock}
                />
                <FormField
                  label="Low Stock Alert"
                  name="low_stock_threshold"
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={(v: string) => updateField('low_stock_threshold', v)}
                  placeholder="10"
                  hint="Alert when stock falls below this"
                  min={0}
                />
              </div>
            </FormSection>

            <FormSection title="Shipping">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_digital"
                    checked={formData.is_digital}
                    onChange={(e) => updateField('is_digital', e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="is_digital" className="text-sm">
                    This is a digital product (no shipping required)
                  </label>
                </div>
                
                {!formData.is_digital && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      label="Weight (kg)"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(v: string) => updateField('weight', v)}
                      placeholder="0.5"
                      step={0.1}
                      min={0}
                    />
                    <FormField
                      label="Length (cm)"
                      name="length"
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(v: string) => updateField('dimensions', { ...formData.dimensions, length: v })}
                      placeholder="0"
                    />
                    <FormField
                      label="Width (cm)"
                      name="width"
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(v: string) => updateField('dimensions', { ...formData.dimensions, width: v })}
                      placeholder="0"
                    />
                    <FormField
                      label="Height (cm)"
                      name="height"
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(v: string) => updateField('dimensions', { ...formData.dimensions, height: v })}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection title="SEO">
              <FormField
                label="Meta Title"
                name="meta_title"
                value={formData.meta_title}
                onChange={(v: string) => updateField('meta_title', v)}
                placeholder="Product title for search engines"
                hint="Leave blank to use product name"
              />
              <FormField
                label="Meta Description"
                name="meta_description"
                type="textarea"
                value={formData.meta_description}
                onChange={(v: string) => updateField('meta_description', v)}
                placeholder="Brief description for search results..."
                rows={3}
              />
            </FormSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FormSection title="Status">
              <FormField
                label="Product Status"
                name="status"
                type="select"
                value={formData.status}
                onChange={(v: string) => updateField('status', v)}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'active', label: 'Active' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => updateField('is_featured', e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="is_featured" className="text-sm">
                  Featured product
                </label>
              </div>
            </FormSection>

            <FormSection title="Organization">
              <FormField
                label="Store"
                name="store_id"
                type="select"
                value={formData.store_id}
                onChange={(v: string) => updateField('store_id', v)}
                options={stores?.data?.map(s => ({ value: s.id, label: s.name })) || []}
                required
                error={errors.store_id}
              />
              <FormField
                label="Category"
                name="category_id"
                type="select"
                value={formData.category_id}
                onChange={(v: string) => updateField('category_id', v)}
                options={categories?.data?.map(c => ({ value: c.id, label: c.name })) || []}
                required
                error={errors.category_id}
              />
            </FormSection>

            <FormSection title="Tags">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border rounded-lg bg-background"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="p-2 border rounded-lg hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </FormSection>
          </div>
        </div>

        <FormActions
          onCancel={() => router.push('/admin/store/products')}
          submitLabel="Create Product"
          isSubmitting={createMutation.isPending}
        />
      </form>
    </div>
  );
}
