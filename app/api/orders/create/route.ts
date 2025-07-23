import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe-server";
import { supabase } from "@/lib/supabase";
import { CreateOrderRequest } from "@/type/order";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderRequest & {
      user_id: string;
    };

    // Validate request
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Fetch product details from database
    const productIds = body.items.map((item) => item.product_id);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productError || !products) {
      return NextResponse.json(
        { error: "Failed to fetch product details" },
        { status: 400 }
      );
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

    // Create order in database
    const { data: order, error: orderError } = await supabase
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

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      // Rollback order creation
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: "usd",
      metadata: {
        order_id: order.id,
        user_id: body.user_id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    await supabase
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
