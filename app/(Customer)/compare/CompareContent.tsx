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
import { ComparisonHeader } from "@/components/Comparison/ComparisonHeader";
import { ComparisonSummary } from "@/components/Comparison/ComparisonSummary";
import { PricingTab } from "@/components/Comparison/Tabs/PricingTab";
import type { Product } from "@/type/product";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ComparisonProductCard } from "@/components/Comparison/ComparisonProductCard";
import { OverviewTabs } from "@/components/Comparison/Tabs/OverviewTab";
import { SpecificationsTable } from "@/components/Comparison/Tabs/SpecificationTab";

export default function CompareProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      // Get product IDs from URL parameters and remove duplicates
      const productIds = [...new Set(searchParams.getAll("products"))];

      if (productIds.length === 0) {
        router.push("/comparison");
        return;
      }

      // If there are duplicates in URL, clean it up
      const originalIds = searchParams.getAll("products");
      if (originalIds.length !== productIds.length) {
        const params = new URLSearchParams();
        productIds.forEach((id) => params.append("products", id));
        router.replace(`/comparison/compare?${params.toString()}`);
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
        // Filter products based on URL parameters
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
    // Remove duplicates before updating URL
    const uniqueIds = [...new Set(productIds)];
    const params = new URLSearchParams();
    uniqueIds.forEach((id) => params.append("products", id));
    router.replace(`/comparison/compare?${params.toString()}`);
  };

  const removeProductFromCompare = (id: string) => {
    const newIds = comparedProducts.filter((p) => p.id !== id).map((p) => p.id);
    if (newIds.length < 2) {
      router.push("/comparison");
    } else {
      setComparedProducts((prev) => prev.filter((p) => p.id !== id));
      updateURL(newIds);
    }
  };

  const changeProductAtIndex = (index: number, newProductId: string) => {
    // Check if the new product is already being compared
    const currentIds = comparedProducts.map((p) => p.id);
    if (
      currentIds.includes(newProductId) &&
      currentIds[index] !== newProductId
    ) {
      // Use toast instead of alert for better UX
      toast.error(
        "This product is already being compared. Please select a different product."
      );
      return;
    }

    const newIds = [...currentIds];
    newIds[index] = newProductId;
    const newProducts = products.filter((p) => newIds.includes(p.id));

    // Ensure products are in the same order as the IDs
    const orderedProducts = newIds
      .map((id) => newProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    setComparedProducts(orderedProducts);
    updateURL(newIds);
  };

  return (
    <div className="container mx-auto mb-4">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => router.push("/comparison")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Selection
        </Button>
      </div>

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
      ) : (
        <>
          <ComparisonHeader
            itemCount={comparedProducts.length.toString() as "2" | "3" | "4"}
            setItemCount={() => {}}
            showSummary={showSummary}
            setShowSummary={setShowSummary}
          />

          {showSummary && <ComparisonSummary products={comparedProducts} />}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              {/* Product Selectors - Above the cards */}
              <OverviewTabs
                products={products}
                comparedProducts={comparedProducts}
                onProductChange={changeProductAtIndex}
              />

              {/* Product Comparison Grid */}
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
                itemCount={
                  comparedProducts.length.toString() as "2" | "3" | "4"
                }
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
