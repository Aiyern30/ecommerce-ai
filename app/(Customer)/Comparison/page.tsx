"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/";
import { ComparisonHeader } from "@/components/Comparison/ComparisonHeader";
import { ComparisonSummary } from "@/components/Comparison/ComparisonSummary";
import { OverviewTab } from "@/components/Comparison/Tabs/OverviewTab";
// import { SpecificationsTab } from "@/components/Comparison/Tabs/SpecificationTab";
// import { FeaturesTab } from "@/components/Comparison/Tabs/FeaturesTab";
import { PricingTab } from "@/components/Comparison/Tabs/PricingTab";
import { Product } from "@/type/product";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
export default function ComparisonPage() {
  const [itemCount, setItemCount] = useState<"2" | "3" | "4">("3");
  const [showSummary, setShowSummary] = useState(false);
  const products: Product[] = [
    {
      id: "1",
      name: "Product A",
      description: "High-performance cement",
      image_url: "/placeholder.svg?height=200&width=200",
      category: "bagged",
      price: 199,
      unit: "per bag",
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Product B",
      description: "Bulk cement for construction",
      image_url: "/placeholder.svg?height=200&width=200",
      category: "bulk",
      price: 249,
      unit: "per tonne",
      stock_quantity: 80,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Product C",
      description: "Ready-mix cement for quick use",
      image_url: "/placeholder.svg?height=200&width=200",
      category: "ready-mix",
      price: 179,
      unit: "per bag",
      stock_quantity: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Product D",
      description: "Premium ultra-strength cement",
      image_url: "/placeholder.svg?height=200&width=200",
      category: "bagged",
      price: 299,
      unit: "per bag",
      stock_quantity: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const displayedProducts = products.slice(0, Number.parseInt(itemCount));

  return (
    <div className="container mx-auto mb-4">
      <div className="p-4 container mx-auto">
        <BreadcrumbNav showFilterButton={false} />
      </div>
      <ComparisonHeader
        itemCount={itemCount}
        setItemCount={setItemCount}
        showSummary={showSummary}
        setShowSummary={setShowSummary}
      />
      {showSummary && <ComparisonSummary products={displayedProducts} />}
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 ">
          <OverviewTab products={displayedProducts} itemCount={itemCount} />
        </TabsContent>

        <TabsContent value="specs" className="mt-0">
          {/* <SpecificationsTab products={displayedProducts} /> */}
        </TabsContent>

        <TabsContent value="features" className="mt-0">
          {/* <FeaturesTab products={displayedProducts} /> */}
        </TabsContent>

        <TabsContent value="pricing" className="mt-0">
          <PricingTab products={displayedProducts} itemCount={itemCount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
