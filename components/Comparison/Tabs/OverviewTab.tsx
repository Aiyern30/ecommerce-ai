"use client";

import type { Product } from "@/type/product";
import { Package } from "lucide-react";
import { ComparisonProductCard } from "@/components/Comparison/ComparisonProductCard";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface OverviewTabsProps {
  comparedProducts: Product[];
  onRemove?: (id: string) => void;
}

export function OverviewTabs({
  comparedProducts,
  onRemove,
}: OverviewTabsProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Comparison Summary */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Comparison Summary
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {comparedProducts.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              RM{Math.min(...comparedProducts.map((p) => p.price)).toFixed(0)} -
              RM
              {Math.max(...comparedProducts.map((p) => p.price)).toFixed(0)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Price Range</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {
                [
                  ...new Set(
                    comparedProducts.map((p) => p.category).filter(Boolean)
                  ),
                ].length
              }
            </div>
            <div className="text-gray-600 dark:text-gray-400">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              RM
              {(
                comparedProducts.reduce((sum, p) => sum + p.price, 0) /
                comparedProducts.length
              ).toFixed(0)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Avg Price</div>
          </div>
        </div>
      </div>

      {/* Comparison Product Cards */}
      <div className="w-full overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Product Comparison
        </h3>
        <div
          className={cn(
            "grid gap-6 mb-8",
            isMobile && "grid-cols-1",
            !isMobile && comparedProducts.length === 2 && "grid-cols-2",
            !isMobile && comparedProducts.length === 3 && "grid-cols-3",
            !isMobile && comparedProducts.length >= 4 && "grid-cols-4"
          )}
        >
          {comparedProducts.map((product, index) => (
            <div key={`${product.id}-${index}`} className="w-full min-w-0">
              <ComparisonProductCard
                product={product}
                onRemove={onRemove ? () => onRemove(product.id) : undefined}
                showRemove={comparedProducts.length > 2 && !!onRemove}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
