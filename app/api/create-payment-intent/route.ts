/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "Idempotency key required" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      selectedServices,
      additionalServices,
      freightCharges,
      totalVolume,
      userId,
    } = body;

    // Validate required data
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address required" },
        { status: 400 }
      );
    }

    // Check for existing order with this payment intent metadata (since no idempotency_key column)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, payment_intent_id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingOrder && existingOrder.payment_intent_id) {
      // Return existing payment intent if it exists and was created recently
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          existingOrder.payment_intent_id
        );

        if (paymentIntent.metadata.idempotencyKey === idempotencyKey) {
          return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            orderId: existingOrder.id,
          });
        }
      } catch (stripeError) {
        console.error("Error retrieving existing payment intent:", stripeError);
        // Continue to create new payment intent
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      // Get the correct price based on variant type
      let itemPrice = 0;

      if (item.product) {
        switch (item.variant_type) {
          case "pump":
            itemPrice = Number(item.product.pump_price) || 0;
            break;
          case "tremie_1":
            itemPrice = Number(item.product.tremie_1_price) || 0;
            break;
          case "tremie_2":
            itemPrice = Number(item.product.tremie_2_price) || 0;
            break;
          case "tremie_3":
            itemPrice = Number(item.product.tremie_3_price) || 0;
            break;
          default:
            itemPrice = Number(item.product.normal_price) || 0;
            break;
        }
      }

      return sum + itemPrice * item.quantity;
    }, 0);

    // Calculate services total (this will be stored in additional_services table)
    const servicesTotal = additionalServices.reduce(
      (sum: number, service: any) => {
        if (selectedServices && selectedServices[service.service_code]) {
          return sum + service.rate_per_m3 * totalVolume;
        }
        return sum;
      },
      0
    );

    // Calculate shipping cost
    let shippingCost = 0;
    if (totalVolume > 0 && freightCharges && Array.isArray(freightCharges)) {
      const applicableCharge = freightCharges.find((charge: any) => {
        const minVol = charge.min_volume;
        const maxVol = charge.max_volume;

        if (maxVol === null) {
          return totalVolume >= minVol;
        } else {
          return totalVolume >= minVol && totalVolume <= maxVol;
        }
      });

      shippingCost = applicableCharge ? applicableCharge.delivery_fee : 0;
    }

    const tax = (subtotal + servicesTotal + shippingCost) * 0.06;
    const total = subtotal + servicesTotal + shippingCost + tax;
    const stripeAmount = Math.round(total * 100); // Convert to cents

    // Create order record without idempotency_key column
    const orderData = {
      user_id: userId,
      subtotal: Number(subtotal),
      shipping_cost: Number(shippingCost),
      tax: Number(tax),
      total: Number(total),
      status: "pending" as const,
      payment_status: "pending" as const,
      address_id: shippingAddress.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order", details: orderError?.message },
        { status: 500 }
      );
    }

    // Create order items with correct prices using service role to bypass RLS
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => {
        // Calculate the correct price based on variant type
        let itemPrice = 0;

        if (item.product) {
          switch (item.variant_type) {
            case "pump":
              itemPrice = Number(item.product.pump_price) || 0;
              break;
            case "tremie_1":
              itemPrice = Number(item.product.tremie_1_price) || 0;
              break;
            case "tremie_2":
              itemPrice = Number(item.product.tremie_2_price) || 0;
              break;
            case "tremie_3":
              itemPrice = Number(item.product.tremie_3_price) || 0;
              break;
            default:
              itemPrice = Number(item.product.normal_price) || 0;
              break;
          }
        }

        return {
          order_id: order.id,
          product_id: item.product_id,
          name: item.product?.name || "Unknown Product",
          grade: item.product?.grade || "Standard",
          price: Number(itemPrice),
          quantity: Number(item.quantity),
          variant_type: item.variant_type || null,
          image_url: item.product?.image_url || null,
          created_at: new Date().toISOString(),
        };
      });

      // Try inserting order items with retries for RLS issues
      let itemsInserted = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!itemsInserted && retryCount < maxRetries) {
        try {
          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

          if (!itemsError) {
            itemsInserted = true;
          } else {
            console.error(
              `Order items creation error (attempt ${retryCount + 1}):`,
              itemsError
            );

            if (itemsError.code === "42501" && retryCount < maxRetries - 1) {
              // Wait a bit before retrying for permission issues
              await new Promise((resolve) => setTimeout(resolve, 500));
              retryCount++;
            } else {
              // For other errors or final retry, log and continue
              console.error(
                "Failed to create order items after retries:",
                itemsError
              );
              break;
            }
          }
        } catch (insertError) {
          console.error(
            `Order items insertion exception (attempt ${retryCount + 1}):`,
            insertError
          );
          retryCount++;
          if (retryCount >= maxRetries) break;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!itemsInserted) {
        // Don't fail the entire payment process, but log the issue
        console.error(
          "Order created but order items could not be inserted due to permissions"
        );
      }
    }

    // Create additional services using the correct table name
    if (selectedServices && Object.keys(selectedServices).length > 0) {
      const additionalServiceRecords = Object.entries(selectedServices)
        .filter(([, service]) => service !== null)
        .map(([serviceCode]: [string, any]) => {
          const serviceData = additionalServices.find(
            (s: any) => s.service_code === serviceCode
          );
          return {
            order_id: order.id,
            additional_service_id: serviceData?.id || serviceCode,
            service_name: serviceData?.service_name || serviceCode,
            rate_per_m3: serviceData?.rate_per_m3 || 0,
            quantity: totalVolume,
            total_price: (serviceData?.rate_per_m3 || 0) * totalVolume,
            created_at: new Date().toISOString(),
          };
        });

      if (additionalServiceRecords.length > 0) {
        const { error: servicesError } = await supabase
          .from("order_additional_services")
          .insert(additionalServiceRecords);

        if (servicesError) {
          console.error(
            "Order additional services creation error:",
            servicesError
          );
          // Don't fail the entire process, just log the error
        }
      }
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: "myr",
      metadata: {
        orderId: order.id,
        userId: userId,
        idempotencyKey: idempotencyKey,
      },
    });

    // Update order with payment intent ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error(
        "Failed to update order with payment intent ID:",
        updateError
      );
      // Don't fail the process, payment intent is created
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
