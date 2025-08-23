import type { CartItem } from "@/type/cart";
import { getProductPrice } from "./utils";

export interface CartTotals {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  selectedItemsCount: number;
}

export function calculateCartTotals(cartItems: CartItem[]): CartTotals {
  // Get only selected items
  const selectedItems = cartItems.filter((item) => item.selected);

  if (selectedItems.length === 0) {
    return {
      subtotal: 0,
      shippingCost: 0,
      tax: 0,
      total: 0,
      selectedItemsCount: 0,
    };
  }

  // Calculate subtotal
  const subtotal = selectedItems.reduce(
    (sum, item) =>
      sum + getProductPrice(item.product, item.variant_type) * item.quantity,
    0
  );

  // Calculate shipping cost (free shipping over RM100)
  const shippingCost = subtotal >= 100 ? 0 : 10;

  // Calculate tax (6% SST - Sales and Service Tax for Malaysia)
  const tax = subtotal * 0.06;

  // Calculate total
  const total = subtotal + shippingCost + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
    shippingCost: Math.round(shippingCost * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    selectedItemsCount: selectedItems.length,
  };
}

export function convertToStripeAmount(amount: number): number {
  // Convert RM to cents for Stripe (multiply by 100)
  return Math.round(amount * 100);
}
