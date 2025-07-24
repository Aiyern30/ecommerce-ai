import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CreateOrderRequest } from "@/type/order";

export async function POST(request: NextRequest) {
  try {
    console.log("Create order API called"); // Debug log

    const body = (await request.json()) as CreateOrderRequest & {
      user_id: string;
    };

    console.log("Request body:", body); // Debug log

    // Validate request
    if (!body.items || body.items.length === 0) {
      console.log("No items in order"); // Debug log
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Fetch product details from database
    const productIds = body.items.map((item) => item.product_id);
    console.log("Fetching products:", productIds); // Debug log

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productError) {
      console.error("Product fetch error:", productError); // Debug log
      return NextResponse.json(
        { error: `Failed to fetch product details: ${productError.message}` },
        { status: 400 }
      );
    }

    if (!products) {
      console.log("No products found"); // Debug log
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
    const shipping_cost = 15.0; // Fixed shipping for now
    const tax_rate = 0.08; // 8% tax
    const tax = subtotal * tax_rate;
    const total = subtotal + shipping_cost + tax;

    // Create order in database using admin client to bypass RLS
    console.log("Creating order with data:", {
      user_id: body.user_id,
      subtotal,
      shipping_cost,
      tax,
      total,
      shipping_address: body.shipping_address,
    }); // Debug log

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: body.user_id,
        status: "pending",
        payment_status: "pending",
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
      console.error("Order creation error:", orderError); // Debug log
      console.error("Full error details:", JSON.stringify(orderError, null, 2)); // More detailed error

      // Check if error is due to missing table
      if (
        orderError.message?.includes('relation "orders" does not exist') ||
        orderError.code === "PGRST116" ||
        orderError.details?.includes("does not exist")
      ) {
        return NextResponse.json(
          {
            error:
              "Database tables not found. Please run the database setup first.",
          },
          { status: 500 }
        );
      }

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
      console.log("No order returned"); // Debug log
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

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to sen (MYR cents)
      currency: "myr",
      metadata: {
        order_id: order.id,
        user_id: body.user_id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID using admin client
    await supabaseAdmin
      .from("orders")
      .update({ payment_intent_id: paymentIntent.id })
      .eq("id", order.id);

    return NextResponse.json({
      order_id: order.id,
      client_secret: paymentIntent.client_secret,
      amount: total,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
