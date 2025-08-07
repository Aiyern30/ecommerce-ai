"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/";
import type { Product } from "@/type/product";
import Image from "next/image";
import { Shuffle } from "lucide-react";

interface ProductSelectorProps {
  products: Product[];
  comparedProducts: Product[];
  onProductChange: (index: number, newProductId: string) => void;
}

export function ProductSelector({
  products,
  comparedProducts,
  onProductChange,
}: ProductSelectorProps) {
  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Shuffle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select Products to Compare
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose different products to analyze their features and
            specifications
          </p>
        </div>
      </div>

      {/* Product Selection Grid */}
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
              <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <Image
                      src={
                        product.product_images?.find((img) => img.is_primary)
                          ?.image_url ||
                        product.product_images?.[0]?.image_url ||
                        "/placeholder.svg"
                      }
                      alt={product.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate text-sm">
                      {product.name}
                    </div>
                  </div>
                </div>
              </SelectTrigger>

              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg min-w-[280px] max-h-[300px]">
                {products.map((availableProduct) => (
                  <SelectItem
                    key={availableProduct.id}
                    value={availableProduct.id}
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-2 m-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        <Image
                          src={
                            availableProduct.product_images?.find(
                              (img) => img.is_primary
                            )?.image_url ||
                            availableProduct.product_images?.[0]?.image_url ||
                            "/placeholder.svg"
                          }
                          alt={availableProduct.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {availableProduct.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          RM
                          {(availableProduct.normal_price ?? 0).toFixed(
                            0
                          )} / {availableProduct.unit}
                        </div>
                      </div>
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
