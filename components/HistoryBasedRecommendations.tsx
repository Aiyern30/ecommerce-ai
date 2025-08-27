"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { ProductCard } from "./ProductCards";
import { TrendingUp, ShoppingBag, Star, Users } from "lucide-react";
import { Order } from "@/type/order";
import {
  historyBasedRecommendationEngine,
  type HistoryRecommendation,
} from "@/lib/recommendations/historyBasedRecommendations";
import { Product } from "@/type/product";

interface HistoryBasedRecommendationsProps {
  userOrders: Order[];
  className?: string;
}

const typeIcons = {
  frequently_bought: ShoppingBag,
  upgrade: TrendingUp,
  similar_customers: Users,
  category_popular: Star,
};

const typeLabels = {
  frequently_bought: "Frequently Bought",
  upgrade: "Recommended Upgrades",
  similar_customers: "Customers Also Bought",
  category_popular: "Popular in Category",
};

export default function HistoryBasedRecommendations({
  userOrders,
  className = "",
}: HistoryBasedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<
    HistoryRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (userOrders.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const recs = await historyBasedRecommendationEngine.getRecommendations(
          userOrders
        );
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userOrders]);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "frequently_bought":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "upgrade":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "similar_customers":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "category_popular":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

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
    return null;
  }

  // Group recommendations by type
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) {
      acc[rec.type] = [];
    }
    acc[rec.type].push(rec);
    return acc;
  }, {} as Record<string, HistoryRecommendation[]>);

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Recommended for You
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Based on your purchase history and preferences
        </p>
      </div>

      {Object.entries(groupedRecommendations).map(([type, recs]) => {
        const Icon = typeIcons[type as keyof typeof typeIcons];
        const label = typeLabels[type as keyof typeof typeLabels];

        return (
          <Card
            key={type}
            className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  {label}
                </CardTitle>
                <Badge className="text-xs" variant="secondary">
                  {recs.length} {recs.length === 1 ? "item" : "items"}
                </Badge>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {type === "frequently_bought" &&
                    "Products you've purchased before that you might need again"}
                  {type === "upgrade" &&
                    "Higher grade options based on your previous purchases"}
                  {type === "similar_customers" &&
                    "Popular choices among customers with similar buying patterns"}
                  {type === "category_popular" &&
                    "Trending products in your preferred categories"}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recs.map((rec, index) => {
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
                          {rec.type === "frequently_bought"
                            ? "Reorder"
                            : rec.type === "upgrade"
                            ? "Upgrade"
                            : rec.type === "similar_customers"
                            ? "Popular"
                            : "Trending"}
                        </Badge>
                      </div>

                      {/* Recommendation reason tooltip/overlay */}
                      <div className="absolute bottom-2 left-2 right-2 z-10">
                        <div className="bg-black/75 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {rec.reason}
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
                {recs.map((rec, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded"
                  >
                    <span className="font-medium">{rec.product.name}:</span>{" "}
                    {rec.reason}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="text-center mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> These recommendations are based on your order
          history and what similar customers typically purchase.
        </p>
      </div>
    </div>
  );
}
