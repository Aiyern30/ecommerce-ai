"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { ProductCard } from "@/components/ProductCards";
import { FiltersSidebar } from "@/components/Category/FiltersSidebar";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export default function CategoryPage() {
  const pathname = usePathname();
  const category = pathname.split("/").pop()?.replace(/-/g, " ");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex w-64 flex-shrink-0 bg-white border-r sticky top-0 h-screen overflow-hidden">
        <FiltersSidebar
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 bg-white z-10 shadow-sm px-8 py-5">
          <BreadcrumbNav
            currentPage={category || "Category"}
            showFilterButton={true}
            onFilterClick={() => setIsFilterOpen(true)}
          />
        </div>

        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard key={i} {...product} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 pb-6">
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
    </div>
  );
}
