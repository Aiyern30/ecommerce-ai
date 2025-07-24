"use client";

import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/utils/currency";
import Image from "next/image";
import { useMemo } from "react";

export function CheckoutSummary() {
  const { cartItems } = useCart();

  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => item.selected);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  }, [selectedItems]);

  const shipping = 15.0; // Fixed shipping cost
  const total = subtotal + shipping;

  if (selectedItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm h-fit">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <p className="text-gray-500">No items selected</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm h-fit sticky top-6">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      {/* Selected Items */}
      <div className="space-y-4 mb-6">
        {selectedItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src={item.product?.image_url || "/placeholder.svg"}
                alt={item.product?.name || "Product"}
                width={50}
                height={50}
                className="rounded-md object-cover"
              />
              <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {item.product?.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatCurrency(item.product?.price || 0)} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium">
              {formatCurrency((item.product?.price || 0) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({selectedItems.length} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{formatCurrency(shipping)}</span>
        </div>

        <div className="flex justify-between text-base font-semibold border-t pt-3">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <p className="text-sm font-medium mb-1">Estimated Delivery</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          3-5 business days
        </p>
      </div>
    </div>
  );
}
