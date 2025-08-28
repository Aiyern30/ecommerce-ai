import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { OrderItem } from "@/type/order";

interface OrderWithItems {
  id: string;
  user_id: string;
  total: number;
  order_items: OrderItem[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    console.log("Processing payment verification for order:", orderId);

    // 1. Get order details first
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        total,
        order_items (
          product_id,
          quantity,
          variant_type
        )
      `
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const typedOrder = order as OrderWithItems;
    console.log("Order found with items:", typedOrder.order_items.length);

    // 2. Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "processing",
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Order update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    console.log("Order status updated successfully");

    // 3. Update product quantities using direct SQL updates
    if (typedOrder.order_items && typedOrder.order_items.length > 0) {
      console.log("Starting stock quantity updates...");

      const quantityUpdates = typedOrder.order_items.map(
        async (item: OrderItem, index: number) => {
          console.log(`Processing item ${index + 1}:`, {
            product_id: item.product_id,
            quantity: item.quantity,
            variant_type: item.variant_type,
          });

          try {
            // First get current stock
            const { data: product, error: fetchError } = await supabase
              .from("products")
              .select("stock_quantity, name")
              .eq("id", item.product_id)
              .single();

            if (fetchError) {
              console.error(
                `Failed to fetch product ${item.product_id}:`,
                fetchError
              );
              return { error: fetchError, product_id: item.product_id };
            }

            console.log(
              `Current stock for ${product.name}:`,
              product.stock_quantity
            );

            // Calculate new stock quantity (ensure it doesn't go below 0)
            const currentStock = Number(product.stock_quantity) || 0;
            const quantityToDeduct = Number(item.quantity) || 0;
            const newStock = Math.max(currentStock - quantityToDeduct, 0);

            console.log(
              `Updating stock: ${currentStock} - ${quantityToDeduct} = ${newStock}`
            );

            // Update stock quantity
            const { error: stockError, data: updateResult } = await supabase
              .from("products")
              .update({
                stock_quantity: newStock,
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.product_id)
              .select("stock_quantity");

            if (stockError) {
              console.error(
                `Failed to update stock for product ${item.product_id}:`,
                stockError
              );
              return { error: stockError, product_id: item.product_id };
            }

            console.log(
              `Stock updated successfully for ${product.name}:`,
              updateResult
            );
            return {
              error: null,
              product_id: item.product_id,
              new_stock: newStock,
            };
          } catch (itemError) {
            console.error(
              `Exception updating stock for product ${item.product_id}:`,
              itemError
            );
            return { error: itemError, product_id: item.product_id };
          }
        }
      );

      // Wait for all quantity updates and log results
      const results = await Promise.allSettled(quantityUpdates);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const value = result.value;
          if (value.error) {
            console.error(`Stock update failed for item ${index + 1}:`, value);
          } else {
            console.log(`Stock update succeeded for item ${index + 1}:`, value);
          }
        } else {
          console.error(
            `Stock update promise rejected for item ${index + 1}:`,
            result.reason
          );
        }
      });
    }

    // 4. Clear user's cart (remove selected items)
    console.log("Clearing user's cart...");

    // First get the user's cart ID
    const { data: userCart, error: cartFetchError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!cartFetchError && userCart) {
      const { error: cartClearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", userCart.id)
        .eq("selected", true);

      if (cartClearError) {
        console.error("Cart clear error:", cartClearError);
      } else {
        console.log("Cart cleared successfully");
      }
    } else {
      console.error("Failed to fetch user cart:", cartFetchError);
    }

    // 5. Create notification (fire and forget to avoid timeout)
    console.log("Creating notification...");

    supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title: "Order Confirmed",
        message: `Your order #${orderId.slice(
          -8
        )} has been confirmed and is being processed.`,
        type: "order",
        order_id: orderId,
        created_at: new Date().toISOString(),
      })
      .then(({ error: notificationError }) => {
        if (notificationError) {
          console.error("Notification creation error:", notificationError);
        } else {
          console.log("Notification created successfully");
        }
      });

    console.log("Payment verification completed successfully");

    return NextResponse.json({
      success: true,
      message: "Order verified and processed successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
