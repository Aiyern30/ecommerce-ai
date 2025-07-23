import { supabase } from "./supabase";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    price: number;
    image_url: string;
    unit: string;
  };
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  cart_items?: CartItem[];
}

// Get or create user's cart
export async function getOrCreateCart(userId: string): Promise<string | null> {
  try {
    // First, try to get existing cart
    const { data: existingCart, error: fetchError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingCart) {
      return existingCart.id;
    }

    // If no cart exists, create one
    if (fetchError?.code === "PGRST116") {
      // No rows returned
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
    console.error("Error in getOrCreateCart:", error);
    return null;
  }
}

// Add item to cart
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<boolean> {
  try {
    const cartId = await getOrCreateCart(userId);
    if (!cartId) {
      toast.error("Failed to create cart");
      return false;
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .single();

    if (existingItem) {
      // Update quantity if item exists
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Error updating cart item:", updateError);
        toast.error("Failed to update cart");
        return false;
      }
    } else {
      // Add new item to cart
      const { error: insertError } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: productId,
        quantity: quantity,
      });

      if (insertError) {
        console.error("Error adding to cart:", insertError);
        toast.error("Failed to add to cart");
        return false;
      }
    }

    toast.success("Added to cart successfully!");
    return true;
  } catch (error) {
    console.error("Error in addToCart:", error);
    toast.error("Failed to add to cart");
    return false;
  }
}

// Get cart items
export async function getCartItems(userId: string): Promise<CartItem[]> {
  try {
    const cartId = await getOrCreateCart(userId);
    if (!cartId) return [];

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        product:products (
          name,
          price,
          image_url,
          unit
        )
      `
      )
      .eq("cart_id", cartId);

    if (error) {
      console.error("Error fetching cart items:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCartItems:", error);
    return [];
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<boolean> {
  try {
    if (quantity <= 0) {
      return await removeFromCart(itemId);
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
      toast.error("Failed to update quantity");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error);
    toast.error("Failed to update quantity");
    return false;
  }
}

// Remove item from cart
export async function removeFromCart(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
      return false;
    }

    toast.success("Removed from cart");
    return true;
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    toast.error("Failed to remove from cart");
    return false;
  }
}

// Get cart count
export async function getCartCount(userId: string): Promise<number> {
  try {
    const cartId = await getOrCreateCart(userId);
    if (!cartId) return 0;

    const { data, error } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", cartId);

    if (error) {
      console.error("Error fetching cart count:", error);
      return 0;
    }

    return data?.reduce((total, item) => total + item.quantity, 0) || 0;
  } catch (error) {
    console.error("Error in getCartCount:", error);
    return 0;
  }
}

// Clear cart
export async function clearCart(userId: string): Promise<boolean> {
  try {
    const cartId = await getOrCreateCart(userId);
    if (!cartId) return true;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
      return false;
    }

    toast.success("Cart cleared");
    return true;
  } catch (error) {
    console.error("Error in clearCart:", error);
    toast.error("Failed to clear cart");
    return false;
  }
}
