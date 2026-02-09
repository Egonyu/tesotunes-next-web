<?php

namespace App\Http\Controllers\Frontend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\ProductCategory;
use App\Modules\Store\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Display products listing for marketplace (all products from all stores)
     */
    public function marketplaceIndex(Request $request)
    {
        $products = Product::with(['store.user', 'category'])
            ->where('status', 'active')
            ->whereHas('store', fn($q) => $q->where('status', 'active'))
            ->when($request->search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('store', fn($sq) => $sq->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->type, function ($query, $type) {
                $query->where('product_type', $type);
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category_id', $category);
            })
            ->when($request->store, function ($query, $storeSlug) {
                $query->whereHas('store', fn($q) => $q->where('slug', $storeSlug));
            })
            ->when($request->min_price, function ($query, $min) {
                $query->where('price_ugx', '>=', $min);
            })
            ->when($request->max_price, function ($query, $max) {
                $query->where('price_ugx', '<=', $max);
            })
            ->when($request->sort === 'price_low', function ($query) {
                $query->orderBy('price_ugx', 'asc');
            })
            ->when($request->sort === 'price_high', function ($query) {
                $query->orderBy('price_ugx', 'desc');
            })
            ->when($request->sort === 'popular', function ($query) {
                $query->orderByDesc('view_count');
            })
            ->when(!$request->sort, function ($query) {
                $query->latest();
            })
            ->paginate(24);

        $categories = ProductCategory::withCount('products')->get();
        
        // Get stores for filter
        $stores = \App\Modules\Store\Models\Store::where('status', 'active')
            ->withCount('products')
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get();

        return view('frontend.esokoni.products.index', compact('products', 'categories', 'stores'));
    }

    /**
     * Display products listing
     */
    public function index(Request $request)
    {
        $products = Product::with('store.owner', 'category')
            ->where('status', 'active')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->type, function ($query, $type) {
                $query->where('product_type', $type);
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category_id', $category);
            })
            ->when($request->min_price, function ($query, $min) {
                $query->where('price', '>=', $min * 100); // Convert to cents
            })
            ->when($request->max_price, function ($query, $max) {
                $query->where('price', '<=', $max * 100);
            })
            ->when($request->sort === 'price_low', function ($query) {
                $query->orderBy('price', 'asc');
            })
            ->when($request->sort === 'price_high', function ($query) {
                $query->orderBy('price', 'desc');
            })
            ->when($request->sort === 'popular', function ($query) {
                $query->orderBy('order_count', 'desc');
            })
            ->when(!$request->sort, function ($query) {
                $query->latest();
            })
            ->paginate(24);

        $categories = ProductCategory::withCount('products')->get();

        return view('frontend.store.products.index', compact('products', 'categories'));
    }

    /**
     * Show product details
     */
    public function show(Product $product)
    {
        $product->load('store.owner', 'category');

        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->take(4)
            ->get();

        return view('frontend.store.products.show', compact('product', 'relatedProducts'));
    }

    /**
     * Show create product form
     */
    public function create(Store $store)
    {
        $this->authorize('update', $store);

        $categories = ProductCategory::all();

        return view('frontend.store.products.create', compact('store', 'categories'));
    }

    /**
     * Store new product
     */
    public function store(Request $request, Store $store)
    {
        $this->authorize('update', $store);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:255',
            'product_type' => 'required|in:physical,digital,service,experience,ticket,promotion',
            'category_id' => 'nullable|exists:product_categories,id',
            'price_ugx' => 'required|numeric|min:0',
            'price_credits' => 'nullable|integer|min:0',
            'allow_credit_payment' => 'nullable|boolean',
            'allow_hybrid_payment' => 'nullable|boolean',
            'inventory_quantity' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100',
            'images' => 'nullable|array|min:1',
            'images.*' => 'image|max:5120',
            'digital_file' => 'nullable|file|max:51200',
            'is_digital' => 'nullable|boolean',
            'download_limit' => 'nullable|integer|min:1',
            'track_inventory' => 'nullable|boolean',
            'requires_shipping' => 'nullable|boolean',
            'weight' => 'nullable|numeric|min:0',
        ]);

        // Normalize data
        $validated['inventory_quantity'] = $validated['inventory_quantity'] ?? 0;
        $validated['allow_credit_payment'] = isset($validated['allow_credit_payment']);
        $validated['allow_hybrid_payment'] = isset($validated['allow_hybrid_payment']);
        $validated['track_inventory'] = isset($validated['track_inventory']);
        $validated['requires_shipping'] = isset($validated['requires_shipping']);
        $validated['is_digital'] = $validated['product_type'] === 'digital';

        $product = $this->productService->create($store, $validated);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Product created successfully!',
                'product' => $product,
                'redirect' => route('frontend.store.products.show', ['store' => $store, 'product' => $product])
            ]);
        }

        return redirect()
            ->route('frontend.store.dashboard', $store)
            ->with('success', 'Product created successfully!');
    }

    /**
     * Show edit product form
     */
    public function edit(Store $store, Product $product)
    {
        $this->authorize('update', $store);

        $categories = ProductCategory::all();

        return view('frontend.store.products.edit', compact('product', 'categories'));
    }

    /**
     * Update product
     */
    public function update(Request $request, Store $store, Product $product)
    {
        $this->authorize('update', $store);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:store_products,slug,' . $product->id,
            'description' => 'required|string',
            'product_type' => 'required|in:physical,digital,service,experience,ticket,promotion',
            'category_id' => 'nullable|exists:product_categories,id',
            'price_ugx' => 'required|numeric|min:0',
            'price_credits' => 'nullable|integer|min:0',
            'inventory_quantity' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:100',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
            'digital_file' => 'nullable|file|max:51200',
            'metadata' => 'nullable|array',
            'requires_shipping' => 'boolean',
            'shipping_fee' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,out_of_stock',
            'is_featured' => 'sometimes|boolean',
        ]);

        $this->productService->update($product, $validated);

        return redirect()
            ->route('frontend.store.products.show', $product)
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Delete product
     */
    public function destroy(Store $store, Product $product)
    {
        $this->authorize('update', $store);

        $product->delete();

        return redirect()
            ->route('frontend.store.dashboard', $product->store)
            ->with('success', 'Product deleted successfully!');
    }
}
