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
import type { Product } from "@/type/product";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { OverviewTabs } from "@/components/Comparison/Tabs/OverviewTab";
import { SpecificationsTable } from "@/components/Comparison/Tabs/SpecificationTab";
import { ProductSelector } from "@/components/Comparison/ProductSelector";
import { TypographyH1 } from "@/components/ui/Typography";
import { BarChart3 } from "lucide-react";
import { AISmartComparison } from "@/components/AISmartComparison";
interface AIInsight {
  type: "recommendation" | "analysis" | "warning" | "tip";
  title: string;
  content: string;
  icon: "brain" | "lightbulb" | "trending" | "alert";
}
interface AIComparisonResult {
  summary: string;
  keyDifferences: string[];
  recommendations: string[];
  useCases: { product: string; useCase: string; reason: string }[];
  costAnalysis: string;
  insights: AIInsight[];
}
export default function CompareProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [aiResult, setAiResult] = useState<AIComparisonResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const productIds = searchParams
        ? [...new Set(searchParams.getAll("products"))]
        : [];
      if (productIds.length === 0) {
        setLoading(false);
        return;
      }
      const originalIds = searchParams ? searchParams.getAll("products") : [];
      if (originalIds.length !== productIds.length) {
        const params = new URLSearchParams();
        productIds.forEach((id) => params.append("products", id));
        router.replace(`/compare?${params.toString()}`);
      }

      const { data, error } = await supabase.from("products").select(`
        *,
        product_images(image_url)
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

  // Clear AI analysis when comparedProducts change
  useEffect(() => {
    setAiResult(null);
    setAiError(null);
    setAiLoading(false);
  }, [comparedProducts]);

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

  const generateAIComparison = async () => {
    if (comparedProducts.length < 2) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai-comparison", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: comparedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            grade: product.grade,
            product_type: product.product_type,
            category: product.category,
            normal_price: product.normal_price,
            pump_price: product.pump_price,
            tremie_1_price: product.tremie_1_price,
            tremie_2_price: product.tremie_2_price,
            tremie_3_price: product.tremie_3_price,
            unit: product.unit,
            stock_quantity: product.stock_quantity,
            keywords: product.keywords,
            mortar_ratio: product.mortar_ratio,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI comparison");
      }

      const result = await response.json();
      setAiResult(result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAiLoading(false);
    }
  };

  const clearAIAnalysis = () => {
    setAiResult(null);
    setAiError(null);
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="container mx-auto px-4 pt-0 pb-4">
        <TypographyH1 className="my-8">COMPARE OUR PRODUCTS</TypographyH1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 w-full min-w-0">
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
                  <BarChart3 className="w-12 h-12 text-gray-400" />
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
          <>
            <ProductSelector
              products={products}
              comparedProducts={comparedProducts}
              onProductChange={changeProductAtIndex}
            />

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6 w-full max-w-lg">
                <TabsTrigger value="overview" className="flex-1">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="specifications" className="flex-1">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="ai-analysis" className="flex-1">
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <OverviewTabs
                  comparedProducts={comparedProducts}
                  onRemove={removeProductFromCompare}
                />
              </TabsContent>

              <TabsContent value="specifications" className="mt-0">
                <div className="w-full overflow-x-auto">
                  <SpecificationsTable products={comparedProducts} />
                </div>
              </TabsContent>

              <TabsContent value="ai-analysis" className="mt-0">
                <AISmartComparison
                  comparedProducts={comparedProducts}
                  aiResult={aiResult}
                  loading={aiLoading}
                  error={aiError}
                  onGenerate={generateAIComparison}
                  onClear={clearAIAnalysis}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
