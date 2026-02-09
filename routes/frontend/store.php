<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend Store Routes (Legacy - Redirects to Esokoni)
|--------------------------------------------------------------------------
|
| These routes maintain backward compatibility for the old /store URLs.
| All main functionality has moved to /esokoni (marketplace).
|
| Old URL                    -> New URL
| /store                     -> /esokoni
| /store/products            -> /esokoni/products
| /store/seller/promotions   -> /esokoni/promotions
| /store/promotions          -> /esokoni/promotions
|
*/

// Main redirects to esokoni
Route::prefix('store')->name('frontend.store.')->group(function () {
    
    // Main store page redirects to esokoni
    Route::get('/', fn() => redirect()->route('esokoni.index', [], 301))->name('index');
    
    // Products redirect
    Route::get('/products', fn() => redirect()->route('esokoni.products.index', [], 301))->name('products.index');
    Route::get('/products/{product}', fn($product) => redirect()->route('esokoni.products.show', $product, 301))->name('products.show');
    
    // Promotions redirects (both paths)
    Route::get('/promotions', fn() => redirect()->route('esokoni.promotions.index', [], 301))->name('promotions.index');
    Route::get('/seller/promotions', fn() => redirect()->route('esokoni.promotions.index', [], 301))->name('seller.promotions.index');
    Route::get('/seller/promotions/create', fn() => redirect()->route('esokoni.my-promotions.create', [], 301))->name('seller.promotions.create');
    
    // Store views (still works, redirects to esokoni store view)
    Route::get('/stores/{store:slug}', fn($store) => redirect()->route('esokoni.store.show', $store, 301))->name('show');
});

// Authenticated store routes - also redirect to esokoni
Route::middleware(['auth'])->prefix('store')->name('frontend.store.')->group(function () {
    
    // Store dashboard redirect (for backward compatibility)
    Route::get('/dashboard/{store?}', fn($store = null) => redirect()->route('esokoni.my-store.index', [], 301))->name('dashboard');
    
    // My stores redirect
    Route::get('/my-stores', fn() => redirect()->route('esokoni.my-store.index', [], 301))->name('my-stores');
    
    // Store creation redirect
    Route::get('/create', fn() => redirect()->route('esokoni.my-store.create', [], 301))->name('create');
    
    // Checkout redirects
    Route::get('/cart', fn() => redirect()->route('esokoni.cart.index', [], 301))->name('cart');
    
    // Checkout redirects
    Route::get('/checkout', fn() => redirect()->route('esokoni.checkout', [], 301))->name('checkout');
    Route::get('/checkout/shipping', fn() => redirect()->route('esokoni.checkout.shipping', [], 301))->name('checkout.shipping');
    
    // Orders redirect
    Route::get('/orders', fn() => redirect()->route('esokoni.orders.index', [], 301))->name('orders.index');
    Route::get('/orders/{order}', fn($order) => redirect()->route('esokoni.orders.show', $order, 301))->name('orders.show');
});

// Digital Download Route (kept here for backward compatibility)
Route::middleware(['auth'])->get('/store/download/{product}/{asset}', function ($product, $asset, \Illuminate\Http\Request $request) {
    $digitalAsset = \App\Modules\Store\Models\ProductDigitalAsset::where('product_id', $product)
        ->where('id', $asset)
        ->firstOrFail();
    
    // Verify access key
    if ($request->get('key') !== $digitalAsset->access_key) {
        abort(403, 'Invalid download key');
    }
    
    // Check download limits if applicable
    if ($digitalAsset->hasDownloadLimit() && $digitalAsset->download_count >= $digitalAsset->download_limit) {
        abort(403, 'Download limit exceeded');
    }
    
    // Increment download count
    $digitalAsset->increment('download_count');
    
    // Return file download
    return response()->download(storage_path('app/' . $digitalAsset->file_path), $digitalAsset->file_name);
})->name('store.download');
