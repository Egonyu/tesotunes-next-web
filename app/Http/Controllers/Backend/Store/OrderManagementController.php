<?php

namespace App\Http\Controllers\Backend\Store;

use App\Http\Controllers\Controller;
use App\Modules\Store\Models\Order;
use App\Services\Store\OrderService;
use Illuminate\Http\Request;

class OrderManagementController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Display orders management
     */
    public function index(Request $request)
    {
        $orders = Order::with('user', 'store', 'items')
            ->when($request->search, function ($query, $search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->payment_status, function ($query, $status) {
                $query->where('payment_status', $status);
            })
            ->latest()
            ->paginate(20);

        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'total_revenue' => Order::where('payment_status', 'paid')->count() * 50000, // Estimated
        ];

        return view('admin.store.orders.index', compact('orders', 'stats'));
    }

    /**
     * Display failed orders
     */
    public function failed(Request $request)
    {
        $orders = Order::with('user', 'store', 'items')
            ->where('status', 'failed')
            ->latest()
            ->paginate(20);

        return view('admin.store.orders.failed', compact('orders'));
    }

    /**
     * Show order details
     */
    public function show(Order $order)
    {
        $order->load('user', 'store', 'items', 'transactions');

        return view('admin.store.orders.show', compact('order'));
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,completed,cancelled,refunded',
            'notes' => 'nullable|string',
        ]);

        $this->orderService->updateOrderStatus($order, $validated['status'], $validated['notes'] ?? null);

        return back()->with('success', 'Order status updated successfully');
    }

    /**
     * Refund order
     */
    public function refund(Request $request, Order $order)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
            'amount' => 'nullable|numeric|min:0',
        ]);

        try {
            $this->orderService->refundOrder(
                $order,
                $validated['amount'] ?? null,
                $validated['reason']
            );

            return back()->with('success', 'Order refunded successfully');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
