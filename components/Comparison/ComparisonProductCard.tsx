"use client";

import { Button, Badge, Card } from "@/components/ui/";
import type { Product } from "@/type/product";
import { X, Star, CheckCircle } from "lucide-react";
import Image from "next/image";

interface ComparisonProductCardProps {
  product: Product & { selectedPriceType?: string };
  onRemove?: () => void;
  showRemove?: boolean;
}

export function ComparisonProductCard({
  product,
  onRemove,
  showRemove = false,
}: ComparisonProductCardProps) {
  // Get main image from product_images (first or is_primary)
  const mainImage =
    product.product_images?.find((img) => img.is_primary) ||
    product.product_images?.[0];

  // Delivery options for display
  const deliveryOptions = [
    product.normal_price != null
      ? { key: "normal", label: "Normal Delivery", price: product.normal_price }
      : null,
    product.pump_price != null
      ? { key: "pump", label: "Pump Delivery", price: product.pump_price }
      : null,
    product.tremie_1_price != null
      ? { key: "tremie_1", label: "Tremie 1", price: product.tremie_1_price }
      : null,
    product.tremie_2_price != null
      ? { key: "tremie_2", label: "Tremie 2", price: product.tremie_2_price }
      : null,
    product.tremie_3_price != null
      ? { key: "tremie_3", label: "Tremie 3", price: product.tremie_3_price }
      : null,
  ].filter(Boolean) as { key: string; label: string; price: number }[];

  // Find selected price type
  const selectedType = product.selectedPriceType || "normal";
  const selectedOption = deliveryOptions.find(
    (opt) => opt.key === selectedType
  );

  return (
    <Card className="relative flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-0">
      {/* Remove button */}
      {showRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 rounded-full z-20 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-lg opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-200"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Full-width Image - completely flush to card edges */}
      <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        <Image
          src={mainImage?.image_url || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />

        {/* Grade badge overlay */}
        {product.grade && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-green-500 text-white border-0 font-semibold px-2 py-1 rounded-full shadow-md">
              Grade {product.grade}
            </Badge>
          </div>
        )}
      </div>

      {/* Content with fixed heights for consistent alignment */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Product Header - Fixed height */}
        <div className="h-20 mb-4 flex flex-col justify-start">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 leading-tight">
            {product.name}
          </h3>

          {product.category && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0 font-medium px-3 py-1"
              >
                {product.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Description - Fixed height */}
        <div className="h-16 mb-4 flex items-start">
          {product.description ? (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {product.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No description available
            </p>
          )}
        </div>

        {/* Price Section - Fixed height */}
        <div className="h-24 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center">
          <div className="text-center w-full">
            <div className="flex items-baseline justify-center gap-1 mb-1">
              {selectedOption ? (
                <>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    RM{Number(selectedOption.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded ml-2">
                    {selectedOption.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                    Not available for this delivery type
                  </span>
                  {/* Show available types */}
                  {deliveryOptions.length > 0 && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded ml-2">
                      Available:{" "}
                      {deliveryOptions.map((opt) => opt.label).join(", ")}
                    </span>
                  )}
                </>
              )}
              {product.unit && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  /{product.unit}
                </span>
              )}
            </div>

            {/* Rating stars */}
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                (4.0)
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>
                {product.stock_quantity && product.stock_quantity > 0
                  ? "In Stock"
                  : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Features - Grade, Product Type, Unit, Stock */}
        <div className="h-20 mb-6 flex flex-col">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {product.grade && <span>Grade: {product.grade}</span>}
            {product.product_type && <span>Type: {product.product_type}</span>}
            {product.unit && <span>Unit: {product.unit}</span>}
            {typeof product.stock_quantity === "number" && (
              <span>
                Stock:{" "}
                <span
                  className={
                    product.stock_quantity > 20
                      ? "text-green-600"
                      : product.stock_quantity > 5
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {product.stock_quantity}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow" />

        {/* Enhanced Action Button - Fixed height */}
        <div className="h-16 flex flex-col justify-center">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            VIEW DETAILS
          </Button>
          <div className="text-center mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Free consultation available
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
