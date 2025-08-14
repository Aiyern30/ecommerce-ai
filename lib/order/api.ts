/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CartItem } from "@/type/cart";
import { getProductPrice } from "@/lib/cart/utils";
import { SelectedServiceDetails } from "@/type/selectedServiceDetails";

export interface CreateOrderData {
  items: {
    product_id: string;
    quantity: number;
    variant_type?: string;
    price: number; // Add calculated price from frontend
  }[];
  address_id: string;
  notes?: string;
  payment_intent_id?: string;
  // Add calculated totals
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
}

export interface CreateOrderResponse {
  order_id: string;
  client_secret?: string;
  amount: number;
  payment_already_completed?: boolean;
}

// Helper function to calculate totals (shared logic)
export function calculateOrderTotals(cartItems: CartItem[]) {
  const selectedItems = cartItems.filter((item) => item.selected);

  const subtotal = selectedItems.reduce((sum, item) => {
    const price = getProductPrice(item.product, item.variant_type);
    return sum + price * item.quantity;
  }, 0);

  const selectedItemsCount = selectedItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  // Free shipping if subtotal >= 100
  const shippingCost = subtotal >= 100 ? 0 : 10;

  // Tax calculation (SST 6%)
  const tax = subtotal * 0.06;

  const total = subtotal + shippingCost + tax;

  return {
    subtotal,
    shippingCost,
    tax,
    total,
    selectedItemsCount,
  };
}

// New helper function for full order total
export function calculateFullOrderTotals(
  cartItems: CartItem[],
  selectedServices: { [serviceCode: string]: SelectedServiceDetails | null },
  additionalServices: any[],
  freightCharges: any[],
  totalVolume: number
) {
  const baseTotals = calculateOrderTotals(cartItems);

  // Additional services total
  const additionalServicesTotal = Object.values(selectedServices)
    .filter(Boolean)
    .reduce(
      (sum, service) => sum + (service?.rate_per_m3 ?? 0) * totalVolume,
      0
    );

  // Freight charges total (implement your logic if needed)
  // Example: const freightTotal = ...;
  const freightTotal = 0; // Replace with your logic if needed

  const total = baseTotals.total + additionalServicesTotal + freightTotal;

  return {
    ...baseTotals,
    additionalServicesTotal,
    freightTotal,
    total,
  };
}

export async function createOrderAPI(
  userId: string,
  cartItems: CartItem[],
  addressId: string,
  paymentIntentId?: string,
  notes?: string,
  selectedServices?: { [serviceCode: string]: SelectedServiceDetails | null },
  additionalServices?: any[],
  freightCharges?: any[],
  totalVolume?: number
): Promise<CreateOrderResponse | null> {
  try {
    const selectedItems = cartItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      throw new Error("No items selected");
    }

    // Calculate subtotal from selected items
    const subtotal = selectedItems.reduce((sum, item) => {
      const itemPrice = getProductPrice(item.product, item.variant_type);
      return sum + itemPrice * item.quantity;
    }, 0);

    // Calculate additional services total
    const servicesTotal =
      additionalServices?.reduce((sum, service) => {
        if (selectedServices?.[service.service_code]) {
          return sum + service.rate_per_m3 * (totalVolume || 0);
        }
        return sum;
      }, 0) || 0;

    // Get applicable freight charge
    const getApplicableFreightCharge = () => {
      if (!totalVolume || !freightCharges) return null;

      return (
        freightCharges.find((charge) => {
          const minVol = charge.min_volume;
          const maxVol = charge.max_volume;

          if (maxVol === null) {
            return totalVolume >= minVol;
          } else {
            return totalVolume >= minVol && totalVolume <= maxVol;
          }
        }) || null
      );
    };

    const applicableFreightCharge = getApplicableFreightCharge();
    const freightCost = applicableFreightCharge
      ? applicableFreightCharge.delivery_fee
      : 0;

    // Calculate tax (SST 6%) on subtotal + services + freight
    const taxableAmount = subtotal + servicesTotal + freightCost;
    const tax = taxableAmount * 0.06;

    // Calculate total
    const total = taxableAmount + tax;

    const orderData = {
      user_id: userId,
      address_id: addressId,
      items: selectedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        variant_type: item.variant_type || undefined,
        price: getProductPrice(item.product, item.variant_type),
      })),
      notes,
      payment_intent_id: paymentIntentId,
      subtotal,
      shipping_cost: freightCost,
      tax,
      total,
      total_volume: totalVolume || 0,
      // Pass the selected services with proper structure
      selected_services: selectedServices || {},
      // Pass additional services for reference
      additional_services_data: additionalServices || [],
    };

    console.log("Creating order with data:", orderData);

    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create order");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}

export async function confirmOrderAPI(paymentIntentId: string) {
  try {
    const response = await fetch("/api/orders/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to confirm order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error confirming order:", error);
    return null;
  }
}

export async function getUserOrders(userId: string) {
  try {
    const response = await fetch(`/api/orders?user_id=${userId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch orders");
    }

    const result = await response.json();

    // Enhance order items with product images
    const ordersWithImages = await Promise.all(
      result.orders.map(async (order: any) => {
        if (order.order_items && order.order_items.length > 0) {
          const enhancedItems = await Promise.all(
            order.order_items.map(async (item: any) => {
              try {
                // Fetch product image using product_id
                const productResponse = await fetch(
                  `/api/products/${item.product_id}`
                );
                if (productResponse.ok) {
                  const productData = await productResponse.json();
                  console.log(
                    "Fetched productData for order item:",
                    productData
                  ); // <-- Add this line
                  return {
                    ...item,
                    image_url: productData.image_url || null,
                  };
                }
              } catch (error) {
                console.warn(
                  `Failed to fetch image for product ${item.product_id}:`,
                  error
                );
              }
              return item; // Return original item if fetch fails
            })
          );

          return {
            ...order,
            order_items: enhancedItems,
          };
        }
        return order;
      })
    );

    return ordersWithImages;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}
