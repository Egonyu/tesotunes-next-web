<?php

namespace App\Http\Controllers\Backend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Store;
use App\Modules\Store\Models\Order;
use App\Modules\Store\Models\Product;
use App\Services\Store\StoreService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreManagementController extends Controller
{
    protected $storeService;

    public function __construct(StoreService $storeService)
    {
        $this->storeService = $storeService;
    }

    /**
     * Display stores management dashboard
     */
    public function index(Request $request)
    {
        $stores = Store::with('user')
            ->withCount('products', 'orders')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(20);

        $stats = [
            'total_stores' => Store::count(),
            'active_stores' => Store::where('status', 'active')->count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
        ];

        return view('admin.store.index', compact('stores', 'stats'));
    }

    /**
     * Show form to create a new store
     */
    public function create()
    {
        $users = User::select('id', 'username', 'email', 'display_name')
            ->where('is_active', true)
            ->orderBy('display_name')
            ->get();

        return view('admin.store.create', compact('users'));
    }

    /**
     * Store a new store
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'status' => 'required|in:active,inactive,suspended',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
        ]);

        // Generate unique slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;

        while (Store::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $store = Store::create([
            'user_id' => $validated['user_id'],
            'owner_id' => $validated['user_id'],
            'owner_type' => User::class,
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'],
            'status' => $validated['status'],
            'settings' => [
                'contact' => [
                    'phone' => $validated['phone'],
                    'email' => $validated['email'],
                    'address' => $validated['address'],
                    'city' => $validated['city'],
                    'country' => 'Uganda',
                ],
                'theme' => [
                    'primary_color' => '#3B82F6',
                    'secondary_color' => '#10B981',
                ],
                'policies' => [
                    'return_days' => 7,
                    'shipping_note' => null,
                ],
                'notifications' => [
                    'email_on_order' => true,
                    'sms_on_order' => true,
                ],
            ],
        ]);

        return redirect()
            ->route('admin.store.show', $store->slug)
            ->with('success', 'Store created successfully');
    }

    /**
     * Show store details
     */
    public function show(Store $store)
    {
        $store->load('owner', 'products', 'orders.buyer');

        $stats = $this->storeService->getStoreStatistics($store);

        return view('admin.store.show', compact('store', 'stats'));
    }

    /**
     * Show form to edit store
     */
    public function edit(Store $store)
    {
        $users = User::select('id', 'display_name', 'email')
            ->where('is_active', true)
            ->orderBy('display_name')
            ->get();

        return view('admin.store.edit', compact('store', 'users'));
    }

    /**
     * Update store
     */
    public function update(Request $request, Store $store)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'status' => 'required|in:active,inactive,suspended',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        // Update slug if name changed
        if ($validated['name'] !== $store->name) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;

            while (Store::where('slug', $slug)->where('id', '!=', $store->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $validated['slug'] = $slug;
        }

        $store->update($validated);

        return redirect()
            ->route('admin.store.show', $store->slug)
            ->with('success', 'Store updated successfully');
    }

    /**
     * Approve store
     */
    public function approve(Store $store)
    {
        $store->update([
            'status' => 'active',
        ]);

        return back()->with('success', 'Store approved successfully');
    }

    /**
     * Suspend store
     */
    public function suspend(Request $request, Store $store)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $store->update([
            'status' => 'suspended',
            'suspended_reason' => $validated['reason'],
            'suspended_at' => now(),
        ]);

        return back()->with('success', 'Store suspended successfully');
    }

    /**
     * Reactivate store
     */
    public function reactivate(Store $store)
    {
        $store->update([
            'status' => 'active',
            'suspended_reason' => null,
            'suspended_at' => null,
        ]);

        return back()->with('success', 'Store reactivated successfully');
    }

    /**
     * Verify store
     */
    public function verify(Store $store)
    {
        $store->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        return back()->with('success', 'Store verified successfully');
    }

    /**
     * Delete store
     */
    public function destroy(Store $store)
    {
        $this->storeService->deleteStore($store);

        return redirect()
            ->route('admin.store.index')
            ->with('success', 'Store deleted successfully');
    }

    /**
     * Get stats for API (for dashboard)
     */
    public function getStats()
    {
        $stats = [
            'total_shops' => Store::count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('payment_status', 'paid')
                ->sum('total_ugx'),
            'growth_percentage' => $this->calculateGrowthPercentage(),
        ];

        return response()->json($stats);
    }

    /**
     * Get shops for API
     */
    public function getShops(Request $request)
    {
        $shops = Store::with('user:id,display_name,email,avatar')
            ->withCount('products')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('display_name', 'like', "%{$search}%");
                    });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->name,
                    'slug' => $store->slug,
                    'status' => $store->status,
                    'products_count' => $store->products_count,
                    'total_sales' => $store->total_orders ?? 0,
                    'total_revenue' => $store->total_revenue ?? 0,
                    'logo_url' => $store->logo_url,
                    'created_at' => $store->created_at,
                    'user' => [
                        'id' => $store->user->id,
                        'name' => $store->user->name,
                        'avatar_url' => $store->user->avatar_url ?? '/images/default-avatar.svg',
                    ],
                ];
            });

        return response()->json(['data' => $shops]);
    }

    /**
     * Get products for API
     */
    public function getProducts(Request $request)
    {
        $products = Product::with('store:id,name')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->store_id, function ($query, $storeId) {
                $query->where('store_id', $storeId);
            })
            ->latest()
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price_ugx' => $product->price_ugx ?? $product->price ?? 0,
                    'status' => $product->status,
                    'stock_quantity' => $product->stock_quantity ?? 0,
                    'image_url' => $product->featured_image ?? '/images/placeholder-product.jpg',
                    'category' => $product->category->name ?? 'Uncategorized',
                    'store' => [
                        'id' => $product->store->id,
                        'name' => $product->store->name,
                    ],
                ];
            });

        return response()->json(['data' => $products]);
    }

    /**
     * Get orders for API
     */
    public function getOrders(Request $request)
    {
        $orders = Order::with('store:id,name', 'buyer:id,display_name,email')
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'total_ugx' => $order->total_ugx ?? 0,
                    'created_at' => $order->created_at,
                    'store' => [
                        'id' => $order->store->id,
                        'name' => $order->store->name,
                    ],
                    'buyer' => [
                        'id' => $order->buyer->id,
                        'name' => $order->buyer->name,
                        'email' => $order->buyer->email,
                    ],
                ];
            });

        return response()->json(['data' => $orders]);
    }

    /**
     * Export data
     */
    public function export()
    {
        // Implementation for data export
        return response()->json(['message' => 'Export functionality coming soon']);
    }

    /**
     * Calculate growth percentage for stats
     */
    private function calculateGrowthPercentage(): float
    {
        $currentMonth = Store::whereBetween('created_at', [
            now()->startOfMonth(),
            now()->endOfMonth()
        ])->count();

        $lastMonth = Store::whereBetween('created_at', [
            now()->subMonth()->startOfMonth(),
            now()->subMonth()->endOfMonth()
        ])->count();

        if ($lastMonth === 0) {
            return $currentMonth > 0 ? 100 : 0;
        }

        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 1);
    }
}
