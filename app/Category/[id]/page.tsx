"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { ProductCard } from "@/components/ProductCards";
import { FiltersSidebar } from "@/components/Category/FiltersSidebar";

export default function CategoryPage() {
  const pathname = usePathname(); // Get current path
  const category = pathname.split("/").pop()?.replace(/-/g, " "); // Extract last part of the path & format

  const products = [
    {
      name: "Gradient Graphic T-shirt",
      price: 145,
      rating: 3.5,
      reviews: 145,
      image: "/placeholder.svg",
    },
    {
      name: "Polo with Tipping Details",
      price: 180,
      rating: 4.5,
      reviews: 152,
      image: "/placeholder.svg",
    },
    {
      name: "Black Striped T-shirt",
      price: 120,
      originalPrice: 160,
      rating: 5.0,
      reviews: 145,
      image: "/placeholder.svg",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sticky Sidebar */}
      <FiltersSidebar />

      {/* Main Content */}
      <div className="flex-1 px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 capitalize">{category}</span>
        </div>

        {/* Product Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard key={i} {...product} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {[1, 2, 3, "...", 8, 9, 10].map((page, i) => (
            <Button key={i} variant={page === 1 ? "default" : "outline"}>
              {page}
            </Button>
          ))}
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
