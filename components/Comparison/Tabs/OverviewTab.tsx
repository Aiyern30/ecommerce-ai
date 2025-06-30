"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/";
import type { Product } from "@/type/product";
import Image from "next/image";

interface OverviewTabsProps {
  products: Product[];
  comparedProducts: Product[];
  onProductChange: (index: number, newProductId: string) => void;
}

export function OverviewTabs({
  products,
  comparedProducts,
  onProductChange,
}: OverviewTabsProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Select Products to Compare
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {comparedProducts.map((product, index) => (
          <div key={index} className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Product {index + 1}
            </label>
            <Select
              value={product.id}
              onValueChange={(newProductId) =>
                onProductChange(index, newProductId)
              }
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                {products.map((availableProduct) => (
                  <SelectItem
                    key={availableProduct.id}
                    value={availableProduct.id}
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          availableProduct.product_images?.[0]?.image_url ||
                          availableProduct.image_url ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={availableProduct.name}
                        width={20}
                        height={20}
                        className="rounded bg-gray-50 dark:bg-gray-700"
                      />
                      <span className="truncate">{availableProduct.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
