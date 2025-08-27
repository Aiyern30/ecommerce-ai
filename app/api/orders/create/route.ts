/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { CreateOrderRequest } from "@/type/order";
import { createNotification } from "@/lib/notification/server";

interface SelectedServiceDetails {
  id: string;
  service_code: string;
  service_name: string;
  rate_per_m3: number;
  total_price: number;
  description?: string;
}

function handleError(error: any, operation: string) {
  console.error(`${operation} error:`, error);

  if (error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return `${operation} failed - please try again`;
}

export async function POST(request: NextRequest) {
  try {
    let body;

    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.log("Request body parsed successfully");

    const requestData = body as CreateOrderRequest & {
      user_id: string;
      payment_intent_id?: string;
      address_id: string;
      subtotal: number;
      shipping_cost: number;
      tax: number;
      total: number;
      total_volume: number;
      is_recovery_attempt?: boolean;
      selected_services?: {
        [serviceCode: string]: SelectedServiceDetails | null;
      };
      additional_services_data?: any[];
      items: {
        product_id: string;
        quantity: number;
        variant_type?: string;
        price: number;
      }[];
    };

    if (!requestData.items || requestData.items.length === 0) {
      console.log("No items in order");
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    if (
      requestData.subtotal === undefined ||
      requestData.shipping_cost === undefined ||
      requestData.tax === undefined ||
      requestData.total === undefined
    ) {
      console.log("Missing totals in request");
      return NextResponse.json(
        { error: "Order totals are required" },
        { status: 400 }
      );
    }

    if (!requestData.user_id) {
      console.log("Missing user_id");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!requestData.address_id) {
      console.log("Missing address_id");
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    console.log("Request validation passed");

    let paymentStatus = "pending";
    let orderStatus = "pending";
    let paymentVerified = false;

    if (requestData.payment_intent_id) {
      try {
        console.log("Verifying payment intent:", requestData.payment_intent_id);
        const paymentIntent = await stripe.paymentIntents.retrieve(
          requestData.payment_intent_id
        );

        if (paymentIntent.status === "succeeded") {
          paymentStatus = "paid";
          paymentVerified = true;
          console.log("Payment verified as succeeded");
        } else {
          paymentStatus = "failed";
          orderStatus = "failed";
        }
      } catch (stripeError) {
        console.error("Error verifying payment intent:", stripeError);
        paymentStatus = "failed";
        orderStatus = "failed";
      }
    }

    // Check for existing order with payment_intent_id before any creation
    if (requestData.payment_intent_id && !requestData.is_recovery_attempt) {
      const { data: existingOrder } = await supabaseAdmin
        .from("orders")
        .select("id, status, payment_status")
        .eq("payment_intent_id", requestData.payment_intent_id)
        .single();

      if (existingOrder) {
        return NextResponse.json({
          order_id: existingOrder.id,
          amount: requestData.total,
          payment_completed: existingOrder.payment_status === "paid",
          already_exists: true,
          order_status: existingOrder.status,
          payment_status: existingOrder.payment_status,
        });
      }
    }

    // Prepare order items before creating order
    const productIds = requestData.items.map((item) => item.product_id);
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*, product_images(id, image_url, is_primary, sort_order)")
      .in("id", productIds);

    if (productError) {
      const errorMsg = handleError(productError, "Product fetch");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    if (!products) {
      return NextResponse.json({ error: "No products found" }, { status: 400 });
    }

    const orderItems = [];
    for (const item of requestData.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found` },
          { status: 400 }
        );
      }
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
        image_url,
      });
    }

    // Now create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: requestData.user_id,
        address_id: requestData.address_id,
        status: orderStatus,
        payment_status: paymentStatus,
        payment_intent_id: requestData.payment_intent_id,
        subtotal: requestData.subtotal,
        shipping_cost: requestData.shipping_cost,
        tax: requestData.tax,
        total: requestData.total,
        notes: requestData.notes,
      })
      .select()
      .single();

    if (orderError) {
      const errorMsg = handleError(orderError, "Order creation");
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json(
        { error: "Failed to create order - no data returned" },
        { status: 500 }
      );
    }

    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    console.log("Creating order items, count:", orderItemsWithOrderId.length);

    // Create order items, if fails, delete the order to prevent duplicate on retry
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsWithOrderId);

    // Only deletes the order created in this request if order_items fails:
    if (itemsError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        {
          error: `Failed to create order items: ${handleError(
            itemsError,
            "Order items creation"
          )}`,
          order_id: order.id,
          order_status: "failed",
          payment_status: paymentStatus,
          deleted_partial_order: true,
        },
        { status: 500 }
      );
    }

    try {
      const orderIdFormatted = order.id;
      let notificationTitle: string;
      let notificationMessage: string;
      let notificationType:
        | "order"
        | "promotion"
        | "system"
        | "payment"
        | "shipping" = "order";

      if (orderStatus === "failed") {
        notificationTitle = "Order Failed";
        notificationMessage = `Order ${orderIdFormatted} failed to process. Please contact support if payment was charged.`;
        notificationType = "order";
      } else if (paymentStatus === "paid") {
        notificationTitle = "Order Placed Successfully!";
        notificationMessage = `Your order ${orderIdFormatted} has been placed successfully and payment confirmed. Total: RM${requestData.total.toFixed(
          2
        )}`;
        notificationType = "order";
      } else {
        notificationTitle = "Order Created";
        notificationMessage = `Your order ${orderIdFormatted} has been created. Total: RM${requestData.total.toFixed(
          2
        )}`;
        notificationType = "order";
      }

      await createNotification({
        user_id: requestData.user_id,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        id: order.id,
      });
    } catch (notificationError) {
      console.warn("Failed to create notification:", notificationError);
      // Don't  the order for notification errors
    }

    if (orderStatus !== "failed" && paymentVerified) {
      console.log("Updating stock quantities");
      for (const item of requestData.items) {
        try {
          const { data: product, error: fetchError } = await supabaseAdmin
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          if (fetchError) {
            console.warn(
              `Failed to fetch stock for product ${item.product_id}:`,
              fetchError
            );
            continue;
          }

          const newStock = (product?.stock_quantity || 0) - item.quantity;

          const { error: stockError } = await supabaseAdmin
            .from("products")
            .update({ stock_quantity: newStock })
            .eq("id", item.product_id);

          if (stockError) {
            console.warn(
              `Failed to update stock for product ${item.product_id}:`,
              stockError
            );
          } else {
            console.log(
              `Updated stock for product ${item.product_id}: ${newStock}`
            );
          }
        } catch (stockUpdateError) {
          console.warn(
            `Error updating stock for product ${item.product_id}:`,
            stockUpdateError
          );
        }
      }
    } else {
      console.log(
        "Skipping stock update - order failed or payment not verified"
      );
    }

    if (orderStatus !== "failed" && paymentVerified) {
      console.log("Clearing cart items");
      try {
        const { data: cartData } = await supabaseAdmin
          .from("carts")
          .select("id")
          .eq("user_id", requestData.user_id)
          .single();

        if (cartData?.id) {
          const { error: deleteError } = await supabaseAdmin
            .from("cart_items")
            .delete()
            .eq("cart_id", cartData.id)
            .eq("selected", true);

          if (deleteError) {
            console.warn("Failed to clear selected cart items:", deleteError);
          } else {
            console.log("Selected cart items cleared successfully");
          }
        }
      } catch (cartError) {
        console.warn("Failed to clear cart items:", cartError);
      }
    }

    if (
      orderStatus !== "failed" &&
      paymentVerified &&
      requestData.selected_services &&
      requestData.additional_services_data &&
      requestData.total_volume
    ) {
      try {
        const selectedServiceCodes = Object.keys(
          requestData.selected_services
        ).filter((code) => requestData.selected_services![code] !== null);

        if (selectedServiceCodes.length > 0) {
          const selectedServicesData =
            requestData.additional_services_data.filter((service) =>
              selectedServiceCodes.includes(service.service_code)
            );

          if (selectedServicesData.length > 0) {
            const orderAdditionalServices = selectedServicesData.map(
              (service) => ({
                order_id: order.id,
                additional_service_id: service.id,
                service_name: String(service.service_name),
                rate_per_m3: parseFloat(service.rate_per_m3),
                quantity: requestData.total_volume,
                total_price:
                  parseFloat(service.rate_per_m3) * requestData.total_volume!,
              })
            );

            const { error: addServicesError } = await supabaseAdmin
              .from("order_additional_services")
              .insert(orderAdditionalServices);

            if (addServicesError) {
              console.error(
                "Failed to insert additional services:",
                addServicesError
              );
            } else {
              console.log("Additional services inserted successfully");
            }
          }
        }
      } catch (servicesError) {
        console.warn("Error processing additional services:", servicesError);
      }
    }

    console.log("Order creation completed successfully");

    return NextResponse.json({
      order_id: order.id,
      amount: requestData.total,
      payment_completed: paymentStatus === "paid",
      order_status: orderStatus,
      payment_status: paymentStatus,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/orders:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
