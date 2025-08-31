/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Wishlist, WishlistWithItem } from "@/types/wishlist";
import type { Blog } from "@/type/blogs";
import type { Product } from "@/type/product";
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
    // First get all wishlist items
    const { data: wishlistData, error: wishlistError } = await supabase
      .from("wishlists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (wishlistError) {
      console.error("Error fetching wishlists:", wishlistError);
      return [];
    }

    if (!wishlistData || wishlistData.length === 0) {
      return [];
    }

    // Separate blog and product IDs
    const blogIds = wishlistData
      .filter((item) => item.item_type === "blog")
      .map((item) => item.item_id);

    const productIds = wishlistData
      .filter((item) => item.item_type === "product")
      .map((item) => item.item_id);

    // Fetch blogs if any - include all required fields and transform data structure
    let blogsData: Blog[] = [];
    if (blogIds.length > 0) {
      const { data, error } = await supabase
        .from("blogs")
        .select(
          `
          id,
          title,
          description,
          status,
          created_at,
          updated_at,
          link,
          link_name,
          content,
          image_url,
          blog_images(image_url),
          blog_tags(tags(id, name))
        `
        )
        .in("id", blogIds);

      if (!error && data) {
        blogsData = data.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          description: blog.description,
          status: blog.status,
          created_at: blog.created_at,
          updated_at: blog.updated_at,
          link: blog.link,
          link_name: blog.link_name,
          content: blog.content,
          image_url: blog.image_url,
          blog_images:
            blog.blog_images?.map((img: any) => ({
              image_url: img.image_url,
            })) || null,
          blog_tags:
            blog.blog_tags?.map((blogTag: any) => ({
              tags: {
                id: blogTag.tags.id,
                name: blogTag.tags.name,
              },
            })) || null,
        }));
      }
    }

    // Fetch products if any - include all required fields
    let productsData: Product[] = [];
    if (productIds.length > 0) {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          description,
          grade,
          product_type,
          mortar_ratio,
          category,
          normal_price,
          pump_price,
          tremie_1_price,
          tremie_2_price,
          tremie_3_price,
          unit,
          stock_quantity,
          status,
          is_featured,
          created_at,
          updated_at,
          keywords,
          product_images(id, image_url, alt_text, is_primary, sort_order)
        `
        )
        .in("id", productIds);

      if (!error && data) {
        productsData = data as Product[];
      }
    }

    // Combine the data
    const result: WishlistWithItem[] = wishlistData.map((wishlistItem) => {
      const item: WishlistWithItem = { ...wishlistItem };

      if (wishlistItem.item_type === "blog") {
        item.blog = blogsData.find((blog) => blog.id === wishlistItem.item_id);
      } else if (wishlistItem.item_type === "product") {
        item.product = productsData.find(
          (product) => product.id === wishlistItem.item_id
        );
      }

      return item;
    });

    return result;
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
