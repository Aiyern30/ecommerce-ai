"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/";
import { Button } from "@/components/ui/";
import { ScrollArea } from "@/components/ui/";
import { Badge } from "@/components/ui/";
import type { Product } from "@/type/product";
import Image from "next/image";
import { Shuffle, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProductWithPriceType extends Product {
  selectedPriceType?: string;
}

interface ProductSelectorProps {
  products: Product[];
  comparedProducts: ProductWithPriceType[];
  onProductChange: (index: number, newProductId: string) => void;
  onPriceTypeChange?: (productId: string, newPriceType: string) => void;
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    const priceOptions = getPriceOptions(product);

    if (!product.selectedPriceType) {
      const firstPrice = priceOptions.length > 0 ? priceOptions[0].price : 0;
      return firstPrice;
    }

    const priceType = product.selectedPriceType;
    let selectedPrice = 0;

    switch (priceType) {
      case "pump":
        selectedPrice = product.pump_price || 0;
        break;
      case "tremie_1":
        selectedPrice = product.tremie_1_price || 0;
        break;
      case "tremie_2":
        selectedPrice = product.tremie_2_price || 0;
        break;
      case "tremie_3":
        selectedPrice = product.tremie_3_price || 0;
        break;
      case "normal":
        selectedPrice = product.normal_price || 0;
        break;
      default:
        selectedPrice = priceOptions.length > 0 ? priceOptions[0].price : 0;
    }

    return selectedPrice;
  };

  const handleProductSelection = (
    index: number,
    productId: string,
    priceType: string
  ) => {
    if (onProductAndPriceTypeChange) {
      onProductAndPriceTypeChange(index, productId, priceType);
    } else {
      const currentProduct = comparedProducts[index];
      if (productId === currentProduct.id) {
        onPriceTypeChange?.(productId, priceType);
      } else {
        onProductChange(index, productId);
        onPriceTypeChange?.(productId, priceType);
      }
    }
    setIsDialogOpen(false);
    setSelectedIndex(null);
  };

  const openProductSelector = (index: number) => {
    setSelectedIndex(index);
    setIsDialogOpen(true);
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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

      {/* Product Selection Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {comparedProducts.map((product, index) => {
          const priceOptions = getPriceOptions(product);
          const selectedPrice = getSelectedPrice(product);
          const selectedPriceType =
            product.selectedPriceType ||
            (priceOptions.length > 0 ? priceOptions[0].key : "normal");
          const selectedProduct = products.find((p) => p.id === product.id);

          return (
            <div key={`${product.id}-${index}`} className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product {index + 1}
              </label>

              {/* Product Selection Button */}
              <Button
                variant="outline"
                className="w-full p-3 h-auto flex flex-col gap-2 items-start text-left"
                onClick={() => openProductSelector(index)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <Image
                      src={
                        selectedProduct?.product_images?.find(
                          (img) => img.is_primary
                        )?.image_url ||
                        selectedProduct?.product_images?.[0]?.image_url ||
                        "/placeholder.svg"
                      }
                      alt={selectedProduct?.name || "Product"}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {selectedProduct?.name || "Select Product"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {priceOptions.find((opt) => opt.key === selectedPriceType)
                        ?.label ||
                        (priceOptions.length > 0
                          ? priceOptions[0].label
                          : "No delivery option")}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
                <div className="w-full flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Price:
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    RM{selectedPrice.toFixed(2)}
                  </span>
                </div>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Mobile-Friendly Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[80vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg">
              Select Product {selectedIndex !== null ? selectedIndex + 1 : ""}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 space-y-2">
              {products.map((availableProduct) => {
                const availablePriceOptions = getPriceOptions(availableProduct);
                return (
                  <div
                    key={availableProduct.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Product Header */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          <Image
                            src={
                              availableProduct.product_images?.find(
                                (img) => img.is_primary
                              )?.image_url ||
                              availableProduct.product_images?.[0]?.image_url ||
                              "/placeholder.svg"
                            }
                            alt={availableProduct.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                            {availableProduct.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {availablePriceOptions.length} delivery option
                            {availablePriceOptions.length > 1 ? "s" : ""}{" "}
                            available
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Options */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {availablePriceOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() =>
                            selectedIndex !== null &&
                            handleProductSelection(
                              selectedIndex,
                              availableProduct.id,
                              opt.key
                            )
                          }
                          className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {opt.label}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Click to select this option
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                RM{Number(opt.price).toFixed(2)}
                              </div>
                              {/* Show badge if this is currently selected */}
                              {selectedIndex !== null &&
                                comparedProducts[selectedIndex]?.id ===
                                  availableProduct.id &&
                                (comparedProducts[selectedIndex]
                                  ?.selectedPriceType ||
                                  (getPriceOptions(
                                    comparedProducts[selectedIndex]
                                  ).length > 0
                                    ? getPriceOptions(
                                        comparedProducts[selectedIndex]
                                      )[0].key
                                    : "normal")) === opt.key && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs mt-1"
                                  >
                                    Current
                                  </Badge>
                                )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
