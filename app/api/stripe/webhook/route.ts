import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.order_id;
  const userId = paymentIntent.metadata.user_id;

  if (!orderId) {
    console.error("No order_id in payment intent metadata");
    return;
  }

  console.log(
    `Processing payment success for order ${orderId}, user ${userId}`
  ); // Debug log

  // Update order status using admin client to bypass RLS
  const { error: orderError } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "paid",
      status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (orderError) {
    console.error("Failed to update order status:", orderError);
    return;
  }

  // Update product stock quantities
  const { data: orderItems, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (itemsError || !orderItems) {
    console.error("Failed to fetch order items:", itemsError);
    return;
  }

  // Reduce stock for each product
  for (const item of orderItems) {
    const { error: stockError } = await supabaseAdmin.rpc("decrease_stock", {
      product_id: item.product_id,
      quantity: item.quantity,
    });

    if (stockError) {
      console.error(
        "Failed to update stock for product:",
        item.product_id,
        stockError
      );
    }
  }

  // Clear selected cart items as backup (in case frontend clearing fails)
  if (userId) {
    try {
      // First get the user's cart
      const { data: cart } = await supabaseAdmin
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (cart) {
        // Clear only selected items
        const { error: clearError } = await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("cart_id", cart.id)
          .eq("selected", true);

        if (clearError) {
          console.error(
            "Failed to clear selected cart items in webhook:",
            clearError
          );
        } else {
          console.log(`Cleared selected cart items for user ${userId}`);
        }
      }
    } catch (cartError) {
      console.error("Error clearing cart in webhook:", cartError);
    }
  }

  console.log(`Payment succeeded for order ${orderId}`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.order_id;

  if (!orderId) {
    console.error("No order_id in payment intent metadata");
    return;
  }

  console.log(`Processing payment failure for order ${orderId}`); // Debug log

  // Update order status using admin client to bypass RLS
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "failed",
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Failed to update order status:", error);
    return;
  }

  console.log(`Payment failed for order ${orderId}`);
}
