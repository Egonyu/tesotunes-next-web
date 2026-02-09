"use client";

import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { StoreProductGrid } from "@/components/store/product-grid";

const categories = [
  { id: "all", name: "All Products" },
  { id: "merchandise", name: "Merchandise" },
  { id: "music", name: "Music" },
  { id: "tickets", name: "Tickets" },
  { id: "equipment", name: "Equipment" },
];

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-muted-foreground">
            Shop for merchandise, music, and more
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <StoreProductGrid
        searchQuery={searchQuery}
        category={selectedCategory}
      />
    </div>
  );
}
