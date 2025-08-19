"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/";
import { Button } from "@/components/ui/";
import type { Product } from "@/type/product";
import Image from "next/image";
import { Shuffle } from "lucide-react";

interface ProductWithPriceType extends Product {
  selectedPriceType?: string;
}

interface ProductSelectorProps {
  products: Product[];
  comparedProducts: ProductWithPriceType[];
  onProductChange: (index: number, newProductId: string) => void;
  onPriceTypeChange?: (productId: string, newPriceType: string) => void;
  // Add a new prop for combined changes
  onProductAndPriceTypeChange?: (
    index: number,
    newProductId: string,
    newPriceType: string
  ) => void;
}

export function ProductSelector({
  products,
  comparedProducts,
  onProductChange,
  onPriceTypeChange,
  onProductAndPriceTypeChange,
}: ProductSelectorProps) {
  console.log("ProductSelector", products);
  const getPriceOptions = (product: Product) => {
    const options = [];
    if (product.normal_price)
      options.push({
        key: "normal",
        label: "Normal Delivery",
        price: product.normal_price,
      });
    if (product.pump_price)
      options.push({
        key: "pump",
        label: "Pump Delivery",
        price: product.pump_price,
      });
    if (product.tremie_1_price)
      options.push({
        key: "tremie_1",
        label: "Tremie 1",
        price: product.tremie_1_price,
      });
    if (product.tremie_2_price)
      options.push({
        key: "tremie_2",
        label: "Tremie 2",
        price: product.tremie_2_price,
      });
    if (product.tremie_3_price)
      options.push({
        key: "tremie_3",
        label: "Tremie 3",
        price: product.tremie_3_price,
      });
    return options;
  };

  const getSelectedPrice = (product: ProductWithPriceType) => {
    const priceType = product.selectedPriceType || "normal";
    switch (priceType) {
      case "pump":
        return product.pump_price || product.normal_price || 0;
      case "tremie_1":
        return product.tremie_1_price || product.normal_price || 0;
      case "tremie_2":
        return product.tremie_2_price || product.normal_price || 0;
      case "tremie_3":
        return product.tremie_3_price || product.normal_price || 0;
      default:
        return product.normal_price || 0;
    }
  };

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
            Choose different products and price types to analyze their features
            and specifications
          </p>
        </div>
      </div>

      {/* Product Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {comparedProducts.map((product, index) => {
          const priceOptions = getPriceOptions(product);
          const selectedPrice = getSelectedPrice(product);
          const selectedPriceType = product.selectedPriceType || "normal";
          const selectedProduct = products.find((p) => p.id === product.id);

          return (
            <div key={`${product.id}-${index}`} className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product {index + 1}
              </label>

              {/* Product + Delivery Option Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 flex items-center gap-2 justify-start"
                  >
                    <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      <Image
                        src={
                          selectedProduct?.product_images?.find(
                            (img) => img.is_primary
                          )?.image_url ||
                          selectedProduct?.product_images?.[0]?.image_url ||
                          "/placeholder.svg"
                        }
                        alt={selectedProduct?.name || "Product"}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium truncate text-sm flex-1">
                      {selectedProduct?.name || "Select Product"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {priceOptions.find((opt) => opt.key === selectedPriceType)
                        ?.label || "Normal Delivery"}
                    </span>
                    <span className="text-xs text-gray-900 dark:text-gray-100 font-bold ml-2">
                      RM{selectedPrice.toFixed(2)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="start">
                  <DropdownMenuLabel>
                    Select Product & Delivery Option
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {products.map((availableProduct) => {
                      const availablePriceOptions =
                        getPriceOptions(availableProduct);
                      return (
                        <DropdownMenuSub key={availableProduct.id}>
                          <DropdownMenuSubTrigger className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                              <Image
                                src={
                                  availableProduct.product_images?.find(
                                    (img) => img.is_primary
                                  )?.image_url ||
                                  availableProduct.product_images?.[0]
                                    ?.image_url ||
                                  "/placeholder.svg"
                                }
                                alt={availableProduct.name}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium truncate text-sm flex-1">
                              {availableProduct.name}
                            </span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {availablePriceOptions.map((opt) => (
                                <DropdownMenuItem
                                  key={opt.key}
                                  onClick={() => {
                                    if (onProductAndPriceTypeChange) {
                                      onProductAndPriceTypeChange(
                                        index,
                                        availableProduct.id,
                                        opt.key
                                      );
                                    } else {
                                      // Fallback (less reliable)
                                      if (availableProduct.id === product.id) {
                                        onPriceTypeChange?.(
                                          availableProduct.id,
                                          opt.key
                                        );
                                      } else {
                                        onProductChange(
                                          index,
                                          availableProduct.id
                                        );
                                        onPriceTypeChange?.(
                                          availableProduct.id,
                                          opt.key
                                        );
                                      }
                                    }
                                  }}
                                  className="flex items-center justify-between"
                                >
                                  <span>{opt.label}</span>
                                  <span className="text-xs text-gray-900 dark:text-gray-100 font-bold ml-2">
                                    RM{Number(opt.price).toFixed(2)}
                                  </span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Current Selection Display */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Current Price:
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      RM{selectedPrice.toFixed(2)}
                    </div>
                    {priceOptions.length > 1 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {
                          priceOptions.find(
                            (opt) => opt.key === selectedPriceType
                          )?.label
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
