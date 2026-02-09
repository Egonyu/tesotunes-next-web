<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Backend\Store\StoreManagementController;
use App\Http\Controllers\Backend\Store\OrderManagementController;
use App\Http\Controllers\Backend\Store\PromotionManagementController;
use App\Http\Controllers\Backend\Store\StoreAnalyticsController;
use App\Http\Controllers\Backend\Store\StoreSettingsController;
use App\Http\Controllers\Api\Admin\StoreApiController;

/*
|--------------------------------------------------------------------------
| Admin Store Management Routes
|--------------------------------------------------------------------------
|
| These routes handle administrative functions for the store module.
| Includes store management, order oversight, promotion approval, and analytics.
| Accessible to admin, super_admin, and finance roles.
|
*/

Route::middleware(['auth', 'role:admin,super_admin,finance'])->prefix('admin/store')->as('admin.store.')->group(function () {
    
    // =====================================================
    // JSON API ENDPOINTS (for AJAX/Alpine.js dashboard)
    // =====================================================
    Route::prefix('api')->as('api.')->group(function () {
        Route::get('/stats', [StoreApiController::class, 'stats'])->name('stats');
        Route::get('/products', [StoreApiController::class, 'products'])->name('products');
        Route::post('/products/{product}/toggle-status', [StoreApiController::class, 'toggleProductStatus'])->name('products.toggle');
        Route::delete('/products/{product}', [StoreApiController::class, 'deleteProduct'])->name('products.delete');
        Route::get('/orders', [StoreApiController::class, 'orders'])->name('orders');
        Route::post('/orders/{order}/status', [StoreApiController::class, 'updateOrderStatus'])->name('orders.status');
        Route::get('/shops', [StoreApiController::class, 'shops'])->name('shops');
        Route::post('/shops/{store}/toggle-status', [StoreApiController::class, 'toggleShopStatus'])->name('shops.toggle');
        Route::post('/shops/{store}/approve', [StoreApiController::class, 'approveShop'])->name('shops.approve');
        Route::post('/shops/{store}/suspend', [StoreApiController::class, 'suspendShop'])->name('shops.suspend');
        Route::delete('/shops/{store}', [StoreApiController::class, 'deleteShop'])->name('shops.delete');
        Route::get('/analytics', [StoreApiController::class, 'analytics'])->name('analytics');
    });
    
    // Store Settings - MUST be before wildcard /{store} route
    Route::get('/settings', [StoreSettingsController::class, 'showExistingView'])->name('settings');
    Route::put('/settings', [StoreSettingsController::class, 'update'])->name('settings.update');
    
    // Analytics & Reports - MUST be before wildcard /{store} route
    Route::get('/analytics', [StoreAnalyticsController::class, 'index'])->name('analytics');
    Route::get('/commission-report', [StoreAnalyticsController::class, 'commissionReport'])->name('commission-report');
    Route::prefix('analytics')->as('analytics.')->group(function () {
        Route::get('/revenue', [StoreAnalyticsController::class, 'revenue'])->name('revenue');
        Route::get('/products', [StoreAnalyticsController::class, 'products'])->name('products');
        Route::get('/stores', [StoreAnalyticsController::class, 'stores'])->name('stores');
        Route::get('/export', [StoreAnalyticsController::class, 'export'])->name('export');
    });
    
    // Order Management - MUST be before wildcard /{store} route
    Route::prefix('orders')->as('orders.')->group(function () {
        Route::get('/', [OrderManagementController::class, 'index'])->name('index');
        Route::get('/failed', [OrderManagementController::class, 'failed'])->name('failed');
        Route::get('/{order}', [OrderManagementController::class, 'show'])->name('show');
        Route::patch('/{order}/status', [OrderManagementController::class, 'updateStatus'])->name('update-status');
        Route::post('/{order}/refund', [OrderManagementController::class, 'refund'])->name('refund');
    });
    
    // Store Management
    Route::get('/', [StoreManagementController::class, 'index'])->name('index');
    Route::get('/create', [StoreManagementController::class, 'create'])->name('create');
    Route::post('/', [StoreManagementController::class, 'store'])->name('store');
    Route::get('/{store}', [StoreManagementController::class, 'show'])->name('show');
    Route::get('/{store}/edit', [StoreManagementController::class, 'edit'])->name('edit');
    Route::put('/{store}', [StoreManagementController::class, 'update'])->name('update');
    Route::match(['post', 'patch'], '/{store}/approve', [StoreManagementController::class, 'approve'])->name('approve');
    Route::match(['post', 'patch'], '/{store}/verify', [StoreManagementController::class, 'verify'])->name('verify');
    Route::match(['post', 'patch'], '/{store}/suspend', [StoreManagementController::class, 'suspend'])->name('suspend');
    Route::match(['post', 'patch'], '/{store}/reactivate', [StoreManagementController::class, 'reactivate'])->name('reactivate');
    Route::delete('/{store}', [StoreManagementController::class, 'destroy'])->name('destroy');

    // Product Management for Stores
    Route::prefix('/{store}/products')->as('products.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Store\ProductManagementController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Backend\Store\ProductManagementController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Backend\Store\ProductManagementController::class, 'store'])->name('store');
        Route::get('/{product}', [\App\Http\Controllers\Backend\Store\ProductManagementController::class, 'show'])->name('show');
        Route::get('/{product}/edit', [\App\Http\Controllers\Backend\Store\ProductManagementController::class, 'edit'])->name('edit');
        Route::put('/{product}', [\App\Http\Controllers\Backend\Store\ProductManagementController::class, 'update'])->name('update');
        Route::patch('/{product}/stock', [\App\Http\Controllers\Backend\Store\ProductManagementController::class, 'updateStock'])->name('update-stock');
        Route::delete('/{product}', [\App\Http\Controllers\Backend\Store\ProductManagementController::class, 'destroy'])->name('destroy');
    });
    
    // Promotion Management
    Route::prefix('promotions')->as('promotions.')->group(function () {
        Route::get('/', [PromotionManagementController::class, 'index'])->name('index');
        Route::get('/create', [PromotionManagementController::class, 'create'])->name('create');
        Route::post('/', [PromotionManagementController::class, 'store'])->name('store');
        Route::get('/{promotion}', [PromotionManagementController::class, 'show'])->name('show');
        Route::get('/{promotion}/edit', [PromotionManagementController::class, 'edit'])->name('edit');
        Route::put('/{promotion}', [PromotionManagementController::class, 'update'])->name('update');
        Route::patch('/{promotion}/approve', [PromotionManagementController::class, 'approve'])->name('approve');
        Route::patch('/{promotion}/reject', [PromotionManagementController::class, 'reject'])->name('reject');
        Route::patch('/{promotion}/deactivate', [PromotionManagementController::class, 'deactivate'])->name('deactivate');
        Route::delete('/{promotion}', [PromotionManagementController::class, 'destroy'])->name('destroy');
    });
    
    // Review Moderation
    Route::prefix('reviews')->as('reviews.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Backend\Store\ReviewManagementController::class, 'index'])->name('index');
        Route::post('/{review}/approve', [\App\Http\Controllers\Backend\Store\ReviewManagementController::class, 'approve'])->name('approve');
        Route::post('/{review}/reject', [\App\Http\Controllers\Backend\Store\ReviewManagementController::class, 'reject'])->name('reject');
        Route::delete('/{review}', [\App\Http\Controllers\Backend\Store\ReviewManagementController::class, 'destroy'])->name('destroy');
    });

});

// Route alias for backward compatibility - maps backend.store.verify to admin.store.verify
// Note: The actual verify route is defined in the admin.store. group above as admin.store.verify
