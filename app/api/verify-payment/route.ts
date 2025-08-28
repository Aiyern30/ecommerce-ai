import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

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
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const typedOrder = order as OrderWithItems;

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
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    if (typedOrder.order_items && typedOrder.order_items.length > 0) {
      const quantityUpdates = typedOrder.order_items.map(
        async (item: OrderItem) => {
          try {
            const { data: product, error: fetchError } = await supabaseAdmin
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

            const currentStock = Number(product.stock_quantity) || 0;
            const quantityToDeduct = Number(item.quantity) || 0;
            const newStock = Math.max(currentStock - quantityToDeduct, 0);

            const { error: stockError, data: updateResult } =
              await supabaseAdmin
                .from("products")
                .update({
                  stock_quantity: newStock,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", item.product_id)
                .select("stock_quantity, name");

            if (stockError) {
              console.error(
                `Failed to update stock for product ${item.product_id}:`,
                stockError
              );
              return { error: stockError, product_id: item.product_id };
            }

            return {
              error: null,
              product_id: item.product_id,
              new_stock: newStock,
              updated_product: updateResult,
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

      const results = await Promise.allSettled(quantityUpdates);

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const value = result.value;
          if (value.error) {
          } else {
          }
        } else {
        }
      });
    }

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
      }
    } else {
      console.error("Failed to fetch user cart:", cartFetchError);
    }

    supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        title: "Order Placed Successfully!",
        message: `Your order ${orderId} has been placed successfully and payment confirmed. Total: RM${typedOrder.total.toFixed(
          2
        )}`,
        type: "order",
        order_id: orderId,
        created_at: new Date().toISOString(),
      })
      .then(({ error: notificationError }) => {
        if (notificationError) {
          console.error("Notification creation error:", notificationError);
        } else {
        }
      });

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
