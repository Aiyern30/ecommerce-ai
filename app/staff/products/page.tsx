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
import { supabase } from "@/lib/supabase";
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
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import Image from "next/image";
import type { Product } from "@/type/product";
import { ProductFilters } from "@/type/Filter/ProductFilter";

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
            <TableHead>Unit</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Certificates</TableHead>
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
              <TableCell>
                <div className="h-4 w-1/4 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/4 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
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

  const itemsPerPage = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select(`
  *,
  product_images(image_url),
  product_certificates(certificate),
  product_tags(
    tags(id, name)
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
      const deleteTags = supabase
        .from("product_tags")
        .delete()
        .in("product_id", selectedProducts);

      const deleteCerts = supabase
        .from("product_certificates")
        .delete()
        .in("product_id", selectedProducts);

      const deleteImages = supabase
        .from("product_images")
        .delete()
        .in("product_id", selectedProducts);

      const [tagsErr, certsErr, imagesErr] = await Promise.all([
        deleteTags,
        deleteCerts,
        deleteImages,
      ]).then((results) => results.map((res) => res.error));

      if (tagsErr || certsErr || imagesErr) {
        throw new Error(
          tagsErr?.message || certsErr?.message || imagesErr?.message
        );
      }

      const { error: productError } = await supabase
        .from("products")
        .delete()
        .in("id", selectedProducts);

      if (productError) {
        console.error("Error deleting products:", productError.message);
        toast.error(`Error deleting products: ${productError.message}`);
      } else {
        toast.success(
          `Successfully deleted ${selectedProducts.length} product(s)!`
        );
        clearProductSelection();
        fetchProducts();
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
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

    // Filter by status
    if (filters.status !== "all" && product.status !== filters.status) {
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
                            product.image_url ||
                            "/placeholder.svg?height=48&width=48"
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
                <TableHead>Price</TableHead> <TableHead>Unit</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Certificates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      {[
                        ...(product.image_url ? [product.image_url] : []),
                        ...(product.product_images?.map(
                          (img) => img.image_url
                        ) || []),
                      ]
                        .filter((src, i, arr) => arr.indexOf(src) === i)
                        .slice(0, 4)
                        .map((src, index) => (
                          <Image
                            key={index}
                            src={src || "/placeholder.svg?height=48&width=48"}
                            alt={`${product.name} ${index + 1}`}
                            className={`absolute top-0 left-0 w-10 h-10 rounded-md object-cover border border-white shadow-sm transition-all`}
                            style={{
                              zIndex: 10 - index,
                              transform: `translateX(${index * 12}px)`,
                            }}
                            width={40}
                            height={40}
                          />
                        ))}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category || "N/A"}</TableCell>
                  <TableCell>RM {product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.unit || "N/A"}</TableCell>
                  <TableCell>{product.stock_quantity ?? "N/A"}</TableCell>
                  <TableCell>{product.grade || "N/A"}</TableCell>
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
                      {product.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.product_tags?.map((pt) => (
                        <Badge key={pt.tags.id} variant="secondary">
                          {pt.tags.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.product_certificates?.map((c) => (
                        <Badge key={c.certificate} variant="secondary">
                          {c.certificate}
                        </Badge>
                      ))}
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
