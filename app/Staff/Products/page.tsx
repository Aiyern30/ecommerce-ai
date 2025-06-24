"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter, Plus, Search } from "lucide-react";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/";
import {
  ProductsFilterProvider,
  useProductsFilter,
} from "@/components/Staff/Products/ProductFilterContext";
import { allProducts } from "@/components/Staff/Products/ProductData";
import { ExportProductsDialog } from "@/components/Staff/Products/ExportProductDialog";
import { ProductsTableFilters } from "@/components/Staff/Products/ProductTableFilter";
import { DeleteConfirmationDialog } from "@/components/Staff/Products/DeleteConfirmationDialog";
import { ProductsTablePaginated } from "@/components/Staff/Products/ProductTablePagination";

function ProductsContent() {
  const [showFilters, setShowFilters] = useState(false);
  const {
    filters,
    updateFilter,
    applyFilters,
    isFiltersApplied,
    selectedProducts,
    clearProductSelection,
  } = useProductsFilter();

  // For pagination and export
  const [currentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort products based on current filters
  const filteredProducts = allProducts.filter((product) => {
    if (!isFiltersApplied) return true;

    // Filter by search term (name or SKU)
    if (
      filters.search &&
      !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !product.sku.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Filter by category
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }

    // Filter by color
    if (filters.color !== "all" && product.color !== filters.color) {
      return false;
    }

    // Filter by price range
    if (
      filters.minPrice &&
      product.price < Number.parseFloat(filters.minPrice)
    ) {
      return false;
    }
    if (
      filters.maxPrice &&
      product.price > Number.parseFloat(filters.maxPrice)
    ) {
      return false;
    }

    // Filter by stock status
    if (filters.stockStatus === "in-stock" && product.inventory === 0) {
      return false;
    }
    if (filters.stockStatus === "out-of-stock" && product.inventory > 0) {
      return false;
    }

    // Filter by rating
    if (
      filters.minRating &&
      product.rating < Number.parseFloat(filters.minRating)
    ) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!isFiltersApplied) return 0;

    switch (filters.sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating-high":
        return b.rating - a.rating;
      case "inventory-high":
        return b.inventory - a.inventory;
      default:
        return 0;
    }
  });

  // Get current page data
  const currentPageData = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle delete products
  const handleDeleteProducts = () => {
    // In a real app, you would call an API to delete the products
    console.log(`Deleting products with IDs: ${selectedProducts.join(", ")}`);

    // For demo purposes, we'll just clear the selection
    clearProductSelection();

    // Show success message
    alert(`Successfully deleted ${selectedProducts.length} products`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          <ExportProductsDialog
            currentPageData={currentPageData}
            allFilteredData={sortedProducts}
            isFiltered={isFiltersApplied}
            selectedProducts={selectedProducts}
          />
          <Link href="/Staff/Products/New">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 bg-white"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 w-full sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filter
              {showFilters ? (
                <ChevronLeft className="ml-1 h-4 w-4" />
              ) : (
                <ChevronRight className="ml-1 h-4 w-4" />
              )}
            </Button>
            <Select
              value={filters.category}
              onValueChange={(value) => {
                updateFilter("category", value);
                applyFilters();
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="T-Shirt">T-Shirts</SelectItem>
                <SelectItem value="Hoodies">Hoodies</SelectItem>
                <SelectItem value="Jeans">Jeans</SelectItem>
                <SelectItem value="Shoes">Shoes</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.stockStatus}
              onValueChange={(value) => {
                updateFilter("stockStatus", value);
                applyFilters();
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && <ProductsTableFilters />}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedProducts.length > 0 && (
              <>
                <span className="text-sm text-gray-500">
                  {selectedProducts.length} selected
                </span>
                <DeleteConfirmationDialog
                  selectedCount={selectedProducts.length}
                  onDelete={handleDeleteProducts}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearProductSelection}
                >
                  Clear Selection
                </Button>
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {sortedProducts.length} Results
          </div>
        </div>

        <div className="w-full">
          <ProductsTablePaginated />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProductsFilterProvider>
      <ProductsContent />
    </ProductsFilterProvider>
  );
}
