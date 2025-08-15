/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { CreateOrderRequest } from "@/type/order";
import { createNotification } from "@/lib/notification/server";

// Add interface for selected services
interface SelectedServiceDetails {
  id: string;
  service_code: string;
  service_name: string;
  rate_per_m3: number;
  total_price: number;
  description?: string;
}

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
      total_volume: number;
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

    console.log("Request body:", body);
    console.log("Selected services received:", body.selected_services);
    console.log("Additional services data:", body.additional_services_data);
    console.log("Total volume received:", body.total_volume);

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

    // --- Update product stock_quantity for each ordered item ---
    for (const item of body.items) {
      // Fetch current stock
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
      }
    }
    // --- End update stock ---

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

    // Replace your additional services section with this comprehensive debug version

    if (
      body.selected_services &&
      body.additional_services_data &&
      body.total_volume
    ) {
      console.log("=== COMPREHENSIVE ADDITIONAL SERVICES DEBUG ===");

      // Step 1: Log raw input data
      console.log("1. RAW INPUT DATA:");
      console.log(
        "selected_services:",
        JSON.stringify(body.selected_services, null, 2)
      );
      console.log(
        "additional_services_data:",
        JSON.stringify(body.additional_services_data, null, 2)
      );
      console.log(
        "total_volume:",
        body.total_volume,
        "type:",
        typeof body.total_volume
      );

      // Step 2: Filter selected services
      const selectedServiceCodes = Object.keys(body.selected_services).filter(
        (code) => body.selected_services![code] !== null
      );
      console.log("2. SELECTED SERVICE CODES:", selectedServiceCodes);

      if (selectedServiceCodes.length > 0) {
        // Step 3: Find matching services
        const selectedServicesData = body.additional_services_data.filter(
          (service) => selectedServiceCodes.includes(service.service_code)
        );
        console.log(
          "3. MATCHED SERVICES DATA:",
          JSON.stringify(selectedServicesData, null, 2)
        );

        if (selectedServicesData.length > 0) {
          // Step 4: Validate each service ID exists in database
          console.log("4. VALIDATING SERVICE IDs IN DATABASE:");
          for (const service of selectedServicesData) {
            console.log(`Checking service ID: ${service.id}`);
            const { data: serviceExists, error: checkError } =
              await supabaseAdmin
                .from("additional_services")
                .select("id, service_name, service_code")
                .eq("id", service.id)
                .single();

            if (checkError) {
              console.error(
                `❌ Service ID ${service.id} check failed:`,
                checkError
              );
            } else if (serviceExists) {
              console.log(`✅ Service ID ${service.id} exists:`, serviceExists);
            } else {
              console.log(`❌ Service ID ${service.id} not found in database`);
            }
          }

          // Step 5: Create insertion data with explicit type conversion
          console.log("5. CREATING INSERTION DATA:");
          const orderAdditionalServices = selectedServicesData.map(
            (service, index) => {
              const totalVolume = body.total_volume;
              const ratePerM3 = parseFloat(service.rate_per_m3);

              const orderService = {
                order_id: order.id,
                additional_service_id: service.id,
                service_name: String(service.service_name),
                rate_per_m3: ratePerM3,
                quantity: totalVolume,
                total_price: ratePerM3 * totalVolume,
              };

              console.log(`Service ${index + 1} mapped:`, {
                ...orderService,
                calculations: {
                  originalRate: service.rate_per_m3,
                  originalVolume: body.total_volume,
                  parsedRate: ratePerM3,
                  parsedVolume: totalVolume,
                  calculation: `${ratePerM3} × ${totalVolume} = ${
                    ratePerM3 * totalVolume
                  }`,
                },
              });

              return orderService;
            }
          );

          console.log(
            "6. FINAL INSERTION ARRAY:",
            JSON.stringify(orderAdditionalServices, null, 2)
          );

          // Step 6: Validate each record before insertion
          console.log("7. VALIDATING EACH RECORD:");
          let hasValidationErrors = false;

          for (const [index, service] of orderAdditionalServices.entries()) {
            console.log(`Validating record ${index + 1}:`);

            const validations = [
              {
                field: "order_id",
                value: service.order_id,
                valid: !!service.order_id,
              },
              {
                field: "additional_service_id",
                value: service.additional_service_id,
                valid: !!service.additional_service_id,
              },
              {
                field: "service_name",
                value: service.service_name,
                valid: !!service.service_name,
              },
              {
                field: "rate_per_m3",
                value: service.rate_per_m3,
                valid: !isNaN(service.rate_per_m3) && service.rate_per_m3 > 0,
              },
              {
                field: "quantity",
                value: service.quantity,
                valid: !isNaN(service.quantity) && service.quantity > 0,
              },
              {
                field: "total_price",
                value: service.total_price,
                valid: !isNaN(service.total_price) && service.total_price >= 0,
              },
            ];

            for (const validation of validations) {
              if (!validation.valid) {
                console.error(
                  `❌ ${validation.field}: ${validation.value} (invalid)`
                );
                hasValidationErrors = true;
              } else {
                console.log(`✅ ${validation.field}: ${validation.value}`);
              }
            }
          }

          if (hasValidationErrors) {
            console.error("❌ VALIDATION ERRORS FOUND - SKIPPING INSERTION");
            return;
          }

          // Step 7: Test with a single record first
          console.log("8. TESTING WITH SINGLE RECORD:");
          const testRecord = orderAdditionalServices[0];

          try {
            const { data: singleTestData, error: singleTestError } =
              await supabaseAdmin
                .from("order_additional_services")
                .insert(testRecord)
                .select();

            if (singleTestError) {
              console.error("❌ SINGLE RECORD TEST FAILED:");
              console.error("Error code:", singleTestError.code);
              console.error("Error message:", singleTestError.message);
              console.error("Error details:", singleTestError.details);
              console.error("Error hint:", singleTestError.hint);
              console.error(
                "Full error:",
                JSON.stringify(singleTestError, null, 2)
              );
              return;
            } else {
              console.log("✅ SINGLE RECORD TEST SUCCESS:", singleTestData);

              // If single test worked, delete it and proceed with full insertion
              if (singleTestData && singleTestData[0]) {
                await supabaseAdmin
                  .from("order_additional_services")
                  .delete()
                  .eq("id", singleTestData[0].id);
                console.log("Test record cleaned up");
              }
            }
          } catch (singleTestException) {
            console.error(
              "❌ SINGLE RECORD TEST EXCEPTION:",
              singleTestException
            );
            return;
          }

          // Step 8: Proceed with full insertion
          console.log("9. PROCEEDING WITH FULL INSERTION:");

          try {
            const { data: insertedServices, error: addServicesError } =
              await supabaseAdmin
                .from("order_additional_services")
                .insert(orderAdditionalServices)
                .select();

            if (addServicesError) {
              console.error("❌ FULL INSERTION FAILED:");
              console.error("Error code:", addServicesError.code);
              console.error("Error message:", addServicesError.message);
              console.error("Error details:", addServicesError.details);
              console.error("Error hint:", addServicesError.hint);
              console.error(
                "Full error:",
                JSON.stringify(addServicesError, null, 2)
              );
            } else {
              console.log("✅ FULL INSERTION SUCCESS!");
              console.log(
                "Inserted records count:",
                insertedServices?.length || 0
              );
              console.log(
                "Inserted data:",
                JSON.stringify(insertedServices, null, 2)
              );

              // Verify insertion by querying back
              const { data: verifyData, error: verifyError } =
                await supabaseAdmin
                  .from("order_additional_services")
                  .select("*")
                  .eq("order_id", order.id);

              if (verifyError) {
                console.error("❌ VERIFICATION QUERY FAILED:", verifyError);
              } else {
                console.log(
                  "✅ VERIFICATION SUCCESS - Records in DB:",
                  verifyData?.length || 0
                );
                console.log(
                  "Verified data:",
                  JSON.stringify(verifyData, null, 2)
                );
              }
            }
          } catch (insertException) {
            console.error("❌ INSERTION EXCEPTION:", insertException);
          }
        } else {
          console.log("❌ No matching additional services found");
        }
      } else {
        console.log("❌ No additional services selected");
      }

      console.log("=== DEBUG END ===");
    } else {
      console.log("❌ Missing required data for additional services");
    }

    // --- End insert additional services ---

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
