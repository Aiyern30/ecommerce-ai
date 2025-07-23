"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getCartCount, getCartItems } from "@/lib/cart-utils";
import type { CartItem } from "@/lib/cart-utils";

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
  refreshCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For now, using a temporary user ID
  // In a real app, you'd get this from your auth context
  const userId = "temp-user-id";

  const refreshCart = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const [count, items] = await Promise.all([
        getCartCount(userId),
        getCartItems(userId),
      ]);

      setCartCount(count);
      setCartItems(items);
    } catch (error) {
      console.error("Error refreshing cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [userId]);

  return (
    <CartContext.Provider
      value={{ cartCount, cartItems, refreshCart, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
