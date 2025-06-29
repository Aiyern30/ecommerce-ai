"use client";

import { useEffect, useState } from "react";
import {
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/";
import { Button } from "@/components/ui/";
import { ComparisonHeader } from "@/components/Comparison/ComparisonHeader";
import { ComparisonSummary } from "@/components/Comparison/ComparisonSummary";
import { OverviewTab } from "@/components/Comparison/Tabs/OverviewTab";
import { PricingTab } from "@/components/Comparison/Tabs/PricingTab";
import { Product } from "@/type/product";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { supabase } from "@/lib/supabase";

export default function ComparisonPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select(
        `*,
          product_images(image_url),
          product_certificates(certificate),
          product_tags(tags(id, name))`
      );

      if (error) {
        console.error("Failed to fetch products", error);
      } else {
        setProducts(data || []);
        // Show first product by default
        if (data && data.length > 0) {
          setComparedIds([data[0].id]);
        }
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const addProductToCompare = (id: string) => {
    if (comparedIds.length < 4 && !comparedIds.includes(id)) {
      setComparedIds((prev) => [...prev, id]);
    }
  };

  const removeProductFromCompare = (id: string) => {
    setComparedIds((prev) => prev.filter((pid) => pid !== id));
  };

  const comparedProducts = products.filter((p) => comparedIds.includes(p.id));
  const selectableProducts = products.filter(
    (p) => !comparedIds.includes(p.id)
  );

  return (
    <div className="container mx-auto mb-4">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" /> {/* Header Skeleton */}
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
            itemCount={comparedIds.length.toString() as "2" | "3" | "4"}
            setItemCount={() => {}}
            showSummary={showSummary}
            setShowSummary={setShowSummary}
          />

          {showSummary && <ComparisonSummary products={comparedProducts} />}

          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <OverviewTab
                products={comparedProducts}
                itemCount={comparedIds.length.toString() as "2" | "3" | "4"}
              />
            </TabsContent>

            <TabsContent value="specs" className="mt-0">
              {/* <SpecificationsTab products={comparedProducts} /> */}
            </TabsContent>

            <TabsContent value="features" className="mt-0">
              {/* <FeaturesTab products={comparedProducts} /> */}
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <PricingTab
                products={comparedProducts}
                itemCount={comparedIds.length.toString() as "2" | "3" | "4"}
              />
            </TabsContent>
          </Tabs>

          {/* Add Product Button */}
          <div className="mt-6">
            {comparedIds.length < 4 && selectableProducts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Add another product:</p>
                <div className="flex flex-wrap gap-2">
                  {selectableProducts.map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addProductToCompare(product.id)}
                    >
                      {product.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {comparedProducts.length > 1 && (
              <div className="mt-4">
                <p className="text-sm font-semibold">Remove product:</p>
                <div className="flex flex-wrap gap-2">
                  {comparedProducts.map((product) => (
                    <Button
                      key={product.id}
                      variant="destructive"
                      size="sm"
                      onClick={() => removeProductFromCompare(product.id)}
                    >
                      {product.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
