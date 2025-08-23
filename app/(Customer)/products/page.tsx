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
import { Product } from "@/type/product";

interface ProductSelection {
  id: string;
  priceType: string;
}

function getDeliveryOptions(product: Product) {
  return [
    product.normal_price != null
      ? { key: "normal", label: "Normal Delivery" }
      : null,
    product.pump_price != null ? { key: "pump", label: "Pump Delivery" } : null,
    product.tremie_1_price != null
      ? { key: "tremie_1", label: "Tremie 1" }
      : null,
    product.tremie_2_price != null
      ? { key: "tremie_2", label: "Tremie 2" }
      : null,
    product.tremie_3_price != null
      ? { key: "tremie_3", label: "Tremie 3" }
      : null,
  ].filter(Boolean) as { key: string; label: string }[];
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Helper to get selected IDs for backward compatibility
  const selectedIds = selectedProducts.map((p) => p.id);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          product_images(
            id,
            image_url,
            is_primary,
            sort_order
          )
        `
        )
        .eq("status", "published")
        .gt("stock_quantity", 5)
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

  const handleCompareToggle = (
    id: string,
    add: boolean,
    deliveryOptions?: { key: string; label: string }[]
  ) => {
    setSelectedProducts((prev) => {
      if (add) {
        if (prev.length >= 4) {
          toast.warning("You can only compare up to 4 products");
          return prev;
        }
        let priceType = "normal";
        if (deliveryOptions && deliveryOptions.length === 1) {
          priceType = deliveryOptions[0].key;
        }
        return [...prev, { id, priceType }];
      } else {
        return prev.filter((item) => item.id !== id);
      }
    });
  };

  const handlePriceTypeChange = (productId: string, newPriceType: string) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, priceType: newPriceType } : item
      )
    );
  };

  const handleCompare = () => {
    if (selectedProducts.length >= 2) {
      const params = new URLSearchParams();

      selectedProducts.forEach((product) => {
        params.append("products", product.id);
        params.append("priceType", product.priceType);
      });

      router.push(`/compare?${params.toString()}`);
    } else {
      toast.info("Select at least 2 products to compare");
    }
  };

  const clearSelection = () => setSelectedProducts([]);

  return (
    <section className="container mx-auto px-4 pt-0 pb-4">
      <TypographyH1 className="my-8">ALL PRODUCTS</TypographyH1>

      <div className="mb-4 flex gap-2">
        <Button
          onClick={handleCompare}
          disabled={selectedProducts.length < 2}
          variant="default"
          className="flex items-center gap-2"
        >
          <SlidersHorizontal
            className={`h-4 w-4 ${
              selectedProducts.length < 2
                ? "text-gray-400 dark:text-gray-500"
                : "text-white dark:text-black"
            }`}
          />
          Compare ({selectedProducts.length})
        </Button>
        <Button
          onClick={clearSelection}
          disabled={selectedProducts.length === 0}
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
            const isSelected = selectedIds.includes(product.id);
            const selectedProduct = selectedProducts.find(
              (p) => p.id === product.id
            );
            const deliveryOptions = getDeliveryOptions(product);

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
                normal_price={product.normal_price}
                pump_price={product.pump_price}
                tremie_1_price={product.tremie_1_price}
                tremie_2_price={product.tremie_2_price}
                tremie_3_price={product.tremie_3_price}
                showCompare
                isCompared={isSelected}
                onCompareToggle={(id, add) =>
                  handleCompareToggle(id, add, deliveryOptions)
                }
                compareCount={selectedProducts.length}
                selectedPriceType={
                  selectedProduct?.priceType ||
                  (deliveryOptions.length === 1
                    ? deliveryOptions[0].key
                    : "normal")
                }
                onPriceTypeChange={
                  isSelected ? handlePriceTypeChange : undefined
                }
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
