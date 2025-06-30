/* eslint-disable react/no-unescaped-entities */
"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
} from "@/components/ui/";
import type { Product } from "@/type/product";
import { Check, Star, TrendingUp, Package, Award } from "lucide-react";

interface PricingTabProps {
  products: Product[];
  itemCount: "2" | "3" | "4";
}

export function PricingTab({ products, itemCount }: PricingTabProps) {
  // Find the product with the best value (lowest price or highest stock)
  const bestValueIndex = products.reduce((bestIndex, product, index) => {
    const bestProduct = products[bestIndex];
    // Simple logic: best value is lowest price with good stock
    if (
      product.price < bestProduct.price &&
      (product.stock_quantity || 0) > 0
    ) {
      return index;
    }
    return bestIndex;
  }, 0);

  const getFeatures = (product: Product) => {
    const features = [];

    if (product.category) features.push(`${product.category} category`);
    if (product.unit) features.push(`Sold ${product.unit}`);
    if (product.stock_quantity && product.stock_quantity > 0) {
      features.push(`${product.stock_quantity} units in stock`);
    }
    if (product.product_tags && product.product_tags.length > 0) {
      features.push(`${product.product_tags.length} product tags`);
    }
    if (
      product.product_certificates &&
      product.product_certificates.length > 0
    ) {
      features.push(`${product.product_certificates.length} certifications`);
    }

    // Add some default features
    features.push("Quality guaranteed");
    features.push("Fast delivery");

    return features;
  };

  const getPriceColor = (index: number) => {
    if (index === bestValueIndex) return "text-green-600 dark:text-green-400";
    return "text-gray-900 dark:text-gray-100";
  };

  const getStockStatus = (product: Product) => {
    if (!product.stock_quantity || product.stock_quantity === 0) {
      return { status: "Out of Stock", color: "destructive" as const };
    }
    if (product.stock_quantity < 10) {
      return { status: "Low Stock", color: "secondary" as const };
    }
    return { status: "In Stock", color: "default" as const };
  };

  return (
    <div className="space-y-8">
      {/* Pricing Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Choose Your Product
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Compare prices and features to find the perfect cement product for
          your project
        </p>
      </div>

      {/* Pricing Cards */}
      <div
        className={cn(
          "grid gap-6",
          itemCount === "2"
            ? "grid-cols-1 md:grid-cols-2"
            : itemCount === "3"
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {products.map((product, index) => {
          const features = getFeatures(product);
          const stockStatus = getStockStatus(product);
          const isBestValue = index === bestValueIndex;

          return (
            <Card
              key={product.id}
              className={cn(
                "h-full flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl relative",
                isBestValue
                  ? "border-2 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg"
                  : "hover:shadow-lg",
                stockStatus.status === "Out of Stock" ? "opacity-75" : ""
              )}
            >
              {/* Best Value Badge */}
              {isBestValue && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-blue-500 text-white px-4 py-1 text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Best Value
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {product.category} • {product.unit}
                  </CardDescription>
                </div>

                {/* Price Display */}
                <div className="pt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      RM
                    </span>
                    <span
                      className={cn("text-4xl font-bold", getPriceColor(index))}
                    >
                      {product.price.toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {product.unit?.replace("per ", "/")}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="mt-3">
                    <Badge variant={stockStatus.color} className="text-xs">
                      <Package className="w-3 h-3 mr-1" />
                      {stockStatus.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-grow space-y-4">
                {/* Product Description */}
                {product.description && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Features List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    What's Included
                  </h4>
                  <ul className="space-y-2">
                    {features.slice(0, 5).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Certificates */}
                {product.product_certificates &&
                  product.product_certificates.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Certifications
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {product.product_certificates
                          .slice(0, 3)
                          .map((cert, certIndex) => (
                            <Badge
                              key={certIndex}
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                            >
                              {cert.certificate}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
              </CardContent>

              <CardFooter className="pt-4">
                <div className="w-full space-y-3">
                  {/* Primary Action */}
                  <Button
                    className={cn(
                      "w-full font-semibold",
                      isBestValue
                        ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        : stockStatus.status === "Out of Stock"
                        ? "bg-gray-400 cursor-not-allowed"
                        : ""
                    )}
                    variant={
                      isBestValue
                        ? "default"
                        : stockStatus.status === "Out of Stock"
                        ? "secondary"
                        : "outline"
                    }
                    disabled={stockStatus.status === "Out of Stock"}
                  >
                    {stockStatus.status === "Out of Stock"
                      ? "Out of Stock"
                      : isBestValue
                      ? "Choose Best Value"
                      : "Select Product"}
                  </Button>

                  {/* Secondary Action */}
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Price Comparison Summary */}
      <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-center">
            Price Comparison Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lowest Price
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                RM {Math.min(...products.map((p) => p.price)).toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Price
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                RM{" "}
                {(
                  products.reduce((sum, p) => sum + p.price, 0) /
                  products.length
                ).toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Highest Price
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                RM {Math.max(...products.map((p) => p.price)).toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
