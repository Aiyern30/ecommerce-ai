import type { Wishlist, WishlistWithItem } from "@/types/wishlist";
import { supabase } from "@/lib/supabase/client";

export async function addToWishlist(
  itemType: "blog" | "product",
  itemId: string
): Promise<Wishlist | null> {
  const { data, error } = await supabase
    .from("wishlists")
    .insert({
      item_type: itemType,
      item_id: itemId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding to wishlist:", error);
    return null;
  }

  return data;
}

export async function removeFromWishlist(
  itemType: "blog" | "product",
  itemId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("item_type", itemType)
    .eq("item_id", itemId);

  if (error) {
    console.error("Error removing from wishlist:", error);
    return false;
  }

  return true;
}

export async function getUserWishlists(): Promise<WishlistWithItem[]> {
  const { data, error } = await supabase
    .from("wishlists")
    .select(
      `
      *,
      blogs:item_id!wishlists_item_id_fkey(
        id,
        title,
        description,
        image_url,
        created_at,
        blog_images(image_url),
        blog_tags(tags(*))
      ),
      products:item_id!wishlists_item_id_fkey(
        id,
        name,
        description,
        grade,
        normal_price,
        product_images(image_url, is_primary)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wishlists:", error);
    return [];
  }

  return data || [];
}

export async function isItemWishlisted(
  itemType: "blog" | "product",
  itemId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("wishlists")
    .select("id")
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .single();

  return !error && !!data;
}
