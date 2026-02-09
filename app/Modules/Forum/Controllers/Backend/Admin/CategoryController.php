<?php

namespace App\Modules\Forum\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Modules\Forum\ForumCategory;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display all forum categories
     */
    public function index(): View
    {
        $categories = ForumCategory::withCount(['topics', 'activeTopics'])
            ->orderBy('sort_order')
            ->get();
        
        return view('modules.forum.backend.admin.categories.index', compact('categories'));
    }

    /**
     * Show form to create a new category
     */
    public function create(): View
    {
        return view('modules.forum.backend.admin.categories.create');
    }

    /**
     * Store a new category
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:forum_categories,name',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'sort_order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);
        
        // Generate slug from name
        $validated['slug'] = Str::slug($validated['name']);
        
        // Set defaults
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['color'] = $validated['color'] ?? '#6366f1';
        
        ForumCategory::create($validated);
        
        return redirect()
            ->route('admin.modules.forum.categories.index')
            ->with('success', 'Category created successfully!');
    }

    /**
     * Show form to edit a category
     */
    public function edit(ForumCategory $category): View
    {
        return view('modules.forum.backend.admin.categories.edit', compact('category'));
    }

    /**
     * Update a category
     */
    public function update(Request $request, ForumCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:forum_categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);
        
        // Update slug if name changed
        if (isset($validated['name']) && $validated['name'] !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        $category->update($validated);
        
        return redirect()
            ->route('admin.modules.forum.categories.index')
            ->with('success', 'Category updated successfully!');
    }

    /**
     * Delete a category
     */
    public function destroy(ForumCategory $category): RedirectResponse
    {
        // Check if category has topics
        if ($category->topics()->count() > 0) {
            return back()->withErrors([
                'category' => 'Cannot delete category with existing topics. Please reassign or delete topics first.'
            ]);
        }
        
        $category->delete();
        
        return redirect()
            ->route('admin.modules.forum.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
