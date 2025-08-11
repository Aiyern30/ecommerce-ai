/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { CreateOrderRequest } from "@/type/order";
import { createNotification } from "@/lib/notification/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Create order API called");
    const body = (await request.json()) as CreateOrderRequest & {
      user_id: string;
      payment_intent_id?: string;
      address_id: string;
      subtotal: number;
      shipping_cost: number;
      tax: number;
      total: number;
      items: {
        product_id: string;
        quantity: number;
        variant_type?: string;
        price: number; // Add price field
      }[];
    };
    console.log("Request body:", body);

    // Validate request
    if (!body.items || body.items.length === 0) {
      console.log("No items in order");
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Validate totals are provided
    if (
      body.subtotal === undefined ||
      body.shipping_cost === undefined ||
      body.tax === undefined ||
      body.total === undefined
    ) {
      console.log("Missing totals in request");
      return NextResponse.json(
        { error: "Order totals are required" },
        { status: 400 }
      );
    }

    // If payment_intent_id is provided, verify it's completed
    let paymentStatus = "pending";
    if (body.payment_intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          body.payment_intent_id
        );
        if (paymentIntent.status === "succeeded") {
          paymentStatus = "paid";
          console.log("Using completed payment:", body.payment_intent_id);
        } else {
          console.log("Payment intent status:", paymentIntent.status);
          return NextResponse.json(
            { error: `Payment not completed. Status: ${paymentIntent.status}` },
            { status: 400 }
          );
        }
      } catch (stripeError) {
        console.error("Error verifying payment intent:", stripeError);
        return NextResponse.json(
          { error: "Invalid payment intent" },
          { status: 400 }
        );
      }
    }

    // Fetch product details from database for order items
    const productIds = body.items.map((item) => item.product_id);
    // Fetch products with images
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*, product_images(id, image_url, is_primary, sort_order)")
      .in("id", productIds);

    if (productError) {
      console.error("Product fetch error:", productError);
      return NextResponse.json(
        { error: `Failed to fetch product details: ${productError.message}` },
        { status: 400 }
      );
    }

    if (!products) {
      console.log("No products found");
      return NextResponse.json({ error: "No products found" }, { status: 400 });
    }

    // Log the first product to see available fields
    console.log("Sample product data:", products[0]);

    // Create order items for database storage (but use frontend totals)
    const orderItems = [];

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found` },
          { status: 400 }
        );
      }

      // Find main image (is_primary or first)
      let image_url = null;
      if (product.product_images && product.product_images.length > 0) {
        const primary = product.product_images.find(
          (img: any) => img.is_primary
        );
        image_url = primary
          ? primary.image_url
          : product.product_images[0].image_url;
      }

      orderItems.push({
        product_id: item.product_id,
        name: product.name,
        grade: product.grade || "",
        price: item.price,
        quantity: item.quantity,
        variant_type: item.variant_type,
        image_url, // <-- Store image_url directly in order item
      });
    }

    // Use totals from frontend instead of recalculating
    const subtotal = body.subtotal;
    const shipping_cost = body.shipping_cost;
    const tax = body.tax;
    const total = body.total;

    console.log("Using frontend calculated totals:", {
      subtotal,
      shipping_cost,
      tax,
      total,
    });

    // Create order in database using admin client to bypass RLS
    console.log("Creating order with data:", {
      user_id: body.user_id,
      address_id: body.address_id,
      subtotal,
      shipping_cost,
      tax,
      total,
      payment_status: paymentStatus,
      payment_intent_id: body.payment_intent_id,
    });

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: body.user_id,
        address_id: body.address_id,
        status: "pending",
        payment_status: paymentStatus,
        payment_intent_id: body.payment_intent_id,
        subtotal: subtotal,
        shipping_cost: shipping_cost,
        tax: tax,
        total: total,
        notes: body.notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        {
          error: `Failed to create order: ${
            orderError.message ||
            orderError.details ||
            JSON.stringify(orderError)
          }`,
        },
        { status: 500 }
      );
    }

    if (!order) {
      console.log("No order returned");
      return NextResponse.json(
        { error: "Failed to create order - no data returned" },
        { status: 500 }
      );
    }

    // Create order items using admin client
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    console.log("Creating order items:", orderItemsWithOrderId);

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      // Rollback order creation
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        {
          error: `Failed to create order items: ${
            itemsError.message || JSON.stringify(itemsError)
          }`,
        },
        { status: 500 }
      );
    }

    // Create notification for successful order
    const orderIdFormatted = order.id;
    const notificationTitle =
      paymentStatus === "paid" ? "Order Placed Successfully!" : "Order Created";
    const notificationMessage =
      paymentStatus === "paid"
        ? `Your order ${orderIdFormatted} has been placed successfully and payment confirmed. Total: RM${total.toFixed(
            2
          )}`
        : `Your order ${orderIdFormatted} has been created. Total: RM${total.toFixed(
            2
          )}`;

    await createNotification({
      user_id: body.user_id,
      title: notificationTitle,
      message: notificationMessage,
      type: "order",
      order_id: order.id,
    });

    console.log("Order notification created");

    // Clear selected cart items after successful order creation using your existing logic
    try {
      // Use the same logic as your clearCart function but with admin client
      const { data: cartData } = await supabaseAdmin
        .from("carts")
        .select("id")
        .eq("user_id", body.user_id)
        .single();

      if (cartData?.id) {
        // Clear only selected items (or all items if you prefer)
        const { error: deleteError } = await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("cart_id", cartData.id)
          .eq("selected", true); // Only clear selected items

        if (deleteError) {
          console.warn("Failed to clear selected cart items:", deleteError);
        } else {
          console.log("Selected cart items cleared successfully");
        }
      }
    } catch (cartError) {
      console.warn("Failed to clear cart items:", cartError);
      // Don't fail the order creation if cart clearing fails
    }

    return NextResponse.json({
      order_id: order.id,
      amount: total,
      payment_completed: paymentStatus === "paid",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
