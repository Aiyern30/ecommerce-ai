import { supabase } from "../supabase/browserClient";

export async function getRecentOrders(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      created_at,
      updated_at,
      total_amount,
      delivery_date,
      delivery_status,
      items:order_items (
        id,
        product_id,
        quantity,
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
}

export async function getOrderStatus(orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      delivery_status,
      delivery_date,
      updated_at
    `
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order status:", error);
    return null;
  }
  return data;
}
