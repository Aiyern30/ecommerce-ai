"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { calculateCartTotals, formatCurrency } from "@/lib/cart/calculations";
import Image from "next/image";

export function CheckoutSummary() {
  const { cartItems, isLoading } = useCart();
  const totals = calculateCartTotals(cartItems);
  const selectedItems = cartItems.filter((item) => item.selected);

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No items selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="p-6 bg-gray-50 dark:bg-gray-900 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Selected Items */}
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex gap-3 py-2">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={item.product?.image_url || "/placeholder.svg"}
                    alt={item.product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-1">
                    {item.product?.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      @ {formatCurrency(item.product?.price || 0)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {formatCurrency((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 my-4"></div>

          {/* Summary Calculations */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Subtotal ({totals.selectedItemsCount} items)
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span
                className={`font-medium ${
                  totals.shippingCost === 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {totals.shippingCost === 0
                  ? "FREE"
                  : formatCurrency(totals.shippingCost)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tax (SST 6%)
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(totals.tax)}
              </span>
            </div>

            {totals.subtotal >= 100 && (
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                🎉 You qualify for free shipping!
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
