import type { CartItem } from "@/type/cart";
import type { Address } from "@/lib/user/address";

export interface CreateOrderData {
  items: {
    product_id: string;
    quantity: number;
    variant_type?: string;
  }[];
  shipping_address: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  notes?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  client_secret: string;
  amount: number;
}

export async function createOrderAPI(
  userId: string,
  cartItems: CartItem[],
  address: Address,
  notes?: string
): Promise<CreateOrderResponse | null> {
  try {
    // Filter selected items and prepare for API
    const selectedItems = cartItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      throw new Error("No items selected");
    }

    const orderData: CreateOrderData & { user_id: string } = {
      user_id: userId,
      items: selectedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        // Add variant_type if you have variants in your cart
        // variant_type: item.variant_type,
      })),
      shipping_address: {
        full_name: address.full_name,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || undefined,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
        phone: address.phone || undefined,
      },
      notes,
    };

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
