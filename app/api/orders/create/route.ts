import { type NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { CreateOrderRequest } from "@/type/order";

export async function POST(request: NextRequest) {
  try {
    console.log("Create order API called");
    const body = (await request.json()) as CreateOrderRequest & {
      user_id: string;
      payment_intent_id?: string;
    };
    console.log("Request body:", body);

    // Validate request
    if (!body.items || body.items.length === 0) {
      console.log("No items in order");
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
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

    // Fetch product details from database
    const productIds = body.items.map((item) => item.product_id);
    console.log("Fetching products:", productIds);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*")
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

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of body.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found` },
          { status: 400 }
        );
      }

      let price = product.price;
      // Check for variant pricing
      if (item.variant_type) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("price")
          .eq("product_id", item.product_id)
          .eq("variant_type", item.variant_type)
          .single();
        if (variant) {
          price = variant.price;
        }
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        name: product.name,
        price: price,
        quantity: item.quantity,
        variant_type: item.variant_type,
        image_url: product.image_url,
      });
    }

    // Calculate shipping and tax
    const shipping_cost = subtotal >= 100 ? 0 : 10; // Free shipping over RM100
    const tax_rate = 0.06; // 6% SST
    const tax = subtotal * tax_rate;
    const total = subtotal + shipping_cost + tax;

    // Create order in database using admin client to bypass RLS
    console.log("Creating order with data:", {
      user_id: body.user_id,
      subtotal,
      shipping_cost,
      tax,
      total,
      payment_status: paymentStatus,
      payment_intent_id: body.payment_intent_id,
      shipping_address: body.shipping_address,
    });

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: body.user_id,
        status: "pending",
        payment_status: paymentStatus, // "paid" if payment completed, "pending" otherwise
        payment_intent_id: body.payment_intent_id,
        subtotal: subtotal,
        shipping_cost: shipping_cost,
        tax: tax,
        total: total,
        shipping_address: body.shipping_address,
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

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      // Rollback order creation
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // Clear selected cart items after successful order creation
    try {
      // Get user's cart
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", body.user_id)
        .single();

      if (cart) {
        // Delete selected cart items
        await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("cart_id", cart.id)
          .eq("selected", true);
        console.log("Selected cart items cleared");
      }
    } catch (cartError) {
      console.warn("Failed to clear cart items:", cartError);
      // Don't fail the order creation if cart clearing fails
    }

    // Only return client_secret if we need to create a new payment (shouldn't happen in this flow)
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
