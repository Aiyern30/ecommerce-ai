"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
} from "@/components/ui/";
import { PricingTab } from "@/components/Comparison/Tabs/PricingTab";
import type { Product } from "@/type/product";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ComparisonProductCard } from "@/components/Comparison/ComparisonProductCard";
import { OverviewTabs } from "@/components/Comparison/Tabs/OverviewTab";
import { SpecificationsTable } from "@/components/Comparison/Tabs/SpecificationTab";
import { TypographyH1 } from "@/components/ui/Typography";
import { BarChart3 } from "lucide-react";

export default function CompareProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      const productIds = [...new Set(searchParams.getAll("products"))];

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      const originalIds = searchParams.getAll("products");
      if (originalIds.length !== productIds.length) {
        const params = new URLSearchParams();
        productIds.forEach((id) => params.append("products", id));
        router.replace(`/compare?${params.toString()}`);
      }

      const { data, error } = await supabase.from("products").select(`
        *,
        product_images(image_url),
        product_certificates(certificate),
        product_tags(tags(name))
      `);

      if (error) {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
      } else {
        setProducts(data || []);
        const selectedProducts = (data || []).filter((p) =>
          productIds.includes(p.id)
        );
        setComparedProducts(selectedProducts);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [searchParams, router]);

  const updateURL = (productIds: string[]) => {
    const uniqueIds = [...new Set(productIds)];
    const params = new URLSearchParams();
    uniqueIds.forEach((id) => params.append("products", id));
    router.replace(`/compare?${params.toString()}`);
  };

  const removeProductFromCompare = (id: string) => {
    const newIds = comparedProducts.filter((p) => p.id !== id).map((p) => p.id);
    if (newIds.length < 2) {
      router.push("/products");
    } else {
      setComparedProducts((prev) => prev.filter((p) => p.id !== id));
      updateURL(newIds);
    }
  };

  const changeProductAtIndex = (index: number, newProductId: string) => {
    const currentIds = comparedProducts.map((p) => p.id);
    if (
      currentIds.includes(newProductId) &&
      currentIds[index] !== newProductId
    ) {
      toast.error(
        "This product is already being compared. Please select a different product."
      );
      return;
    }

    const newIds = [...currentIds];
    newIds[index] = newProductId;
    const newProducts = products.filter((p) => newIds.includes(p.id));

    const orderedProducts = newIds
      .map((id) => newProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    setComparedProducts(orderedProducts);
    updateURL(newIds);
  };

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-64px)] flex flex-col">
      <TypographyH1 className="mb-8 mt-14">COMPARE OUR PRODUCTS</TypographyH1>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 w-full">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : comparedProducts.length === 0 ? (
        <div className="text-center py-16 flex-1 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <BarChart3 className="w-12 h-12 text-gray-400" />{" "}
                {/* ✅ lucide icon */}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Products to Compare
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven&apos;t selected any products to compare yet. Browse
                our products and select items to start comparing.
              </p>
              <Button
                onClick={() => router.push("/products")}
                className="inline-flex items-center gap-2"
              >
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 flex-1 flex flex-col">
            <OverviewTabs
              products={products}
              comparedProducts={comparedProducts}
              onProductChange={changeProductAtIndex}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
              {comparedProducts.map((product, index) => (
                <ComparisonProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  onRemove={() => removeProductFromCompare(product.id)}
                  showRemove={comparedProducts.length > 2}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-0">
            <SpecificationsTable products={comparedProducts} />
          </TabsContent>

          <TabsContent value="features" className="mt-0">
            <div className="text-center py-8">
              <p className="text-gray-500">
                Features comparison coming soon...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="mt-0">
            <PricingTab
              products={comparedProducts}
              itemCount={comparedProducts.length.toString() as "2" | "3" | "4"}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
