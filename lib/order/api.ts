/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CartItem } from "@/type/cart";
import { getProductPrice } from "@/lib/cart/utils";

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

export async function createOrderAPI(
  userId: string,
  cartItems: CartItem[],
  addressId: string,
  paymentIntentId?: string,
  notes?: string
): Promise<CreateOrderResponse | null> {
  try {
    const selectedItems = cartItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      throw new Error("No items selected");
    }

    // Calculate totals using the shared function
    const totals = calculateOrderTotals(cartItems);

    const orderData: CreateOrderData & { user_id: string } = {
      user_id: userId,
      address_id: addressId,
      items: selectedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        variant_type: item.variant_type || undefined, // Convert null to undefined
        price: getProductPrice(item.product, item.variant_type), // Add calculated price
      })),
      notes,
      payment_intent_id: paymentIntentId,
      // Include calculated totals
      subtotal: totals.subtotal,
      shipping_cost: totals.shippingCost,
      tax: totals.tax,
      total: totals.total,
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
                // Fetch product image
                const productResponse = await fetch(
                  `/api/products/${item.product_id}`
                );
                if (productResponse.ok) {
                  const productData = await productResponse.json();
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
