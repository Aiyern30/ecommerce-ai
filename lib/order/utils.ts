import { supabase } from "../supabase/browserClient";

export async function getRecentOrders(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      payment_status,
      subtotal,
      shipping_cost,
      tax,
      total,
      address_id,
      addresses (
        id,
        user_id,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default,
        created_at,
        updated_at
      ),
      order_items (
        id,
        order_id,
        product_id,
        name,
        grade,
        price,
        quantity,
        variant_type,
        image_url,
        created_at
      ),
      order_additional_services (
        id,
        additional_service_id,
        service_name,
        rate_per_m3,
        quantity,
        total_price
      ),
      created_at,
      updated_at,
      notes
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
