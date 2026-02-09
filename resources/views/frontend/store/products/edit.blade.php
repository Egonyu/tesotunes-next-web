@extends('frontend.layouts.store')
@section('title', 'Edit Product')
@section('content')
<div class="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white py-8">
    <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-8">Edit Product</h1>
        <form action="{{ route('frontend.store.products.update', [$store ?? $product->store, $product]) }}" method="POST" enctype="multipart/form-data" class="space-y-6">
            @csrf
            @method('PUT')
            <div class="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <input type="text" name="name" value="{{ $product->name }}" required class="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 text-gray-900 dark:text-white">
                <textarea name="description" required rows="4" class="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 text-gray-900 dark:text-white">{{ $product->description }}</textarea>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <input type="number" name="price_ugx" value="{{ $product->price_ugx }}" required class="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <input type="number" name="stock_quantity" value="{{ $product->stock_quantity }}" required class="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                </div>
                <img src="{{ $product->image_url }}" class="w-32 h-32 object-cover rounded-lg mb-4">
                <input type="file" name="image" accept="image/*" class="w-full">
            </div>
            <div class="flex justify-between">
                <button type="button" onclick="if(confirm('Delete this product?')) document.getElementById('delete-form').submit();" class="text-red-500 hover:text-red-400">Delete Product</button>
                <button type="submit" class="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-bold text-white">Save Changes</button>
            </div>
        </form>
        <form id="delete-form" action="{{ route('frontend.store.products.destroy', [$store ?? $product->store, $product]) }}" method="POST" class="hidden">
            @csrf
            @method('DELETE')
        </form>
    </div>
</div>
@endsection
