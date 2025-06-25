"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/";
import { ComparisonHeader } from "@/components/Comparison/ComparisonHeader";
import { ComparisonSummary } from "@/components/Comparison/ComparisonSummary";
import { OverviewTab } from "@/components/Comparison/Tabs/OverviewTab";
import { SpecificationsTab } from "@/components/Comparison/Tabs/SpecificationTab";
import { FeaturesTab } from "@/components/Comparison/Tabs/FeaturesTab";
import { PricingTab } from "@/components/Comparison/Tabs/PricingTab";
import { Product } from "@/type/product";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
export default function ComparisonPage() {
  const [itemCount, setItemCount] = useState<"2" | "3" | "4">("3");
  const [showSummary, setShowSummary] = useState(false);
  const products: Product[] = [
    {
      id: 1,
      name: "Product A",
      price: "$199",
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=200",
      specs: {
        performance: { value: "High", score: 9 },
        battery: { value: "10 hours", score: 8 },
        storage: { value: "256GB", score: 7 },
        camera: { value: "12MP", score: 8 },
      },
      features: [
        { name: "Water resistant", available: true },
        { name: "Fast charging", available: true },
        { name: "Wireless charging", available: true },
        { name: "5G support", available: false },
      ],
    },
    {
      id: 2,
      name: "Product B",
      price: "$249",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=200",
      specs: {
        performance: { value: "Very High", score: 10 },
        battery: { value: "8 hours", score: 6 },
        storage: { value: "512GB", score: 9 },
        camera: { value: "16MP", score: 9 },
      },
      features: [
        { name: "Water resistant", available: true },
        { name: "Fast charging", available: true },
        { name: "Wireless charging", available: true },
        { name: "5G support", available: true },
      ],
    },
    {
      id: 3,
      name: "Product C",
      price: "$179",
      rating: 4.2,
      image: "/placeholder.svg?height=200&width=200",
      specs: {
        performance: { value: "Medium", score: 7 },
        battery: { value: "12 hours", score: 9 },
        storage: { value: "128GB", score: 5 },
        camera: { value: "8MP", score: 6 },
      },
      features: [
        { name: "Water resistant", available: true },
        { name: "Fast charging", available: false },
        { name: "Wireless charging", available: false },
        { name: "5G support", available: false },
      ],
    },
    {
      id: 4,
      name: "Product D",
      price: "$299",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=200",
      specs: {
        performance: { value: "Ultra", score: 10 },
        battery: { value: "14 hours", score: 10 },
        storage: { value: "1TB", score: 10 },
        camera: { value: "20MP", score: 10 },
      },
      features: [
        { name: "Water resistant", available: true },
        { name: "Fast charging", available: true },
        { name: "Wireless charging", available: true },
        { name: "5G support", available: true },
      ],
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
          <SpecificationsTab products={displayedProducts} />
        </TabsContent>

        <TabsContent value="features" className="mt-0">
          <FeaturesTab products={displayedProducts} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-0">
          <PricingTab products={displayedProducts} itemCount={itemCount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
