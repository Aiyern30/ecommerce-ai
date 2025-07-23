"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useUser } from "@supabase/auth-helpers-react";
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

  const user = useUser();

  // Only load cart if user is logged in
  const userId = user?.id;

  const refreshCart = useCallback(async () => {
    if (!userId) {
      // If no user, clear cart and stop loading
      setCartCount(0);
      setCartItems([]);
      setIsLoading(false);
      return;
    }

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
  }, [userId]);

  useEffect(() => {
    refreshCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [userId, refreshCart]);

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
