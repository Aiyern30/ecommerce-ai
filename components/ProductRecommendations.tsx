"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, TrendingUp, DollarSign, Lightbulb } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui/";
import { Product } from "@/type/product";
import {
  recommendationEngine,
  RecommendationGroup,
} from "@/lib/recommendations/recommendationEngine";
import { formatCurrency } from "@/lib/utils/currency";

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

  return (
    <div className={`space-y-8 ${className}`}>
      {recommendations.map((group, groupIndex) => {
        const IconComponent = getGroupIcon(group.title);

        return (
          <Card
            key={groupIndex}
            className="border-2 hover:border-orange-200 dark:hover:border-orange-800 transition-colors duration-200"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                {group.title}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {group.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.products.map((rec, index) => {
                  const product = rec.product;
                  const mainImage =
                    product.product_images?.find((img) => img.is_primary) ||
                    product.product_images?.[0];
                  const bestPrice = getBestPrice(product);

                  return (
                    <Card
                      key={index}
                      className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border border-gray-200 dark:border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={mainImage?.image_url || "/placeholder.svg"}
                              alt={product.name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          <Badge
                            className={`absolute top-2 right-2 text-xs px-2 py-1 ${getTypeColor(
                              rec.type
                            )}`}
                          >
                            {rec.type === "upsell"
                              ? "Upgrade"
                              : rec.type === "downsell"
                              ? "Budget"
                              : "Alternative"}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100">
                            {product.name}
                          </h4>

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {product.grade ||
                                product.mortar_ratio ||
                                product.category}
                            </span>
                            {bestPrice && (
                              <span className="font-semibold text-orange-600 dark:text-orange-400">
                                {formatCurrency(bestPrice)}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {rec.reason}
                          </p>

                          <Link href={`/products/${product.id}`}>
                            <Button
                              size="sm"
                              className="w-full mt-3 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-200"
                              variant="outline"
                            >
                              View Details
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
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
