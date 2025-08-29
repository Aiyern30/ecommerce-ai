"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { getUserWishlists } from "@/lib/wishlist";
import { WishlistWithItem } from "@/types/wishlist";

interface WishlistContextType {
  wishlistCount: number;
  wishlistItems: WishlistWithItem[];
  refreshWishlist: () => Promise<void>;
  isLoading: boolean;
  isItemWishlisted: (itemType: "blog" | "product", itemId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<WishlistWithItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = useUser();
  const userId = user?.id;

  const isItemWishlisted = useCallback(
    (itemType: "blog" | "product", itemId: string) => {
      return wishlistItems.some(
        (item) => item.item_type === itemType && item.item_id === itemId
      );
    },
    [wishlistItems]
  );

  const refreshWishlist = useCallback(async () => {
    if (!userId) {
      setWishlistCount(0);
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const items = await getUserWishlists(userId);
      setWishlistItems(items);
      setWishlistCount(items.length);
    } catch (error) {
      console.error("Error refreshing wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshWishlist();

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      refreshWishlist();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () =>
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [userId, refreshWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount,
        wishlistItems,
        refreshWishlist,
        isLoading,
        isItemWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
