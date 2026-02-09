<?php

namespace App\Http\Controllers\Backend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductManagementController extends Controller
{
    /**
     * Display products for a specific store
     */
    public function index(Store $store)
    {
        $products = $store->products()
            ->with('category')
            ->latest()
            ->paginate(20);

        return view('admin.store.products.index', compact('store', 'products'));
    }

    /**
     * Show form to create a new product
     */
    public function create(Store $store)
    {
        $categories = ProductCategory::orderBy('name')->get();

        return view('admin.store.products.create', compact('store', 'categories'));
    }

    /**
     * Store a new product
     */
    public function store(Request $request, Store $store)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:product_categories,id',
            'price' => 'required|numeric|min:0',
            'price_ugx' => 'nullable|numeric|min:0',
            'price_credits' => 'nullable|integer|min:0',
            'allow_credit_payment' => 'boolean',
            'compare_at_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'track_inventory' => 'boolean',
            'allow_backorders' => 'boolean',
            'requires_shipping' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'is_digital' => 'boolean',
            'digital_file_path' => 'nullable|string',
            'download_limit' => 'nullable|integer|min:1',
            'status' => 'required|in:draft,active,archived,out_of_stock',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        // Generate unique slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Set pricing - prioritize UGX if provided, fallback to general price
        $validated['price_ugx'] = $validated['price_ugx'] ?? $validated['price'];
        $validated['price'] = $validated['price_ugx']; // Store primary price in price column

        $product = $store->products()->create([
            'uuid' => Str::uuid(),
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'],
            'category_id' => $validated['category_id'],
            'price' => $validated['price'],
            'price_ugx' => $validated['price_ugx'],
            'price_credits' => $validated['price_credits'] ?? 0,
            'allow_credit_payment' => $validated['allow_credit_payment'] ?? false,
            'compare_at_price' => $validated['compare_at_price'],
            'sku' => $validated['sku'],
            'stock_quantity' => $validated['stock_quantity'],
            'track_inventory' => $validated['track_inventory'] ?? true,
            'allow_backorders' => $validated['allow_backorders'] ?? false,
            'requires_shipping' => $validated['requires_shipping'] ?? true,
            'weight' => $validated['weight'],
            'is_digital' => $validated['is_digital'] ?? false,
            'digital_file_path' => $validated['digital_file_path'],
            'download_limit' => $validated['download_limit'],
            'status' => $validated['status'],
            'is_featured' => $validated['is_featured'] ?? false,
            'meta_title' => $validated['meta_title'],
            'meta_description' => $validated['meta_description'],
            'published_at' => $validated['status'] === 'active' ? now() : null,
        ]);

        return redirect()
            ->route('admin.store.products.show', [$store, $product])
            ->with('success', 'Product created successfully');
    }

    /**
     * Show product details
     */
    public function show(Store $store, Product $product)
    {
        $product->load('category');

        return view('admin.store.products.show', compact('store', 'product'));
    }

    /**
     * Show form to edit product
     */
    public function edit(Store $store, Product $product)
    {
        $categories = ProductCategory::orderBy('name')->get();

        return view('admin.store.products.edit', compact('store', 'product', 'categories'));
    }

    /**
     * Update product
     */
    public function update(Request $request, Store $store, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:product_categories,id',
            'price' => 'required|numeric|min:0',
            'price_ugx' => 'nullable|numeric|min:0',
            'price_credits' => 'nullable|integer|min:0',
            'allow_credit_payment' => 'boolean',
            'compare_at_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100',
            'stock_quantity' => 'required|integer|min:0',
            'track_inventory' => 'boolean',
            'allow_backorders' => 'boolean',
            'requires_shipping' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'is_digital' => 'boolean',
            'digital_file_path' => 'nullable|string',
            'download_limit' => 'nullable|integer|min:1',
            'status' => 'required|in:draft,active,archived,out_of_stock',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        // Update slug if name changed
        if ($validated['name'] !== $product->name) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;

            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $validated['slug'] = $slug;
        }

        // Set pricing
        $validated['price_ugx'] = $validated['price_ugx'] ?? $validated['price'];
        $validated['price'] = $validated['price_ugx'];

        // Update published_at if status changed to active
        if ($validated['status'] === 'active' && $product->status !== 'active') {
            $validated['published_at'] = now();
        }

        $product->update($validated);

        return redirect()
            ->route('admin.store.products.show', [$store, $product])
            ->with('success', 'Product updated successfully');
    }

    /**
     * Update stock quantity
     */
    public function updateStock(Request $request, Store $store, Product $product)
    {
        $validated = $request->validate([
            'stock_quantity' => 'required|integer|min:0',
            'reason' => 'nullable|string|max:255',
        ]);

        $oldQuantity = $product->stock_quantity;
        $product->update(['stock_quantity' => $validated['stock_quantity']]);

        // Log stock change (you can implement stock history if needed)

        return back()->with('success', 'Stock updated successfully');
    }

    /**
     * Delete product
     */
    public function destroy(Store $store, Product $product)
    {
        $product->delete();

        return redirect()
            ->route('admin.store.products.index', $store)
            ->with('success', 'Product deleted successfully');
    }
}