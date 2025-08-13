/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "../supabase/browserClient";
import { toast } from "sonner";
import type { CartItem } from "@/type/cart";
import { AdditionalService } from "@/type/additionalService";
import { FreightCharge } from "@/type/freightCharges";

/**
 * Cart Selection Logic:
 * 1. New items added to cart → selected: false (database default)
 * 2. User manually checks items in cart → selected: true
 * 3. Order page only fetches selected: true items
 * 4. Users must select at least one item to proceed to order
 */

// Helper function to get the appropriate price based on variant type
export function getProductPrice(
  product: any,
  variantType?: string | null
): number {
  if (!product) return 0;

  switch (variantType) {
    case "pump":
      return product.pump_price || product.normal_price || 0;
    case "tremie_1":
      return product.tremie_1_price || product.normal_price || 0;
    case "tremie_2":
      return product.tremie_2_price || product.normal_price || 0;
    case "tremie_3":
      return product.tremie_3_price || product.normal_price || 0;
    case "normal":
    case null:
    case undefined:
    default:
      return product.normal_price || 0;
  }
}

export async function getOrCreateCart(userId: string): Promise<string | null> {
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
    console.error("Error in getOrCreateCart:", error);
    return null;
  }
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
  variantType?: string
): Promise<{ success: boolean; isUpdate: boolean; newQuantity?: number }> {
  try {
    const cartId = await getOrCreateCart(userId);
    if (!cartId) {
      toast.error("Failed to create cart");
      return { success: false, isUpdate: false };
    }

    // Fetch product stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .single();
    if (productError || !product) {
      toast.error("Failed to fetch product stock");
      return { success: false, isUpdate: false };
    }

    // Build query for existing cart item
    let query = supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId);

    if (variantType) {
      query = query.eq("variant_type", variantType);
    } else {
      query = query.is("variant_type", null);
    }

    const { data: existingItem, error: existingError } = await query.single();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Error fetching existing cart item:", existingError);
      toast.error("Failed to check cart");
      return { success: false, isUpdate: false };
    }

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > product.stock_quantity) {
      toast.error(
        `Cannot add more than available stock (${product.stock_quantity})`
      );
      return { success: false, isUpdate: !!existingItem };
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Error updating cart item:", updateError);
        toast.error("Failed to update cart");
        return { success: false, isUpdate: true };
      }

      return { success: true, isUpdate: true, newQuantity };
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        variant_type: variantType || null,
      });

      if (insertError) {
        console.error("Error adding to cart:", insertError);
        toast.error("Failed to add to cart");
        return { success: false, isUpdate: false };
      }

      return { success: true, isUpdate: false, newQuantity: quantity };
    }
  } catch (error) {
    console.error("Error in addToCart:", error);
    toast.error("Failed to add to cart");
    return { success: false, isUpdate: false };
  }
}

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
    console.error("Error in getCartItems:", error);
    return [];
  }
}

// New function to get only selected cart items
export async function getSelectedCartItems(
  userId: string
): Promise<CartItem[]> {
  try {
    const cartId = await getOrCreateCart(userId);
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
      .eq("selected", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching selected cart items:", error);
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
    console.error("Error in getSelectedCartItems:", error);
    return [];
  }
}

// New function to update item selection
export async function updateCartItemSelection(
  itemId: string,
  selected: boolean
): Promise<boolean> {
  try {
    console.log("Updating cart item selection:", { itemId, selected }); // Debug log

    const { error } = await supabase
      .from("cart_items")
      .update({
        selected: selected,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating cart item selection:", error);
      return false;
    }

    console.log("Cart item selection updated successfully"); // Debug log
    return true;
  } catch (error) {
    console.error("Error in updateCartItemSelection:", error);
    return false;
  }
}

// New function to select all items
export async function selectAllCartItems(
  userId: string,
  selected: boolean
): Promise<boolean> {
  try {
    console.log("Select all cart items:", { userId, selected }); // Debug log

    const cartId = await getOrCreateCart(userId);
    if (!cartId) {
      console.error("Failed to get cart ID for select all");
      return false;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({
        selected: selected,
        updated_at: new Date().toISOString(),
      })
      .eq("cart_id", cartId);

    if (error) {
      console.error("Error updating all cart items selection:", error);
      return false;
    }

    console.log("All cart items selection updated successfully"); // Debug log
    return true;
  } catch (error) {
    console.error("Error in selectAllCartItems:", error);
    return false;
  }
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<boolean> {
  try {
    if (quantity <= 0) {
      return await removeFromCart(itemId);
    }
    const { data: cartItem, error: cartItemError } = await supabase
      .from("cart_items")
      .select(
        `
    product_id,
    variant_type
  `
      )
      .eq("id", itemId)
      .single();

    if (cartItemError || !cartItem) {
      console.error("Error fetching cart item:", cartItemError);
      toast.error("Failed to fetch cart item for stock check");
      return false;
    }

    // Separate query for product stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", cartItem.product_id)
      .single();

    if (productError || !product) {
      console.error("Error fetching product:", productError);
      toast.error("Failed to fetch product stock");
      return false;
    }

    const stock = product.stock_quantity;
    // Check if stock exists and validate quantity
    if (typeof stock === "number" && quantity > stock) {
      toast.error(`Cannot set quantity above available stock (${stock})`);
      return false;
    }

    // Update the quantity
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

export async function clearSelectedCartItems(
  userId: string,
  showToast: boolean = false
): Promise<boolean> {
  try {
    const cartId = await getOrCreateCart(userId);
    if (!cartId) return true;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("selected", true);

    if (error) {
      console.error("Error clearing selected cart items:", error);
      if (showToast) toast.error("Failed to clear selected items");
      return false;
    }

    console.log("Selected cart items cleared successfully");
    if (showToast) toast.success("Purchased items removed from cart");
    return true;
  } catch (error) {
    console.error("Error in clearSelectedCartItems:", error);
    if (showToast) toast.error("Failed to clear selected items");
    return false;
  }
}

// Helper function to get cart statistics for debugging
export async function getCartStats(userId: string): Promise<{
  total: number;
  selected: number;
  unselected: number;
}> {
  try {
    const allItems = await getCartItems(userId);
    const selectedItems = allItems.filter((item) => item.selected);

    return {
      total: allItems.length,
      selected: selectedItems.length,
      unselected: allItems.length - selectedItems.length,
    };
  } catch (error) {
    console.error("Error getting cart stats:", error);
    return { total: 0, selected: 0, unselected: 0 };
  }
}

/**
 * Fetch all active additional services
 */
export async function getAdditionalServices(): Promise<AdditionalService[]> {
  try {
    const { data, error } = await supabase
      .from("additional_services")
      .select("*")
      .eq("is_active", true)
      .order("service_name");

    if (error) {
      console.error("Error fetching additional services:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAdditionalServices:", error);
    return [];
  }
}

/**
 * Fetch all active freight charges
 */
export async function getFreightCharges(): Promise<FreightCharge[]> {
  try {
    const { data, error } = await supabase
      .from("freight_charges")
      .select("*")
      .eq("is_active", true)
      .order("min_volume");

    if (error) {
      console.error("Error fetching freight charges:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getFreightCharges:", error);
    return [];
  }
}

/**
 * Calculate additional services total
 */
export function calculateServicesTotal(
  selectedServices: { [key: string]: boolean },
  additionalServices: AdditionalService[],
  totalVolume: number
): number {
  return additionalServices.reduce((sum, service) => {
    if (selectedServices[service.service_code]) {
      return sum + service.rate_per_m3 * totalVolume;
    }
    return sum;
  }, 0);
}

/**
 * Get applicable freight charge based on total volume
 */
export function getApplicableFreightCharge(
  totalVolume: number,
  freightCharges: FreightCharge[]
): FreightCharge | null {
  if (totalVolume === 0) return null;

  return (
    freightCharges.find((charge) => {
      const minVol = charge.min_volume;
      const maxVol = charge.max_volume;

      if (maxVol === null) {
        return totalVolume >= minVol;
      } else {
        return totalVolume >= minVol && totalVolume <= maxVol;
      }
    }) || null
  );
}

/**
 * Calculate order totals including services and freight
 */
export function calculateOrderTotalsWithServices(
  cartItems: any[],
  selectedServices: { [key: string]: boolean } = {},
  additionalServices: AdditionalService[] = [],
  freightCharges: FreightCharge[] = []
) {
  const selectedItems = cartItems.filter((item) => item.selected);

  // Calculate subtotal from selected items
  const subtotal = selectedItems.reduce((sum, item) => {
    const itemPrice = getProductPrice(item.product, item.variant_type);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Calculate total volume
  const totalVolume = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate additional services total
  const servicesTotal = calculateServicesTotal(
    selectedServices,
    additionalServices,
    totalVolume
  );

  // Get applicable freight charge
  const applicableFreightCharge = getApplicableFreightCharge(
    totalVolume,
    freightCharges
  );
  const freightCost = applicableFreightCharge
    ? applicableFreightCharge.delivery_fee
    : 0;

  // Calculate tax (SST 6%) on subtotal + services + freight
  const taxableAmount = subtotal + servicesTotal + freightCost;
  const tax = taxableAmount * 0.06;

  // Calculate total
  const total = taxableAmount + tax;

  return {
    selectedItemsCount: selectedItems.length,
    totalVolume,
    subtotal,
    servicesTotal,
    freightCost,
    tax,
    total,
    applicableFreightCharge,
  };
}
