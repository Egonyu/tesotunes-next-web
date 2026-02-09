<?php

namespace App\Http\Controllers\Frontend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Order;
use App\Modules\Store\Models\Product;
use App\Modules\Store\Services\OrderService;
use App\Modules\Store\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    protected $orderService;
    protected $cartService;

    public function __construct(OrderService $orderService, CartService $cartService)
    {
        $this->orderService = $orderService;
        $this->cartService = $cartService;
    }

    /**
     * Display user orders
     */
    public function index(Request $request)
    {
        $orders = Auth::user()->storeOrders()
            ->with('store', 'items.product')
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(15);

        return view('frontend.store.orders.index', compact('orders'));
    }

    /**
     * Show order details
     */
    public function show(Order $order)
    {
        $this->authorize('view', $order);

        $order->load('store', 'items.product', 'transactions');

        return view('frontend.store.orders.show', compact('order'));
    }

    /**
     * Show order confirmation page after successful checkout
     */
    public function confirmation(Order $order)
    {
        $this->authorize('view', $order);

        $order->load('items.product.artist', 'transactions');

        return view('frontend.store.order-confirmation', compact('order'));
    }

    /**
     * Show checkout page - Step 1: Payment Method
     */
    public function checkout(Request $request)
    {
        // Get user's active cart
        $cart = \App\Modules\Store\Models\Cart::where('user_id', Auth::id())
            ->where('status', 'active')
            ->with('items.product.store')
            ->first();

        if (!$cart || $cart->isEmpty()) {
            return redirect()
                ->route('frontend.store.cart')
                ->with('error', 'Your cart is empty');
        }

        $cartItems = $cart->items;
        $itemCount = $cart->items_count;
        $subtotal = $cart->total_ugx;
        $shipping = 5000; // Fixed shipping for now
        $total_ugx = $subtotal + $shipping;
        $total_credits = $cart->total_credits;

        return view('frontend.store.checkout-payment', compact(
            'cartItems', 
            'itemCount', 
            'subtotal', 
            'shipping', 
            'total_ugx', 
            'total_credits'
        ));
    }

    /**
     * Show checkout shipping page - Step 2: Shipping Information
     */
    public function checkoutShipping(Request $request)
    {
        $cart = \App\Modules\Store\Models\Cart::where('user_id', Auth::id())
            ->where('status', 'active')
            ->with('items.product.store')
            ->first();

        if (!$cart || $cart->isEmpty()) {
            return redirect()
                ->route('frontend.store.cart')
                ->with('error', 'Your cart is empty');
        }

        $cartItems = $cart->items;
        $subtotal = $cart->total_ugx;
        $shipping = 5000;
        $total = $subtotal + $shipping;
        
        // Load user addresses
        $addresses = Auth::user()->addresses;

        return view('frontend.store.checkout-shipping', compact(
            'cartItems',
            'subtotal',
            'shipping',
            'total',
            'addresses'
        ));
    }

    /**
     * Show checkout review page - Step 3: Review & Confirm
     */
    public function checkoutReview(Request $request)
    {
        $cart = \App\Modules\Store\Models\Cart::where('user_id', Auth::id())
            ->where('status', 'active')
            ->with('items.product.store')
            ->first();

        if (!$cart || $cart->isEmpty()) {
            return redirect()
                ->route('frontend.store.cart')
                ->with('error', 'Your cart is empty');
        }

        $cartItems = $cart->items;
        $subtotal = $cart->total_ugx;
        $shipping = 5000; // Will be dynamic from shipping selection
        $platformFee = round($subtotal * 0.07); // 7% platform fee
        $total = $subtotal + $shipping + $platformFee;

        return view('frontend.store.checkout-review', compact(
            'cartItems',
            'subtotal',
            'shipping',
            'platformFee',
            'total'
        ));
    }

    /**
     * Process order
     */
    public function processOrder(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:mobile_money,credits,split',
            'payment_details' => 'nullable|array',
            'payment_details.split_ratio' => 'nullable|integer|min:0|max:100',
            'shipping' => 'required|array',
            'shipping.full_name' => 'required|string',
            'shipping.phone' => 'required|string',
            'shipping.address' => 'required|string',
            'shipping.address_line_2' => 'nullable|string',
            'shipping.city' => 'required|string',
            'shipping.region' => 'required|string',
            'shipping.postal_code' => 'nullable|string',
            'shipping.shipping_method' => 'required|in:standard,express',
            'shipping.shipping_cost' => 'required|integer',
            'shipping.notes' => 'nullable|string',
            'agreed_to_terms' => 'required|accepted',
        ]);

        try {
            // Check if user has sufficient credits for credit payment
            if (in_array($validated['payment_method'], ['credit', 'credits'])) {
                $cart = $this->cartService->getCart();
                $totalCreditsNeeded = 0;
                foreach ($cart as $item) {
                    $product = \App\Modules\Store\Models\Product::find($item['product_id']);
                    if ($product) {
                        $totalCreditsNeeded += ($product->price_credits ?? 0) * $item['quantity'];
                    }
                }
                
                if (Auth::user()->credits < $totalCreditsNeeded) {
                    return back()
                        ->withInput()
                        ->with('error', 'Insufficient credits. You need ' . $totalCreditsNeeded . ' credits but only have ' . Auth::user()->credits . '.');
                }
            }
            
            $order = $this->orderService->createOrder(Auth::user(), $validated);

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'redirect_url' => route('frontend.store.orders.confirmation', $order)
            ]);
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel order
     */
    public function cancel(Order $order)
    {
        $this->authorize('cancel', $order);

        $this->orderService->cancelOrder($order);

        return back()->with('success', 'Order cancelled successfully');
    }

    /**
     * Confirm order received (buyer)
     */
    public function confirmReceived(Order $order)
    {
        // Only the buyer can confirm receipt
        if (Auth::id() !== $order->user_id) {
            abort(403, 'Only the buyer can confirm receipt of this order.');
        }

        // Order must be shipped or processing
        if (!in_array($order->status, ['shipped', 'processing', 'delivered'])) {
            return back()->with('error', 'Order cannot be confirmed in current status.');
        }

        $this->orderService->confirmOrderReceived($order);

        return back()->with('success', 'Order confirmed as received');
    }

    /**
     * Update tracking information (store owner)
     */
    public function updateTracking(Request $request, Order $order)
    {
        // Authorize - only store owner can update tracking
        $this->authorize('update', $order->store);

        $validated = $request->validate([
            'tracking_number' => 'required|string|max:255',
            'shipping_provider' => 'nullable|string|max:255',
        ]);

        $order->update([
            'tracking_number' => $validated['tracking_number'],
            'shipping_provider' => $validated['shipping_provider'] ?? null,
            'status' => 'shipped',
            'shipped_at' => now(),
        ]);

        // Notify the buyer about shipping
        if ($order->user) {
            \App\Models\Notification::createForUser(
                $order->user,
                'order_shipped',
                'Your Order Has Been Shipped!',
                'Your order #' . $order->order_number . ' has been shipped. Tracking: ' . $validated['tracking_number'],
                [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'tracking_number' => $validated['tracking_number'],
                    'shipping_provider' => $validated['shipping_provider'] ?? null,
                ],
                route('frontend.store.orders.track', $order)
            );
        }

        return redirect()->back()->with('success', 'Tracking information updated successfully');
    }

    /**
     * Track order
     */
    public function track(Order $order)
    {
        $this->authorize('view', $order);

        $trackingInfo = $this->orderService->getTrackingInfo($order);

        return view('frontend.store.orders.track', compact('order', 'trackingInfo'));
    }
}
