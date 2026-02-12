"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface ProductsFilters {
  searchQuery?: string;
  category?: string;
}

function getDefaultProducts(): Product[] {
  return [
    {
      id: "1",
      name: "TesoTunes Premium T-Shirt",
      description: "High-quality cotton t-shirt with logo",
      price: 29.99,
      originalPrice: 39.99,
      image: "/images/products/tshirt.jpg",
      category: "merchandise",
      rating: 4.8,
      reviews: 124,
      inStock: true,
    },
    {
      id: "2",
      name: "Artist Album Bundle",
      description: "Collection of 5 top albums",
      price: 49.99,
      image: "/images/products/album-bundle.jpg",
      category: "music",
      rating: 4.9,
      reviews: 89,
      inStock: true,
    },
    {
      id: "3",
      name: "VIP Concert Ticket",
      description: "Front row access to live events",
      price: 199.99,
      image: "/images/products/ticket.jpg",
      category: "tickets",
      rating: 5.0,
      reviews: 45,
      inStock: true,
    },
    {
      id: "4",
      name: "Wireless Headphones",
      description: "Premium studio-quality headphones",
      price: 149.99,
      originalPrice: 199.99,
      image: "/images/products/headphones.jpg",
      category: "equipment",
      rating: 4.7,
      reviews: 256,
      inStock: true,
    },
    {
      id: "5",
      name: "TesoTunes Hoodie",
      description: "Comfortable hoodie for music lovers",
      price: 59.99,
      image: "/images/products/hoodie.jpg",
      category: "merchandise",
      rating: 4.6,
      reviews: 78,
      inStock: true,
    },
    {
      id: "6",
      name: "Digital Album Download",
      description: "High-quality FLAC download",
      price: 9.99,
      image: "/images/products/digital-album.jpg",
      category: "music",
      rating: 4.8,
      reviews: 312,
      inStock: true,
    },
    {
      id: "7",
      name: "Festival Pass 2026",
      description: "Access to all summer festivals",
      price: 299.99,
      originalPrice: 399.99,
      image: "/images/products/festival.jpg",
      category: "tickets",
      rating: 4.9,
      reviews: 67,
      inStock: false,
    },
    {
      id: "8",
      name: "Portable Speaker",
      description: "Bluetooth speaker with 20hr battery",
      price: 79.99,
      image: "/images/products/speaker.jpg",
      category: "equipment",
      rating: 4.5,
      reviews: 189,
      inStock: true,
    },
  ];
}

export function useStoreProducts(filters?: ProductsFilters) {
  return useQuery({
    queryKey: ["store-products", filters?.searchQuery, filters?.category],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.searchQuery) params.append("search", filters.searchQuery);
        if (filters?.category && filters.category !== "all") {
          params.append("category", filters.category);
        }
        const queryString = params.toString();
        const endpoint = queryString
          ? `/api/store/products?${queryString}`
          : "/api/store/products";
        const res = await apiGet<{ data: Product[] }>(endpoint);
        return res.data;
      } catch {
        // Fallback to default products when API unavailable
        let products = getDefaultProducts();

        if (filters?.category && filters.category !== "all") {
          products = products.filter((p) => p.category === filters.category);
        }

        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          products = products.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.description.toLowerCase().includes(query)
          );
        }

        return products;
      }
    },
  });
}
