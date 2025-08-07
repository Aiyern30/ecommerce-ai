"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCards";
import { Button } from "@/components/ui/";
import { SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/";
import { TypographyH1 } from "@/components/ui/Typography";

type SimpleProduct = {
  id: string;
  name: string;
  grade: string;
  product_type: string;
  unit: string | null;
  stock_quantity: number | null;
  normal_price: number | null;
  product_images:
    | {
        id: string;
        image_url: string;
        is_primary: boolean;
        sort_order: number;
      }[]
    | null;
};

export default function ProductListPage() {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          grade,
          product_type,
          unit,
          stock_quantity,
          normal_price,
          product_images(
            id,
            image_url,
            is_primary,
            sort_order
          )
        `
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load products");
        console.error(error);
      } else {
        setProducts(data || []);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const handleCompareToggle = (id: string, add: boolean) => {
    setSelectedIds((prev) => {
      if (add) {
        if (prev.length >= 4) {
          toast.warning("You can only compare up to 4 products");
          return prev;
        }
        return [...prev, id];
      } else {
        return prev.filter((item) => item !== id);
      }
    });
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      const params = new URLSearchParams();
      selectedIds.forEach((id) => params.append("products", id));
      router.push(`/compare?${params.toString()}`);
    } else {
      toast.info("Select at least 2 products to compare");
    }
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <section className="container mx-auto px-4 pt-0 pb-4">
      <TypographyH1 className="my-8">ALL PRODUCTS</TypographyH1>

      <div className="mb-4 flex gap-2">
        <Button
          onClick={handleCompare}
          disabled={selectedIds.length < 2}
          variant="default"
          className="flex items-center gap-2"
        >
          <SlidersHorizontal
            className={`h-4 w-4 ${
              selectedIds.length < 2
                ? "text-gray-400 dark:text-gray-500"
                : "text-white dark:text-black"
            }`}
          />
          Compare ({selectedIds.length})
        </Button>
        <Button
          onClick={clearSelection}
          disabled={selectedIds.length === 0}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          Clear
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const mainImage =
              product.product_images?.find((img) => img.is_primary) ||
              product.product_images?.[0];
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.normal_price ?? 0}
                grade={product.grade}
                productType={product.product_type}
                unit={product.unit}
                stock={product.stock_quantity}
                image={mainImage?.image_url ?? "/placeholder.svg"}
                href={`/products/${product.id}`}
                showCompare
                isCompared={selectedIds.includes(product.id)}
                onCompareToggle={handleCompareToggle}
                compareCount={selectedIds.length}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <Skeleton>
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </Skeleton>
  );
}
