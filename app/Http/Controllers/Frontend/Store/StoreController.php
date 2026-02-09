<?php

namespace App\Http\Controllers\Frontend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\ProductCategory;
use App\Modules\Store\Models\StoreCategory as ModelsStoreCategory;
use App\Modules\Store\Services\StoreService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoreController extends Controller
{
    protected $storeService;

    public function __construct(StoreService $storeService)
    {
        $this->storeService = $storeService;
    }

    /**
     * Display store marketplace
     */
    public function index(Request $request)
    {
        try {
            // Get featured stores (with banner/logo for hero section)
            $featuredStores = Store::with(['user'])
                ->where('status', 'active')
                ->where('is_verified', true)
                ->limit(8)
                ->get();

            // Build products query
            $productsQuery = Product::with([
                'store.user', 
                'category',
            ])
            ->withCount([
                'reviews as reviews_count' => function ($query) {
                    $query->where('is_approved', 1);
                }
            ])
            ->where('status', 'active')
            ->whereHas('store', function ($query) {
                $query->where('status', 'active');
            });

            // Search filter
            $productsQuery->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('store', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });

            // Category filter
            $productsQuery->when($request->category, function ($query, $category) {
                $query->where('category_id', $category);
            });

            // Product type filter (multiple)
            $productsQuery->when($request->types, function ($query, $types) {
                $typesArray = is_array($types) ? $types : explode(',', $types);
                $query->whereIn('product_type', $typesArray);
            });

            // Price range filter
            if ($request->price_min || $request->price_max) {
                $priceMin = $request->price_min ?? 0;
                $priceMax = $request->price_max ?? 999999999;
                $productsQuery->whereBetween('price_ugx', [$priceMin, $priceMax]);
            }

            // Sorting
            $productsQuery->when($request->sort, function ($query, $sort) {
                switch ($sort) {
                    case 'price_low':
                        $query->orderBy('price_ugx', 'asc');
                        break;
                    case 'price_high':
                        $query->orderBy('price_ugx', 'desc');
                        break;
                case 'popular':
                    $query->orderBy('total_sales', 'desc');
                    break;
                case 'rating':
                    $query->orderBy('reviews_count', 'desc');
                    break;
                case 'featured':
                    $query->orderByDesc('is_featured');
                    break;
                case 'newest':
                default:
                    $query->latest();
            }
        }, function ($query) {
            $query->latest();
        });

        // Paginate products (20 per page for better performance)
        $products = $productsQuery->paginate(20);

        // Get product categories for filter
        $categories = ProductCategory::withCount('products')
            ->orderBy('name')
            ->get();

        // Get marketplace statistics
        $stats = [
            'total_products' => Product::where('status', 'active')->count(),
            'total_stores' => Store::where('status', 'active')->count(),
            'total_artists' => Store::where('status', 'active')->distinct('user_id')->count(),
            'featured_count' => Store::where('status', 'active')->where('is_verified', true)->count(),
        ];

        return view('frontend.store.index', compact('products', 'categories', 'featuredStores', 'stats'));
        } catch (\Exception $e) {
            \Log::error('Store index error: ' . $e->getMessage());
            return view('frontend.store.index', [
                'products' => new \Illuminate\Pagination\LengthAwarePaginator([], 0, 20),
                'categories' => collect(),
                'featuredStores' => collect(),
                'stats' => [
                    'total_products' => 0,
                    'total_stores' => 0,
                    'total_artists' => 0,
                    'featured_count' => 0,
                ]
            ]);
        }
    }

    /**
     * Display store details (Eduka - individual store)
     */
    public function show(Store $store)
    {
        $store->load(['owner', 'products' => function ($query) {
            $query->where('status', 'active')
                ->where(function($q) {
                    $q->where('inventory_quantity', '>', 0)
                      ->orWhere('product_type', 'service')
                      ->orWhere('product_type', 'digital');
                });
        }, 'categories']);

        // Pass products separately for the view
        $products = $store->products;

        $relatedStores = Store::where('id', '!=', $store->id)
            ->where('status', 'active')
            ->take(4)
            ->get();

        return view('frontend.esokoni.eduka.show', compact('store', 'products', 'relatedStores'));
    }
    
    /**
     * Display all stores in the marketplace (Eduka index)
     */
    public function edukaIndex(Request $request)
    {
        $stores = Store::with(['user', 'products'])
            ->where('status', 'active')
            ->withCount('products')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->verified, function ($query) {
                $query->where('is_verified', true);
            })
            ->when($request->sort === 'popular', function ($query) {
                $query->orderByDesc('view_count');
            })
            ->when($request->sort === 'products', function ($query) {
                $query->orderByDesc('products_count');
            })
            ->when(!$request->sort, function ($query) {
                $query->latest();
            })
            ->paginate(24);

        return view('frontend.esokoni.eduka.index', compact('stores'));
    }
    
    /**
     * Display products for a specific store
     */
    public function storeProducts(Store $store, Request $request)
    {
        $products = Product::with(['category'])
            ->where('store_id', $store->id)
            ->where('status', 'active')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category_id', $category);
            })
            ->when($request->sort === 'price_low', function ($query) {
                $query->orderBy('price_ugx', 'asc');
            })
            ->when($request->sort === 'price_high', function ($query) {
                $query->orderBy('price_ugx', 'desc');
            })
            ->when(!$request->sort, function ($query) {
                $query->latest();
            })
            ->paginate(24);

        $categories = ProductCategory::withCount('products')->get();

        return view('frontend.esokoni.eduka.products', compact('store', 'products', 'categories'));
    }
    
    /**
     * Display the unified Esokoni marketplace (products + promotions)
     */
    public function marketplace(Request $request)
    {
        // Get featured products (order by view_count since total_sales doesn't exist)
        $featuredProducts = Product::with(['store.user', 'category'])
            ->where('status', 'active')
            ->where('is_featured', true)
            ->whereHas('store', fn($q) => $q->where('status', 'active'))
            ->orderByDesc('view_count')
            ->orderByDesc('created_at')
            ->limit(6)
            ->get();
        
        // Get featured promotions
        $featuredPromotions = \App\Models\Promotion::with(['platform', 'user'])
            ->active()
            ->where(fn($q) => $q->where('is_featured', true)->orWhere('is_top_rated', true))
            ->orderByDesc('rating_average')
            ->limit(6)
            ->get();
        
        // Get recent products
        $recentProducts = Product::with(['store.user', 'category'])
            ->where('status', 'active')
            ->whereHas('store', fn($q) => $q->where('status', 'active'))
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();
        
        // Get recent promotions
        $recentPromotions = \App\Models\Promotion::with(['platform', 'user'])
            ->active()
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();
        
        // Get top-rated promoters
        $topPromoters = \App\Models\Promotion::with(['user', 'platform'])
            ->active()
            ->where('rating_count', '>=', 3)
            ->orderByDesc('rating_average')
            ->limit(6)
            ->get()
            ->unique('user_id');
        
        // Marketplace stats
        $stats = [
            'total_products' => Product::where('status', 'active')->count(),
            'total_promotions' => \App\Models\Promotion::active()->count(),
            'total_stores' => Store::where('status', 'active')->count(),
            'total_promoters' => \App\Models\Promotion::active()->distinct('user_id')->count(),
        ];
        
        return view('frontend.esokoni.index', compact(
            'featuredProducts',
            'featuredPromotions', 
            'recentProducts',
            'recentPromotions',
            'topPromoters',
            'stats'
        ));
    }
    
    /**
     * Show user's own store
     */
    public function myStore(Request $request)
    {
        $user = Auth::user();
        $store = Store::where('user_id', $user->id)->first();
        
        if (!$store) {
            return redirect()->route('esokoni.my-store.create')
                ->with('info', 'Create your store to start selling.');
        }
        
        $products = $store->products()->orderBy('created_at', 'desc')->paginate(12);
        
        return view('frontend.esokoni.my-store.index', compact('store', 'products'));
    }

    /**
     * Show create store form (artists/users)
     */
    public function create()
    {
        $user = Auth::user();
        
        // If user already has a store, redirect to dashboard
        if ($user->store()->exists()) {
            $store = $user->store;
            return redirect()
                ->route('frontend.store.dashboard', $store)
                ->with('info', 'You already have a store. Here is your dashboard.');
        }

        $this->authorize('create', Store::class);

        $categories = ModelsStoreCategory::all();

        return view('frontend.store.create', compact('categories'));
    }

    /**
     * Store new store
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // If user already has a store, return error
        if ($user->store()->exists()) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have a store.',
                    'redirect' => route('frontend.store.dashboard', $user->store)
                ], 422);
            }
            return redirect()
                ->route('frontend.store.dashboard', $user->store)
                ->with('info', 'You already have a store.');
        }

        $this->authorize('create', Store::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:stores,slug',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
            'banner' => 'nullable|image|max:5120',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:product_categories,id',
            'settings' => 'nullable|array',
        ]);

        try {
            $store = $this->storeService->create(Auth::user(), $validated);

            // Return JSON for AJAX requests
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Store created successfully!',
                    'redirect' => route('frontend.store.dashboard', $store),
                    'store' => $store
                ], 201);
            }

            return redirect()
                ->route('frontend.store.dashboard', $store)
                ->with('success', 'Store created successfully!');
        } catch (\Exception $e) {
            \Log::error('Store creation failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create store: ' . $e->getMessage()
                ], 500);
            }

            return back()
                ->withInput()
                ->with('error', 'Failed to create store: ' . $e->getMessage());
        }
    }

    /**
     * Show store dashboard (owner view)
     */
    public function dashboard(Store $store)
    {
        $this->authorize('update', $store);

        $stats = $this->storeService->getStatistics($store);

        $recentOrders = $store->orders()
            ->with('buyer', 'items.product')
            ->latest()
            ->take(10)
            ->get();

        $topProducts = $store->products()
            ->with('pricing')
            ->withCount('orderItems')
            ->orderBy('order_items_count', 'desc')
            ->take(5)
            ->get();

        return view('frontend.store.dashboard', compact('store', 'stats', 'recentOrders', 'topProducts'));
    }

    /**
     * Show store settings page
     */
    public function settings(Store $store)
    {
        $this->authorize('update', $store);

        return view('frontend.store.settings', compact('store'));
    }

    /**
     * Update store settings
     */
    public function updateSettings(Request $request, Store $store)
    {
        $this->authorize('update', $store);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'banner' => 'nullable|image|max:5120',
            'logo' => 'nullable|image|max:2048',
            'accent_color' => 'nullable|string|max:7',
            'theme' => 'nullable|in:dark,light',
            'refund_policy' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'terms_of_service' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $store->update($validated);

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully!'
            ]);
        }

        return redirect()
            ->route('frontend.store.settings', $store)
            ->with('success', 'Settings updated successfully!');
    }

    /**
     * Show edit store form
     */
    public function edit(Store $store)
    {
        $this->authorize('update', $store);

        $categories = ModelsStoreCategory::all();

        return view('frontend.store.edit', compact('store', 'categories'));
    }

    /**
     * Update store
     */
    public function update(Request $request, Store $store)
    {
        $this->authorize('update', $store);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:stores,slug,' . $store->id,
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
            'banner' => 'nullable|image|max:5120',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:product_categories,id',
            'settings' => 'nullable|array',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        $this->storeService->update($store, $validated);

        // Return JSON for AJAX requests
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Store updated successfully!',
                'redirect' => route('frontend.store.dashboard', $store),
                'store' => $store->fresh()
            ]);
        }

        return redirect()
            ->route('frontend.store.dashboard', $store)
            ->with('success', 'Store updated successfully!');
    }

    /**
     * Delete store
     */
    public function destroy(Request $request, Store $store)
    {
        $this->authorize('delete', $store);

        $store->delete();

        // Return JSON for AJAX requests
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Store deleted successfully!',
                'redirect' => route('frontend.store.index')
            ]);
        }

        return redirect()
            ->route('frontend.store.index')
            ->with('success', 'Store deleted successfully!');
    }

    /**
     * My stores page
     */
    public function myStores()
    {
        // User can only have one store (HasOne relationship)
        $store = Auth::user()->store;

        // Wrap in collection for consistent view handling
        $stores = $store ? collect([$store]) : collect();

        return view('frontend.store.my-stores', compact('stores', 'store'));
    }
}
