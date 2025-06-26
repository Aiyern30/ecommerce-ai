"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import the singleton Supabase client

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/";
import Image from "next/image"; // Import Image component

// Define Product type based on your Supabase schema, including joined relations
export interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null; // Main image from products table
  category: string | null;
  price: number;
  unit: string | null;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
  // Nested relations from joins
  product_images: { image_url: string }[] | null; // Array of image objects
  product_tags: { tag: string }[] | null; // Array of tag objects
  product_certificates: { certificate: string }[] | null; // Array of certificate objects
}

// Define Filter type
interface ProductFilters {
  search: string;
  category: string;
  stockStatus: "all" | "in-stock" | "out-of-stock";
  sortBy:
    | "name-asc"
    | "name-desc"
    | "price-low"
    | "price-high"
    | "stock-low"
    | "stock-high";
  minPrice: string;
  maxPrice: string;
}

// Skeleton component for the table
function ProductTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <div className="h-4 w-4 rounded-sm bg-gray-200 animate-pulse" />
            </TableHead>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 w-4 rounded-sm bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-12 w-12 rounded-md bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/4 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-8 w-12 ml-auto rounded bg-gray-200 animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "all",
    stockStatus: "all",
    sortBy: "name-asc",
    minPrice: "",
    maxPrice: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // Stores product IDs

  const itemsPerPage = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    console.log("Fetching products...");
    // Fetch products and join related tables
    const { data, error } = await supabase
      .from("products")
      .select(
        "*, product_images(image_url), product_tags(tag), product_certificates(certificate)"
      );

    if (error) {
      console.error("Error fetching products:", error.message);
      setProducts([]);
    } else {
      console.log("Products fetched successfully:", data);
      setProducts(data || []);
    }
    setLoading(false);
    console.log("Finished fetching products. Loading state:", false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key: keyof ProductFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAllProducts = () => {
    if (
      selectedProducts.length === currentPageData.length &&
      currentPageData.length > 0
    ) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentPageData.map((product) => product.id));
    }
  };

  const clearProductSelection = () => {
    setSelectedProducts([]);
  };

  const handleDeleteProducts = async () => {
    if (selectedProducts.length === 0) return;

    setLoading(true); // Show loading while deleting
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", selectedProducts);

      if (error) {
        console.error("Error deleting products:", error.message);
        alert(`Error deleting products: ${error.message}`);
      } else {
        alert(`Successfully deleted ${selectedProducts.length} products!`);
        clearProductSelection();
        fetchProducts(); // Re-fetch products to update the list
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on current filters
  const filteredProducts = products.filter((product) => {
    // Filter by search term (name or ID)
    if (
      filters.search &&
      !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !product.id.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Filter by category
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }

    // Filter by price range
    const minPrice = Number.parseFloat(filters.minPrice);
    const maxPrice = Number.parseFloat(filters.maxPrice);

    if (!Number.isNaN(minPrice) && product.price < minPrice) {
      return false;
    }
    if (!Number.isNaN(maxPrice) && product.price > maxPrice) {
      return false;
    }

    // Filter by stock status
    if (
      filters.stockStatus === "in-stock" &&
      (product.stock_quantity === null || product.stock_quantity <= 0)
    ) {
      return false;
    }
    if (
      filters.stockStatus === "out-of-stock" &&
      (product.stock_quantity === null || product.stock_quantity > 0)
    ) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "stock-low":
        return (a.stock_quantity || 0) - (b.stock_quantity || 0);
      case "stock-high":
        return (b.stock_quantity || 0) - (a.stock_quantity || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentPageData = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          <Link href="/Products/New">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search products by name or ID..."
            className="pl-8 bg-white"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
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
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="bagged">Bagged Cement</SelectItem>
              {/* Add more categories as needed based on your data */}
            </SelectContent>
          </Select>
          <Select
            value={filters.stockStatus}
            onValueChange={(value) => {
              updateFilter(
                "stockStatus",
                value as "all" | "in-stock" | "out-of-stock"
              );
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
          <Select
            value={filters.sortBy}
            onValueChange={(value) => {
              updateFilter("sortBy", value as ProductFilters["sortBy"]);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="stock-low">Stock (Low to High)</SelectItem>
              <SelectItem value="stock-high">Stock (High to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>Refine your product search.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-0">
            <div>
              <label
                htmlFor="minPrice"
                className="block text-sm font-medium text-gray-700"
              >
                Min Price (RM)
              </label>
              <Input
                id="minPrice"
                type="number"
                step="0.01"
                placeholder="e.g., 10.00"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="maxPrice"
                className="block text-sm font-medium text-gray-700"
              >
                Max Price (RM)
              </label>
              <Input
                id="maxPrice"
                type="number"
                step="0.01"
                placeholder="e.g., 100.00"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedProducts.length > 0 && (
            <>
              <span className="text-sm text-gray-500">
                {selectedProducts.length} selected
              </span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedProducts.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete {selectedProducts.length}{" "}
                      selected products? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteProducts}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

      {loading ? (
        <ProductTableSkeleton />
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedProducts.length === currentPageData.length &&
                      currentPageData.length > 0
                    }
                    onCheckedChange={toggleSelectAllProducts}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() =>
                          toggleProductSelection(product.id)
                        }
                        aria-label={`Select product ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Image
                        src={
                          product.image_url ||
                          "/placeholder.svg?height=48&width=48"
                        }
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover"
                        width={48}
                        height={48}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category || "N/A"}</TableCell>
                    <TableCell>RM {product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock_quantity ?? "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {/* Placeholder for individual product actions */}
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
