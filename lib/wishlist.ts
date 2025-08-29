import type { Wishlist, WishlistWithItem } from "@/types/wishlist";
import { supabase } from "./supabase/browserClient";

export async function addToWishlist(
  itemType: "blog" | "product",
  itemId: string,
  userId: string
): Promise<{ success: boolean; data?: Wishlist }> {
  try {
    const { data, error } = await supabase
      .from("wishlists")
      .insert({
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding to wishlist:", error);
      return { success: false };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false };
  }
}

export async function removeFromWishlist(
  itemType: "blog" | "product",
  itemId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("item_type", itemType)
      .eq("item_id", itemId);

    if (error) {
      console.error("Error removing from wishlist:", error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false };
  }
}

export async function getUserWishlists(
  userId: string
): Promise<WishlistWithItem[]> {
  try {
    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `
        *,
        blogs:item_id(
          id,
          title,
          description,
          image_url,
          created_at,
          blog_images(image_url),
          blog_tags(tags(*))
        ),
        products:item_id(
          id,
          name,
          description,
          grade,
          normal_price,
          product_images(image_url, is_primary)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishlists:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    return [];
  }
}

export async function toggleWishlist(
  itemType: "blog" | "product",
  itemId: string,
  isCurrentlyWishlisted: boolean,
  userId: string
): Promise<{ success: boolean; isWishlisted: boolean }> {
  if (isCurrentlyWishlisted) {
    const result = await removeFromWishlist(itemType, itemId, userId);
    return { success: result.success, isWishlisted: false };
  } else {
    const result = await addToWishlist(itemType, itemId, userId);
    return { success: result.success, isWishlisted: true };
  }
}
