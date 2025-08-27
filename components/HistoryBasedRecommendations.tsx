"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ProductCard } from "./ProductCards";
import { Skeleton } from "@/components/ui";
import { TrendingUp, ShoppingBag, Star, Users } from "lucide-react";
import { Order } from "@/type/order";
import {
  historyBasedRecommendationEngine,
  type HistoryRecommendation,
} from "@/lib/recommendations/historyBasedRecommendations";

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

const typeColors = {
  frequently_bought:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  upgrade:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  similar_customers:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  category_popular:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
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

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recommended for You
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Based on your purchase history and preferences
        </p>
      </div>

      {Object.entries(groupedRecommendations).map(([type, recs]) => {
        const Icon = typeIcons[type as keyof typeof typeIcons];
        const label = typeLabels[type as keyof typeof typeLabels];
        const colorClass = typeColors[type as keyof typeof typeColors];

        return (
          <Card key={type} className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recs.map((rec) => {
                  const product = rec.product;
                  const bestPrice = [
                    product.normal_price,
                    product.pump_price,
                    product.tremie_1_price,
                    product.tremie_2_price,
                    product.tremie_3_price,
                  ]
                    .filter((price) => price !== null && price !== undefined)
                    .reduce(
                      (min, price) => Math.min(min, price as number),
                      Infinity
                    );

                  return (
                    <div key={rec.product.id} className="space-y-3">
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={bestPrice === Infinity ? 0 : bestPrice}
                        grade={product.grade}
                        productType={product.product_type}
                        unit={product.unit}
                        stock={product.stock_quantity}
                        image={
                          product.product_images?.[0]?.image_url ||
                          "/placeholder.svg"
                        }
                        href={`/products/${product.id}`}
                        showCompare={false}
                        normal_price={product.normal_price}
                        pump_price={product.pump_price}
                        tremie_1_price={product.tremie_1_price}
                        tremie_2_price={product.tremie_2_price}
                        tremie_3_price={product.tremie_3_price}
                      />

                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rec.reason}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-1">
                          <span className="text-xs text-gray-500">
                            Confidence:
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < rec.confidence * 5
                                    ? "bg-yellow-400"
                                    : "bg-gray-200 dark:bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
