/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/cart/serverUtils.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { CartItem } from "@/type/cart";

export async function getOrCreateCartServerSide(
  userId: string
): Promise<string | null> {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: existingCart, error: fetchError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingCart) {
      return existingCart.id;
    }

    if (fetchError?.code === "PGRST116") {
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: userId })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating cart:", createError);
        return null;
      }

      return newCart.id;
    }

    console.error("Error fetching cart:", fetchError);
    return null;
  } catch (error) {
    console.error("Error in getOrCreateCartServerSide:", error);
    return null;
  }
}

export async function getCartItemsServerSide(
  userId: string
): Promise<CartItem[]> {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const cartId = await getOrCreateCartServerSide(userId);
    if (!cartId) return [];

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        product:products (
          id,
          name,
          grade,
          product_type,
          normal_price,
          pump_price,
          tremie_1_price,
          tremie_2_price,
          tremie_3_price,
          unit,
          product_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
        )
      `
      )
      .eq("cart_id", cartId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }

    // Process the data to handle image_url properly
    const processedData =
      data?.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              // Get the primary image or first image
              image_url:
                item.product.product_images?.find((img: any) => img.is_primary)
                  ?.image_url ||
                item.product.product_images?.[0]?.image_url ||
                "/placeholder.svg",
            }
          : null,
      })) || [];

    return processedData;
  } catch (error) {
    console.error("Error in getCartItemsServerSide:", error);
    return [];
  }
}

export async function removeFromCartServerSide(
  itemId: string
): Promise<boolean> {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error removing from cart:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in removeFromCartServerSide:", error);
    return false;
  }
}

export async function updateCartItemQuantityServerSide(
  itemId: string,
  quantity: number
): Promise<boolean> {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    if (quantity <= 0) {
      return await removeFromCartServerSide(itemId);
    }

    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating cart item quantity:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateCartItemQuantityServerSide:", error);
    return false;
  }
}

// Server-side version of getRecentOrders
export async function getRecentOrdersServerSide(
  userId: string,
  limit: number = 5
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          quantity,
          product:products (
            id,
            name,
            grade
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent orders:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getRecentOrdersServerSide:", error);
    return [];
  }
}
