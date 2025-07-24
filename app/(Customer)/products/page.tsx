"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, Badge, Skeleton } from "@/components/ui/";
import type { Product } from "@/type/product";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase/client";
import { Plus, Package, DollarSign, Truck, Award } from "lucide-react";
import Image from "next/image";

function ProductSelectionCard({
  product,
  isSelected,
  onToggleSelect,
  disabled,
}: {
  product: Product;
  isSelected: boolean;
  onToggleSelect: () => void;
  disabled: boolean;
}) {
  return (
    <Card
      className={`relative transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800"
          : "hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20"
      }`}
    >
      {/* Selection Badge */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 z-10">
          <Badge className="bg-blue-500 dark:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
            ✓
          </Badge>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <Image
              src={
                product.product_images?.[0]?.image_url ||
                product.image_url ||
                "/placeholder.svg"
              }
              alt={product.name}
              width={120}
              height={120}
              className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-lg bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Product Details */}
          <div className="flex-grow min-w-0">
            <h3
              className={`font-semibold text-lg mb-2 truncate ${
                isSelected
                  ? "text-blue-900 dark:text-blue-100"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {product.name}
            </h3>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {product.category || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  RM {product.price.toFixed(0)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {product.unit || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {product.stock_quantity
                    ? `${product.stock_quantity} in stock`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Tags */}
            {product.product_tags && product.product_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.product_tags.slice(0, 2).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {tag.tags.name}
                  </Badge>
                ))}
                {product.product_tags.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                  >
                    +{product.product_tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Add Button */}
          <div className="flex-shrink-0 flex items-center">
            <Button
              onClick={onToggleSelect}
              disabled={disabled && !isSelected}
              variant={isSelected ? "destructive" : "default"}
              size="icon"
              className={`rounded-full w-10 h-10 shadow-md ${
                isSelected
                  ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              }`}
            >
              {isSelected ? (
                <span className="text-lg">×</span>
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComparisonPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select(`
        *,
        product_images(image_url),
        product_certificates(certificate),
        product_tags(tags(name))
      `);

      if (error) {
        console.error("Failed to fetch products", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const toggleProductSelection = (productId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else if (prev.length < 4) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      const params = new URLSearchParams();
      selectedIds.forEach((id) => params.append("products", id));
      router.push(`/compare?${params.toString()}`);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return (
    <div className="container mx-auto mb-4">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Compare Products</h1>
        <p className="text-gray-600">
          Select up to 4 products to compare their features and specifications
        </p>
      </div>

      {/* Selection Summary */}
      {selectedIds.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                {selectedIds.length} product{selectedIds.length > 1 ? "s" : ""}{" "}
                selected
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedIds.length < 2
                  ? `Select ${2 - selectedIds.length} more product${
                      2 - selectedIds.length > 1 ? "s" : ""
                    } to compare`
                  : `Ready to compare! You can select up to ${
                      4 - selectedIds.length
                    } more.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 bg-transparent"
              >
                Clear All
              </Button>
              <Button
                onClick={handleCompare}
                disabled={selectedIds.length < 2}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Compare ({selectedIds.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-lg" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductSelectionCard
              key={product.id}
              product={product}
              isSelected={selectedIds.includes(product.id)}
              onToggleSelect={() => toggleProductSelection(product.id)}
              disabled={selectedIds.length >= 4}
            />
          ))}
        </div>
      )}

      {/* Floating Compare Button */}
      {selectedIds.length >= 2 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleCompare}
            size="lg"
            className="rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 px-6"
          >
            Compare {selectedIds.length} Products
          </Button>
        </div>
      )}
    </div>
  );
}
