<?php

namespace App\Http\Controllers\Frontend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Models\Cart;
use App\Modules\Store\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Display shopping cart
     */
    public function index()
    {
        $cart = null;
        $cartItems = collect();
        $total = ['ugx' => 0, 'credits' => 0, 'money' => 0];
        $itemCount = 0;

        if (Auth::check()) {
            // Database cart for authenticated users
            // Load user with cart and nested relationships
            $user = Auth::user()->load([
                'cart.items.product.store.user',
                'cart.items.product.category'
            ]);
            
            $cart = $user->cart;
            
            if ($cart) {
                $cartItems = $cart->items;
                $total = [
                    'ugx' => $cart->total_ugx,
                    'credits' => $cart->total_credits,
                    'money' => $cart->total_ugx
                ];
                $itemCount = $cart->items_count;
            }
        } else {
            // Session cart for guests
            $cartItems = $this->cartService->getCartWithProducts();
            $total = $this->cartService->getTotal();
            $itemCount = $this->cartService->getItemCount();
        }

        return view('frontend.store.cart', compact('cart', 'cartItems', 'total', 'itemCount'));
    }

    /**
     * Add item to cart
     */
    public function add(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'sometimes|integer|min:1',
            'variant_id' => 'nullable|exists:store_product_variants,id',
            'payment_method' => 'sometimes|in:ugx,credits,hybrid',
        ]);

        // Set defaults if not provided
        $quantity = $validated['quantity'] ?? 1;
        $paymentMethod = $validated['payment_method'] ?? 'ugx'; // Changed from 'money' to 'ugx'

        try {
            // Check stock availability for physical products
            if ($product->product_type === 'physical' && $product->track_inventory) {
                if ($product->inventory_quantity < $quantity) {
                    throw new \Exception("Not enough stock available. Only {$product->inventory_quantity} items in stock.");
                }
            }
            
            if (Auth::check()) {
                // Database cart for authenticated users
                $cart = Auth::user()->cart()->firstOrCreate([
                    'user_id' => Auth::id()
                ], [
                    'session_id' => session()->getId(),
                    'status' => 'active',
                ]);

                // Check if item already exists
                $cartItem = $cart->items()->where('product_id', $product->id)->first();

                if ($cartItem) {
                    $cartItem->quantity += $quantity;
                    $cartItem->save();
                } else {
                    $cart->items()->create([
                        'product_id' => $product->id,
                        'store_id' => $product->store_id,
                        'quantity' => $quantity,
                        'price_ugx' => $product->price_ugx,
                        'price_credits' => $product->price_credits,
                        'payment_method' => $paymentMethod,
                        'options' => isset($validated['variant_id']) && $validated['variant_id'] ? ['variant_id' => $validated['variant_id']] : null,
                    ]);
                }

                $cart->markAsActive();

                if ($request->wantsJson() || $request->ajax()) {
                    // Reload cart with relationships
                    $cart->load('items.product');
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Product added to cart',
                        'cart' => [
                            'items' => $cart->items,
                            'total' => ['ugx' => $cart->total_ugx, 'credits' => $cart->total_credits],
                            'count' => $cart->items_count
                        ]
                    ]);
                }
            } else {
                // Session cart for guests
                $options = [
                    'variant_id' => $validated['variant_id'] ?? null,
                    'payment_method' => $paymentMethod
                ];

                $this->cartService->addItem(
                    $product,
                    $quantity,
                    $options
                );

                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Product added to cart',
                        'cart' => [
                            'items' => $this->cartService->getCartWithProducts(),
                            'total' => $this->cartService->getTotal(),
                            'count' => $this->cartService->getItemCount()
                        ]
                    ]);
                }
            }

            return back()->with('success', 'Product added to cart');
        } catch (\Exception $e) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 422);
            }

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update cart item
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'variant_id' => 'nullable|exists:store_product_variants,id',
            'item_id' => 'nullable|string',
        ]);

        // Generate item ID if not provided
        if (!isset($validated['item_id'])) {
            $options = [];
            if (isset($validated['variant_id']) && $validated['variant_id']) {
                $options['variant_id'] = $validated['variant_id'];
            }
            $itemId = $this->generateItemId($product, $options);
        } else {
            $itemId = $validated['item_id'];
        }

        $this->cartService->updateQuantity(
            $itemId,
            $validated['quantity']
        );

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'cart' => [
                    'items' => $this->cartService->getCartWithProducts(),
                    'total' => $this->cartService->getTotal(),
                    'count' => $this->cartService->getItemCount()
                ]
            ]);
        }

        return back()->with('success', 'Cart updated');
    }

    /**
     * Remove item from cart
     */
    public function remove(Request $request, Product $product)
    {
        $validated = $request->validate([
            'item_id' => 'nullable|string',
            'variant_id' => 'nullable|exists:store_product_variants,id',
        ]);

        // Generate item ID if not provided
        if (!isset($validated['item_id'])) {
            $options = [];
            if (isset($validated['variant_id']) && $validated['variant_id']) {
                $options['variant_id'] = $validated['variant_id'];
            }
            $itemId = $this->generateItemId($product, $options);
        } else {
            $itemId = $validated['item_id'];
        }

        $this->cartService->removeItem($itemId);

        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'cart' => [
                    'items' => $this->cartService->getCartWithProducts(),
                    'total' => $this->cartService->getTotal(),
                    'count' => $this->cartService->getItemCount()
                ]
            ]);
        }

        return back()->with('success', 'Item removed from cart');
    }
    
    /**
     * Generate unique item ID (same logic as CartService)
     */
    private function generateItemId(Product $product, array $options = []): string
    {
        $optionsHash = md5(serialize($options));
        return "product_{$product->id}_{$optionsHash}";
    }

    /**
     * Update cart item by item ID (for authenticated users)
     */
    public function updateItem(Request $request, $cartItem)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'Please login'], 401);
        }

        $cart = Auth::user()->cart;
        if (!$cart) {
            return response()->json(['success' => false, 'message' => 'Cart not found'], 404);
        }

        $item = $cart->items()->find($cartItem);
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Item not found in cart'], 404);
        }

        // Check stock for physical products
        if ($item->product && $item->product->product_type === 'physical' && $item->product->track_inventory) {
            if ($item->product->inventory_quantity < $validated['quantity']) {
                return response()->json([
                    'success' => false, 
                    'message' => "Only {$item->product->inventory_quantity} items available"
                ], 422);
            }
        }

        $item->quantity = $validated['quantity'];
        $item->save();

        // Recalculate cart totals
        $cart->refresh();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Quantity updated',
                'item_total' => $item->product->price_ugx * $item->quantity,
                'subtotal' => $cart->total_ugx,
                'total' => $cart->total_ugx,
                'cart_count' => $cart->items_count
            ]);
        }

        return back()->with('success', 'Cart updated');
    }

    /**
     * Remove cart item by item ID (for authenticated users)
     */
    public function removeItem(Request $request, $cartItem)
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'Please login'], 401);
        }

        $cart = Auth::user()->cart;
        if (!$cart) {
            return response()->json(['success' => false, 'message' => 'Cart not found'], 404);
        }

        $item = $cart->items()->find($cartItem);
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Item not found in cart'], 404);
        }

        $item->delete();

        // Recalculate cart totals
        $cart->refresh();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Item removed',
                'subtotal' => $cart->total_ugx,
                'total' => $cart->total_ugx,
                'cart_count' => $cart->items_count
            ]);
        }

        return back()->with('success', 'Item removed from cart');
    }

    /**
     * Clear entire cart
     */
    public function clear()
    {
        $this->cartService->clear();

        return back()->with('success', 'Cart cleared');
    }

    /**
     * Get cart count (AJAX)
     */
    public function count()
    {
        if (Auth::check()) {
            $cart = Auth::user()->cart()->first();
            return response()->json([
                'count' => $cart ? $cart->items_count : 0,
                'total' => $cart ? ['ugx' => $cart->total_ugx, 'credits' => $cart->total_credits, 'money' => $cart->total_ugx] : ['ugx' => 0, 'credits' => 0, 'money' => 0]
            ]);
        }
        
        return response()->json([
            'count' => $this->cartService->getItemCount(),
            'total' => $this->cartService->getTotal()
        ]);
    }
}
