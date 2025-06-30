"use client";

import { Button, Badge, Card, CardContent } from "@/components/ui/";
import type { Product } from "@/type/product";
import { X } from "lucide-react";
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
    <Card className="relative h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {showRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      <CardContent className="p-6 flex flex-col h-full">
        {/* Product Name */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {product.category}
          </p>
        </div>

        {/* Product Image */}
        <div className="flex justify-center mb-4">
          <Image
            src={
              product.product_images?.[0]?.image_url ||
              product.image_url ||
              "/placeholder.svg"
            }
            alt={product.name}
            width={200}
            height={200}
            className="w-48 h-48 object-contain rounded-lg bg-gray-50 dark:bg-gray-700"
          />
        </div>

        {/* Price */}
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            RM{product.price.toFixed(0)}
          </p>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {product.unit}
          </p>
        </div>

        {/* Tags - Above the button */}
        <div className="flex-grow flex flex-col justify-end">
          {product.product_tags && product.product_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {product.product_tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {tag.tags.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Button - At the bottom */}
          <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
            VIEW DETAILS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
