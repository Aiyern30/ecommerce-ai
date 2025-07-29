"use client";

import { Button, Badge, Card } from "@/components/ui/";
import type { Product } from "@/type/product";
import { X, Star, CheckCircle } from "lucide-react";
import Image from "next/image";

interface ComparisonProductCardProps {
  product: Product;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function ComparisonProductCard({
  product,
  onRemove,
  showRemove = false,
}: ComparisonProductCardProps) {
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
      <div className="relative w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
        <Image
          src={
            product.product_images?.[0]?.image_url ||
            product.image_url ||
            "/placeholder.svg" ||
            "/placeholder.svg"
          }
          alt={product.name}
          fill
          className="object-contain p-4 hover:scale-105 transition-transform duration-300"
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
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                RM{product.price.toFixed(0)}
              </span>
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
              <span>In Stock</span>
            </div>
          </div>
        </div>

        {/* Tags & Certificates - Fixed height */}
        <div className="h-32 mb-6 flex flex-col">
          {/* Tags */}
          <div className="h-16 mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Features
            </h4>
            <div className="flex flex-wrap gap-1">
              {product.product_tags && product.product_tags.length > 0 ? (
                <>
                  {product.product_tags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {tag.tags.name}
                    </Badge>
                  ))}
                  {product.product_tags.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                    >
                      +{product.product_tags.length - 3}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                  No features listed
                </span>
              )}
            </div>
          </div>

          {/* Certificates */}
          <div className="h-16">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
              Certifications
            </h4>
            <div className="flex flex-wrap gap-1">
              {product.product_certificates &&
              product.product_certificates.length > 0 ? (
                product.product_certificates.slice(0, 2).map((cert, index) => (
                  <Badge
                    key={`cert-${index}`}
                    className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0 font-medium"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {cert.certificate}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                  No certifications
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow" />

        {/* Enhanced Action Button - Fixed height */}
        <div className="h-16 flex flex-col justify-center">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            VIEW DETAILS
          </Button>

          {/* Quick info */}
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
