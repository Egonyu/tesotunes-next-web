"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { Box, CheckCircle2, Package, Pencil, Plus, Store, Trash2, Upload } from "lucide-react";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import {
  useActivateSellerProduct,
  useArchiveSellerProduct,
  useCreateSellerProduct,
  useCreateSellerStore,
  useDeleteSellerProduct,
  useUpdateSellerProduct,
  useSellerStoreCategories,
  useSellerStoreOrders,
  type SellerStoreProduct,
  useSellerStoreProducts,
  useSellerStores,
  useSellerStoreStats,
  useUpdateSellerOrderStatus,
} from "@/hooks/useSellerStore";

type ProductFormState = {
  name: string;
  description: string;
  short_description: string;
  category_id: string;
  product_type: string;
  price_ugx: string;
  inventory_quantity: string;
  images: File[];
};

const emptyProductForm: ProductFormState = {
  name: "",
  description: "",
  short_description: "",
  category_id: "",
  product_type: "physical",
  price_ugx: "",
  inventory_quantity: "0",
  images: [],
};

export default function ArtistStorePage() {
  const [selectedStoreSlug, setSelectedStoreSlug] = useState("");
  const [activeView, setActiveView] = useState<"overview" | "products" | "orders">("overview");
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerStoreProduct | null>(null);
  const [storeDraft, setStoreDraft] = useState({ name: "", description: "" });
  const [productDraft, setProductDraft] = useState<ProductFormState>(emptyProductForm);

  const storesQuery = useSellerStores();
  const categoriesQuery = useSellerStoreCategories();
  const selectedStore = useMemo(
    () => storesQuery.data?.find((store) => store.slug === selectedStoreSlug) ?? null,
    [selectedStoreSlug, storesQuery.data]
  );

  useEffect(() => {
    if (!selectedStoreSlug && storesQuery.data?.length) {
      setSelectedStoreSlug(storesQuery.data[0].slug);
    }
  }, [selectedStoreSlug, storesQuery.data]);

  const statsQuery = useSellerStoreStats(selectedStoreSlug);
  const productsQuery = useSellerStoreProducts(selectedStoreSlug);
  const ordersQuery = useSellerStoreOrders(selectedStoreSlug);

  const createStore = useCreateSellerStore();
  const createProduct = useCreateSellerProduct(selectedStoreSlug);
  const updateProduct = useUpdateSellerProduct(selectedStoreSlug);
  const activateProduct = useActivateSellerProduct(selectedStoreSlug);
  const archiveProduct = useArchiveSellerProduct(selectedStoreSlug);
  const deleteProduct = useDeleteSellerProduct(selectedStoreSlug);
  const updateOrderStatus = useUpdateSellerOrderStatus();

  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const stats = statsQuery.data;
  const editingProductImage = editingProduct?.featured_image_url || editingProduct?.featured_image || "";

  const handleCreateStore = async () => {
    if (!storeDraft.name.trim()) {
      toast.error("Store name is required");
      return;
    }

    try {
      const created = await createStore.mutateAsync({
        name: storeDraft.name.trim(),
        description: storeDraft.description.trim() || undefined,
        owner_mode: "artist",
      });
      setSelectedStoreSlug(created.slug);
      setStoreDraft({ name: "", description: "" });
      setShowCreateStore(false);
      toast.success("Storefront created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create store");
    }
  };

  const resetProductModal = () => {
    setEditingProduct(null);
    setProductDraft(emptyProductForm);
    setShowCreateProduct(false);
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProductDraft(emptyProductForm);
    setShowCreateProduct(true);
  };

  const openEditProductModal = (product: SellerStoreProduct) => {
    setEditingProduct(product);
    setProductDraft({
      name: product.name,
      description: product.description ?? "",
      short_description: product.short_description ?? "",
      category_id: product.category?.id ? String(product.category.id) : "",
      product_type: product.product_type,
      price_ugx: String(product.price_ugx ?? ""),
      inventory_quantity: String(product.inventory_quantity ?? 0),
      images: [],
    });
    setShowCreateProduct(true);
  };

  const handleSaveProduct = async () => {
    if (!selectedStoreSlug) {
      toast.error("Select a store first");
      return;
    }

    if (!productDraft.name.trim() || !productDraft.description.trim() || !productDraft.category_id) {
      toast.error("Fill in the required product fields");
      return;
    }

    try {
      const payload = {
        name: productDraft.name.trim(),
        description: productDraft.description.trim(),
        short_description: productDraft.short_description.trim() || undefined,
        category_id: Number(productDraft.category_id),
        product_type: productDraft.product_type,
        price_ugx: Number(productDraft.price_ugx || 0),
        inventory_quantity: Number(productDraft.inventory_quantity || 0),
        track_inventory: true,
        allow_backorder: false,
        images: productDraft.images.length ? productDraft.images : undefined,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({
          productId: editingProduct.id,
          payload,
        });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Product created");
      }

      resetProductModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Artist Studio</p>
            <h1 className="mt-2 text-3xl font-semibold">Storefronts</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage your Eduka storefronts inside the Esokoni marketplace using the live seller API.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedStoreSlug}
              onChange={(event) => setSelectedStoreSlug(event.target.value)}
              className="min-w-[240px] rounded-2xl border bg-background px-4 py-3 text-sm"
            >
              <option value="">Select storefront</option>
              {(storesQuery.data ?? []).map((store) => (
                <option key={store.id} value={store.slug}>
                  {store.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateStore(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background"
            >
              <Plus className="h-4 w-4" />
              New Store
            </button>
          </div>
        </div>
        {selectedStore ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 font-medium">
              <Store className="h-4 w-4" />
              {selectedStore.name}
            </span>
            <span className="capitalize text-muted-foreground">{selectedStore.status}</span>
            <span className="capitalize text-muted-foreground">{selectedStore.store_type} store</span>
            <span className="capitalize text-muted-foreground">{selectedStore.subscription_tier} tier</span>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
            Create your first store to start listing products and managing orders.
          </div>
        )}
      </section>

      {selectedStore && (
        <>
          <div className="flex gap-1 rounded-2xl bg-muted p-1 w-fit">
            {(["overview", "products", "orders"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm font-medium capitalize",
                  activeView === view ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                {view}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue" value={formatCurrency(Number(stats?.total_sales_ugx ?? 0))} />
            <StatCard label="Orders" value={formatNumber(Number(stats?.total_orders ?? 0))} />
            <StatCard label="Products" value={formatNumber(Number(stats?.products_count ?? 0))} />
            <StatCard label="Pending" value={formatNumber(Number(stats?.pending_orders ?? 0))} />
          </div>

          {activeView === "overview" && (
            <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
              <section className="rounded-3xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Recent products</h2>
                    <p className="text-sm text-muted-foreground">
                      Products currently attached to {selectedStore.name}
                    </p>
                  </div>
                  <button
                    onClick={openCreateProductModal}
                    className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {products.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center gap-3 rounded-2xl border p-3">
                      <ProductThumb name={product.name} image={product.featured_image_url || product.featured_image || ""} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category?.name ?? "Uncategorized"} • {formatCurrency(Number(product.price_ugx ?? 0))}
                        </p>
                      </div>
                      <span className="text-xs capitalize text-muted-foreground">{product.status}</span>
                    </div>
                  ))}
                  {!products.length && (
                    <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                      No products yet for this storefront.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border bg-card p-5">
                <h2 className="text-lg font-semibold">Recent orders</h2>
                <p className="text-sm text-muted-foreground">Only orders for the selected storefront appear here.</p>
                <div className="mt-4 space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="rounded-2xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user?.display_name || order.user?.email || "Customer"} • {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span className="text-xs capitalize text-muted-foreground">{order.status}</span>
                      </div>
                    </div>
                  ))}
                  {!orders.length && (
                    <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                      No orders for this storefront yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeView === "products" && (
            <section className="rounded-3xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Products</h2>
                  <p className="text-sm text-muted-foreground">Manage inventory for {selectedStore.name}.</p>
                </div>
                <button
                  onClick={openCreateProductModal}
                  className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {products.map((product) => (
                  <article key={product.id} className="rounded-3xl border bg-background p-4">
                    <div className="flex gap-4">
                      <ProductThumb
                        name={product.name}
                        image={product.featured_image_url || product.featured_image || ""}
                        large
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {product.category?.name ?? "Uncategorized"} • {product.product_type}
                            </p>
                          </div>
                          <span className="text-xs capitalize text-muted-foreground">{product.status}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                          <span>{formatCurrency(Number(product.price_ugx ?? 0))}</span>
                          <span className="text-muted-foreground">
                            {formatNumber(Number(product.inventory_quantity ?? 0))} in stock
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => openEditProductModal(product)}
                            className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          {product.status !== "active" ? (
                            <button
                              onClick={() =>
                                activateProduct.mutate(product.id, {
                                  onSuccess: () => toast.success("Product activated"),
                                  onError: () => toast.error("Could not activate product"),
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                archiveProduct.mutate(product.id, {
                                  onSuccess: () => toast.success("Product archived"),
                                  onError: () => toast.error("Could not archive product"),
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium"
                            >
                              <Package className="h-4 w-4" />
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (!window.confirm(`Delete "${product.name}"?`)) return;
                              deleteProduct.mutate(product.id, {
                                onSuccess: () => toast.success("Product deleted"),
                                onError: () => toast.error("Could not delete product"),
                              });
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeView === "orders" && (
            <section className="rounded-3xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Orders</h2>
              <div className="mt-4 overflow-hidden rounded-2xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-4 font-medium">{order.order_number}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {order.user?.display_name || order.user?.email || "Customer"}
                        </td>
                        <td className="px-4 py-4">
                          {formatCurrency(Number(order.total_ugx ?? order.total_amount ?? 0))}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={order.status}
                            onChange={(event) =>
                              updateOrderStatus.mutate(
                                {
                                  storeSlug: selectedStoreSlug,
                                  orderNumber: order.order_number,
                                  status: event.target.value,
                                },
                                {
                                  onSuccess: () => toast.success("Order status updated"),
                                  onError: () => toast.error("Could not update order"),
                                }
                              )
                            }
                            className="rounded-xl border bg-background px-3 py-2 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{formatDate(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {showCreateStore && (
        <ModalShell
          title="Create storefront"
          description="Set up a new Eduka storefront in the marketplace."
          onClose={() => setShowCreateStore(false)}
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Store name</span>
            <input
              value={storeDraft.name}
              onChange={(event) => setStoreDraft((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border bg-background px-4 py-3"
              placeholder="Official merch store"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium">Description</span>
            <textarea
              value={storeDraft.description}
              onChange={(event) => setStoreDraft((current) => ({ ...current, description: event.target.value }))}
              className="min-h-[120px] w-full rounded-2xl border bg-background px-4 py-3"
              placeholder="Tell fans what this storefront sells"
            />
          </label>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setShowCreateStore(false)} className="rounded-2xl border px-4 py-2 text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={handleCreateStore}
              disabled={createStore.isPending}
              className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
            >
              {createStore.isPending ? "Creating..." : "Create Store"}
            </button>
          </div>
        </ModalShell>
      )}

      {showCreateProduct && selectedStore && (
        <ModalShell
          title={editingProduct ? "Edit product" : "Add product"}
          description={
            editingProduct
              ? `Update ${editingProduct.name} inside ${selectedStore.name}.`
              : `Create a product inside ${selectedStore.name}.`
          }
          onClose={resetProductModal}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Product name</span>
              <input
                value={productDraft.name}
                onChange={(event) => setProductDraft((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border bg-background px-4 py-3"
                placeholder="Tour hoodie"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Description</span>
              <textarea
                value={productDraft.description}
                onChange={(event) => setProductDraft((current) => ({ ...current, description: event.target.value }))}
                className="min-h-[120px] w-full rounded-2xl border bg-background px-4 py-3"
                placeholder="Describe the product"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Short description</span>
              <input
                value={productDraft.short_description}
                onChange={(event) => setProductDraft((current) => ({ ...current, short_description: event.target.value }))}
                className="w-full rounded-2xl border bg-background px-4 py-3"
                placeholder="Quick storefront summary"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Category</span>
              <select
                value={productDraft.category_id}
                onChange={(event) => setProductDraft((current) => ({ ...current, category_id: event.target.value }))}
                className="w-full rounded-2xl border bg-background px-4 py-3"
              >
                <option value="">Select category</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Product type</span>
              <select
                value={productDraft.product_type}
                onChange={(event) => setProductDraft((current) => ({ ...current, product_type: event.target.value }))}
                className="w-full rounded-2xl border bg-background px-4 py-3"
              >
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
                <option value="service">Service</option>
                <option value="experience">Experience</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Price (UGX)</span>
              <input
                type="number"
                min="0"
                value={productDraft.price_ugx}
                onChange={(event) => setProductDraft((current) => ({ ...current, price_ugx: event.target.value }))}
                className="w-full rounded-2xl border bg-background px-4 py-3"
                placeholder="15000"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Inventory</span>
              <input
                type="number"
                min="0"
                value={productDraft.inventory_quantity}
                onChange={(event) => setProductDraft((current) => ({ ...current, inventory_quantity: event.target.value }))}
                className="w-full rounded-2xl border bg-background px-4 py-3"
                placeholder="20"
              />
            </label>
            <div className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Images</span>
              {editingProductImage ? (
                <div className="mb-3 flex items-center gap-3 rounded-2xl border bg-muted/20 p-3">
                  <ProductThumb name={editingProduct?.name ?? "Product image"} image={editingProductImage} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Current featured image</p>
                    <p className="text-xs text-muted-foreground">Upload new files to replace the current product gallery.</p>
                  </div>
                </div>
              ) : null}
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>{productDraft.images.length ? `${productDraft.images.length} file(s) selected` : "Upload product images"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      images: Array.from(event.target.files ?? []),
                    }))
                  }
                />
              </label>
              {productDraft.images.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {productDraft.images.map((file) => (
                    <p key={`${file.name}-${file.lastModified}`}>{file.name}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={resetProductModal} className="rounded-2xl border px-4 py-2 text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={createProduct.isPending || updateProduct.isPending}
              className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
            >
              {createProduct.isPending || updateProduct.isPending
                ? editingProduct
                  ? "Saving..."
                  : "Creating..."
                : editingProduct
                  ? "Save Changes"
                  : "Create Product"}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ProductThumb({ name, image, large = false }: { name: string; image: string; large?: boolean }) {
  const sizeClass = large ? "h-20 w-20" : "h-12 w-12";

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-muted", sizeClass)}>
      {image ? (
        <Image src={image} alt={name} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <Box className={large ? "h-7 w-7" : "h-5 w-5"} />
        </div>
      )}
    </div>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl border bg-card p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <button onClick={onClose} className="rounded-2xl border px-3 py-2 text-sm font-medium">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
