"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Edit, Eye, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Checkbox,
} from "@/components/ui/";
import { useProductsFilter } from "./ProductFilterContext";
import { allProducts } from "./ProductData";

export function ProductsTablePaginated() {
  const {
    filters,
    isFiltersApplied,
    selectedProducts,
    toggleProductSelection,
    selectAllProducts,
  } = useProductsFilter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = useMemo(() => {
    if (!isFiltersApplied) return allProducts;

    return allProducts.filter((product) => {
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
  }, [filters, isFiltersApplied]);

  const sortedProducts = useMemo(() => {
    if (!isFiltersApplied) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
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
  }, [filteredProducts, filters.sortBy, isFiltersApplied]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handle select all for current page
  const handleSelectAllInPage = (checked: boolean) => {
    if (checked) {
      const currentPageIds = paginatedProducts.map((product) => product.id);
      const newSelected = [...selectedProducts];

      // Add all current page IDs that aren't already selected
      currentPageIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });

      selectAllProducts(newSelected);
    } else {
      // Remove all current page IDs from selection
      const currentPageIds = paginatedProducts.map((product) => product.id);
      const newSelected = selectedProducts.filter(
        (id) => !currentPageIds.includes(id)
      );
      selectAllProducts(newSelected);
    }
  };

  // Check if all products in current page are selected
  const areAllInPageSelected = paginatedProducts.every((product) =>
    selectedProducts.includes(product.id)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-hidden border rounded-md">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={areAllInPageSelected}
                    onCheckedChange={handleSelectAllInPage}
                    aria-label="Select all products"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() =>
                          toggleProductSelection(product.id)
                        }
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.category}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.inventory > 0 ? (
                        <span>{product.inventory} in stock</span>
                      ) : (
                        <span className="text-red-500">Out of Stock</span>
                      )}
                    </TableCell>
                    <TableCell>{product.color}</TableCell>
                    <TableCell>{product.priceFormatted}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{product.rating.toFixed(1)}</span>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-gray-500">
                          ({product.votes} votes)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing{" "}
          {paginatedProducts.length > 0
            ? (currentPage - 1) * itemsPerPage + 1
            : 0}{" "}
          to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of{" "}
          {sortedProducts.length} products
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 mx-0.5"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-1">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 mx-0.5"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
