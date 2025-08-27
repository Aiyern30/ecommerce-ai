"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Lightbulb } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui/";
import { Product } from "@/type/product";
import {
  recommendationEngine,
  RecommendationGroup,
} from "@/lib/recommendations/recommendationEngine";
import { ProductCard } from "./ProductCards";

interface ProductRecommendationsProps {
  currentProduct: Product;
  className?: string;
}

export default function ProductRecommendations({
  currentProduct,
  className = "",
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Fetch all products for recommendation engine
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");

        const allProducts: Product[] = await response.json();

        // Generate recommendations
        const recs = recommendationEngine.getRecommendations(
          currentProduct,
          allProducts
        );
        setRecommendations(recs);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProduct]);

  const getGroupIcon = (title: string) => {
    if (title.includes("Upgrade")) return TrendingUp;
    if (title.includes("Budget")) return DollarSign;
    return Lightbulb;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "upsell":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "downsell":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "alternative":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getBestPrice = (product: Product) => {
    const prices = [
      product.normal_price,
      product.pump_price,
      product.tremie_1_price,
      product.tremie_2_price,
      product.tremie_3_price,
    ].filter((price) => price !== null && price !== undefined) as number[];

    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const isCartRecommendations = className.includes("cart-recommendations");

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isCartRecommendations
              ? "No Additional Recommendations"
              : "No Recommendations Available"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isCartRecommendations
              ? "You've got great items in your cart! Proceed to checkout when ready."
              : "We couldn't find any related products at the moment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {recommendations.map((group, groupIndex) => {
        const IconComponent = getGroupIcon(group.title);

        return (
          <Card
            key={groupIndex}
            className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  {isCartRecommendations
                    ? `${group.title} for Your Order`
                    : group.title}
                </CardTitle>
                <Badge className="text-xs" variant="secondary">
                  {group.products.length}{" "}
                  {group.products.length === 1 ? "item" : "items"}
                </Badge>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {isCartRecommendations
                    ? `${group.description} - Perfect additions to complement your current selection.`
                    : group.description}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.products.map((rec, index) => {
                  const product = rec.product;
                  const mainImage =
                    product.product_images?.find((img) => img.is_primary) ||
                    product.product_images?.[0];
                  const bestPrice = getBestPrice(product);

                  return (
                    <div key={index} className="relative">
                      {/* Recommendation type badge overlay */}
                      <div className="absolute top-2 right-2 z-10">
                        <Badge
                          className={`text-xs px-2 py-1 ${getTypeColor(
                            rec.type
                          )}`}
                        >
                          {rec.type === "upsell"
                            ? isCartRecommendations
                              ? "Better Option"
                              : "Upgrade"
                            : rec.type === "downsell"
                            ? isCartRecommendations
                              ? "Cost Effective"
                              : "Budget"
                            : "Alternative"}
                        </Badge>
                      </div>

                      {/* Recommendation reason tooltip/overlay */}
                      <div className="absolute bottom-2 left-2 right-2 z-10">
                        <div className="bg-black/75 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {isCartRecommendations
                            ? `Great addition: ${rec.reason}`
                            : rec.reason}
                        </div>
                      </div>

                      <div className="group">
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          price={bestPrice || 0}
                          grade={product.grade}
                          productType={product.product_type}
                          unit={product.unit}
                          stock={product.stock_quantity}
                          image={mainImage?.image_url || "/placeholder.svg"}
                          href={`/products/${product.id}`}
                          showCompare={false}
                          normal_price={product.normal_price}
                          pump_price={product.pump_price}
                          tremie_1_price={product.tremie_1_price}
                          tremie_2_price={product.tremie_2_price}
                          tremie_3_price={product.tremie_3_price}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendation reason display for mobile */}
              <div className="mt-4 space-y-2 md:hidden">
                {group.products.map((rec, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded"
                  >
                    <span className="font-medium">{rec.product.name}:</span>{" "}
                    {isCartRecommendations
                      ? `Great addition - ${rec.reason}`
                      : rec.reason}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {isCartRecommendations && (
        <div className="text-center mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> These recommendations are based on your
            current cart items and what other customers typically order
            together.
          </p>
        </div>
      )}
    </div>
  );
}
