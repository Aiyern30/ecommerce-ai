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
  Package,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  Badge,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Skeleton,
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import Image from "next/image";
import type { Product } from "@/type/product";
import { ProductFilters } from "@/type/Filter/ProductFilter";
import { useDeviceType } from "@/utils/useDeviceTypes";
import { formatCurrency } from "@/lib/utils/currency";

function ProductTableSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <Skeleton className="h-9 w-full sm:w-[200px]" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-full sm:w-[180px]" />
          <Skeleton className="h-9 w-full sm:w-[180px]" />
          <Skeleton className="h-9 w-full sm:w-[180px]" />
          <Skeleton className="h-9 w-full sm:w-[180px]" />
        </div>
      </div>
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-4 rounded-sm" />
              </TableHead>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Product Type</TableHead>
              <TableHead>Mortar Ratio</TableHead>
              <TableHead>Normal Price</TableHead>
              <TableHead>Pump Price</TableHead>
              <TableHead>Tremie 1 Price</TableHead>
              <TableHead>Tremie 2 Price</TableHead>
              <TableHead>Tremie 3 Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
              <TableHead>Keywords</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4 rounded-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-12 w-12 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 rounded" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-12 ml-auto rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-12 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function EmptyProductsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH3 className="text-gray-900 dark:text-gray-100 mb-2">
        No products found
      </TypographyH3>
      <TypographyP className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
        Start building your inventory by adding your first product to showcase
        to customers.
      </TypographyP>
      <Link href="/staff/products/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Your First Product
        </Button>
      </Link>
    </div>
  );
}

function NoProductResultsState({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH3 className="text-gray-900 dark:text-gray-100 mb-2">
        No matching products
      </TypographyH3>
      <TypographyP className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
        No products match your current search criteria. Try adjusting your
        filters or search terms.
      </TypographyP>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
        <Link href="/staff/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "all",
    stockStatus: "all",
    status: "all",
    sortBy: "name-asc",
    minPrice: "",
    maxPrice: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productsToDelete, setProductsToDelete] = useState<Product[]>([]);
  const { isMobile } = useDeviceType();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const itemsPerPage = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    // Remove the trailing comma in the select string!
    const { data, error } = await supabase.from("products").select(`
      *,
      product_images(
        id,
        image_url,
        alt_text,
        is_primary,
        sort_order
      )
    `);
    console.log("Fetched products:", data);

    if (error) {
      console.error("Error fetching products:", error.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key: keyof ProductFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
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

  const clearAllFilters = () => {
    setFilters({
      search: "",
      category: "all",
      stockStatus: "all",
      status: "all",
      sortBy: "name-asc",
      minPrice: "",
      maxPrice: "",
    });
    setCurrentPage(1);
  };

  const openDeleteDialog = () => {
    const productsToConfirm = products.filter((p) =>
      selectedProducts.includes(p.id)
    );
    setProductsToDelete(productsToConfirm);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProducts = async () => {
    if (selectedProducts.length === 0) return;

    setLoading(true);
    try {
      // Use your existing API route instead of direct database operations
      const deletePromises = selectedProducts.map(async (productId) => {
        const response = await fetch("/api/admin/products/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: productId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to delete product ${productId}`
          );
        }

        return response.json();
      });

      await Promise.all(deletePromises);

      toast.success(
        `Successfully deleted ${selectedProducts.length} product(s)!`
      );
      clearProductSelection();
      fetchProducts();
    } catch (error) {
      console.error("Error deleting products:", error);
      toast.error(
        error instanceof Error
          ? `Error deleting products: ${error.message}`
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

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

    // Filter by price range (use normal_price)
    const minPrice = Number.parseFloat(filters.minPrice);
    const maxPrice = Number.parseFloat(filters.maxPrice);

    if (!Number.isNaN(minPrice) && (product.normal_price ?? 0) < minPrice) {
      return false;
    }
    if (!Number.isNaN(maxPrice) && (product.normal_price ?? 0) > maxPrice) {
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

    // Filter by status
    if (filters.status !== "all" && product.status !== filters.status) {
      return false;
    }

    return true;
  });

  // Sort products (use normal_price for price sorting)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-low":
        return (a.normal_price ?? 0) - (b.normal_price ?? 0);
      case "price-high":
        return (b.normal_price ?? 0) - (a.normal_price ?? 0);
      case "stock-low":
        return (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0);
      case "stock-high":
        return (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0);
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
        <TypographyH2>Products</TypographyH2>
        <div className="flex items-center gap-2">
          <Link href="/staff/products/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Controls */}
      {isMobile ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 w-full h-9"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-4">
                <Input
                  type="search"
                  placeholder="Search by name or ID..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
                <Select
                  value={filters.category}
                  onValueChange={(value) => updateFilter("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="bagged">Bagged Cement</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.stockStatus}
                  onValueChange={(value) =>
                    updateFilter(
                      "stockStatus",
                      value as "all" | "in-stock" | "out-of-stock"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    updateFilter(
                      "status",
                      value as "all" | "draft" | "published"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    updateFilter("sortBy", value as ProductFilters["sortBy"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-low">
                      Price (Low to High)
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price (High to Low)
                    </SelectItem>
                    <SelectItem value="stock-low">
                      Stock (Low to High)
                    </SelectItem>
                    <SelectItem value="stock-high">
                      Stock (High to High)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    id="minPrice"
                    type="number"
                    step="0.01"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                  />
                  <Input
                    id="maxPrice"
                    type="number"
                    step="0.01"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearAllFilters();
                      setMobileFilterOpen(false);
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <DrawerClose asChild>
                    <Button size="sm" className="flex-1">
                      Apply
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search products by name or ID..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 w-full sm:w-auto h-9"
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
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bagged">Bagged Cement</SelectItem>
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
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => {
                updateFilter("status", value as "all" | "draft" | "published");
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => {
                updateFilter("sortBy", value as ProductFilters["sortBy"]);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9">
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
      )}

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
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={openDeleteDialog}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedProducts.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the following{" "}
                      {productsToDelete.length} product(s)? This action cannot
                      be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {productsToDelete.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 border rounded-md"
                      >
                        <Image
                          src={
                            Array.isArray(product.product_images) &&
                            product.product_images.length > 0
                              ? product.product_images[0].image_url
                              : "/placeholder.svg?height=48&width=48"
                          }
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                          priority
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
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
      ) : products.length === 0 ? (
        <EmptyProductsState />
      ) : sortedProducts.length === 0 ? (
        <NoProductResultsState onClearFilters={clearAllFilters} />
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] min-w-[50px]">
                  <Checkbox
                    checked={
                      selectedProducts.length === currentPageData.length &&
                      currentPageData.length > 0
                    }
                    onCheckedChange={toggleSelectAllProducts}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[80px] min-w-[80px]">Image</TableHead>
                <TableHead className="min-w-[160px]">Product Name</TableHead>
                <TableHead className="min-w-[200px]">Description</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[100px]">Grade</TableHead>
                <TableHead className="min-w-[120px]">Product Type</TableHead>
                <TableHead className="min-w-[120px]">Mortar Ratio</TableHead>
                <TableHead className="min-w-[120px]">Normal Price</TableHead>
                <TableHead className="min-w-[120px]">Pump Price</TableHead>
                <TableHead className="min-w-[120px]">Tremie 1 Price</TableHead>
                <TableHead className="min-w-[120px]">Tremie 2 Price</TableHead>
                <TableHead className="min-w-[120px]">Tremie 3 Price</TableHead>
                <TableHead className="min-w-[80px]">Unit</TableHead>
                <TableHead className="min-w-[80px]">Stock</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Keywords</TableHead>
                <TableHead className="text-right min-w-[100px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.map((product) => (
                <TableRow
                  key={product.id}
                  onClick={() => router.push(`/staff/products/${product.id}`)}
                  className="cursor-pointer "
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      aria-label={`Select product ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative w-16 h-12">
                      {product.product_images &&
                      product.product_images.length > 0 ? (
                        <Image
                          src={product.product_images[0].image_url}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover border border-white shadow-sm"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <Image
                          src="/placeholder.svg?height=48&width=48"
                          alt="No image"
                          className="w-10 h-10 rounded-md object-cover border border-white shadow-sm"
                          width={40}
                          height={40}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.description || "-"}</TableCell>
                  <TableCell>{product.category || "-"}</TableCell>
                  <TableCell>{product.grade || "-"}</TableCell>
                  <TableCell>{product.product_type || "-"}</TableCell>
                  <TableCell>{product.mortar_ratio || "-"}</TableCell>
                  <TableCell>
                    {product.normal_price !== null &&
                    product.normal_price !== undefined
                      ? formatCurrency(Number(product.normal_price))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {product.pump_price !== null &&
                    product.pump_price !== undefined
                      ? formatCurrency(Number(product.pump_price))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {product.tremie_1_price !== null &&
                    product.tremie_1_price !== undefined
                      ? formatCurrency(Number(product.tremie_1_price))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {product.tremie_2_price !== null &&
                    product.tremie_2_price !== undefined
                      ? formatCurrency(Number(product.tremie_2_price))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {product.tremie_3_price !== null &&
                    product.tremie_3_price !== undefined
                      ? formatCurrency(Number(product.tremie_3_price))
                      : "-"}
                  </TableCell>
                  <TableCell>{product.unit || "-"}</TableCell>
                  <TableCell>{product.stock_quantity ?? "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "published" ? "default" : "secondary"
                      }
                      className={
                        product.status === "published"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }
                    >
                      {product.status === "published"
                        ? "Published"
                        : product.status.charAt(0).toUpperCase() +
                          product.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(product.keywords) &&
                      product.keywords.length > 0 ? (
                        <>
                          {product.keywords.slice(0, 3).map((kw, idx) => (
                            <Badge
                              key={idx}
                              className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-1 text-xs font-medium"
                            >
                              {kw}
                            </Badge>
                          ))}
                          {product.keywords.length > 3 && (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-2 py-1 text-xs font-medium">
                              +{product.keywords.length - 3} more
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          No keywords
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        router.push(`/staff/products/${product.id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
