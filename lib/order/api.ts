import type { CartItem } from "@/type/cart";

export interface CreateOrderData {
  items: {
    product_id: string;
    quantity: number;
    variant_type?: string;
  }[];
  address_id: string; // Just pass the address ID
  notes?: string;
  payment_intent_id?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  client_secret?: string; // Optional since payment might already be completed
  amount: number;
  payment_already_completed?: boolean;
}

export async function createOrderAPI(
  userId: string,
  cartItems: CartItem[],
  addressId: string, // Just pass address ID
  paymentIntentId?: string,
  notes?: string
): Promise<CreateOrderResponse | null> {
  try {
    const selectedItems = cartItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      throw new Error("No items selected");
    }

    const orderData: CreateOrderData & { user_id: string } = {
      user_id: userId,
      address_id: addressId, // Pass address ID only
      items: selectedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      notes,
      payment_intent_id: paymentIntentId,
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
    return result.orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}
