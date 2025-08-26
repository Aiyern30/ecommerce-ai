import type { CartItem } from "@/type/cart";
import { getProductPrice } from "@/lib/cart/utils";
import { SelectedServiceDetails } from "@/type/selectedServiceDetails";
import { AdditionalService } from "@/type/additionalService";
import { FreightCharge } from "@/type/freightCharges";
import { Order } from "@/type/order";

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
  notes?: string,
  selectedServices?: { [serviceCode: string]: SelectedServiceDetails | null },
  additionalServices?: AdditionalService[],
  freightCharges?: FreightCharge[],
  totalVolume?: number,
  isRecoveryAttempt?: boolean // New parameter for recovery attempts
) {
  try {
    // Filter selected items
    const selectedItems = cartItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      throw new Error("No items selected for order");
    }

    // Calculate totals (your existing calculation logic)
    const subtotal = selectedItems.reduce((sum, item) => {
      const itemPrice = getProductPrice(item.product, item.variant_type);
      return sum + itemPrice * item.quantity;
    }, 0);

    const servicesTotal =
      additionalServices?.reduce((sum, service) => {
        if (selectedServices?.[service.service_code]) {
          return sum + service.rate_per_m3 * (totalVolume || 0);
        }
        return sum;
      }, 0) || 0;

    const getApplicableFreightCharge = (): FreightCharge | null => {
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
    const shippingCost = applicableFreightCharge?.delivery_fee || 0;
    const taxableAmount = subtotal + servicesTotal + shippingCost;
    const tax = taxableAmount * 0.06;
    const total = taxableAmount + tax;

    // Prepare order data
    const orderData = {
      user_id: userId,
      address_id: addressId,
      payment_intent_id: paymentIntentId,
      subtotal,
      shipping_cost: shippingCost,
      tax,
      total,
      total_volume: totalVolume || 0,
      notes,
      selected_services: selectedServices,
      additional_services_data: additionalServices,
      is_recovery_attempt: isRecoveryAttempt, // Include recovery flag
      items: selectedItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        variant_type: item.variant_type,
        price: getProductPrice(item.product, item.variant_type),
      })),
    };

    console.log("Creating order with data:", {
      ...orderData,
      isRecoveryAttempt,
      paymentIntentId,
    });

    // Call the enhanced API endpoint
    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      // Handle different error scenarios
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response is not valid JSON, use status text
        errorMessage = `${response.status} ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    // Check if response has content before parsing JSON
    const responseText = await response.text();
    if (!responseText) {
      throw new Error("Empty response from server");
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse response:", responseText);
      throw new Error("Invalid JSON response from server");
    }

    console.log("Order creation result:", result);

    return result;
  } catch (error) {
    console.error("Error in createOrderAPI:", error);
    throw error;
  }
}

export async function getOrderById(
  orderId: string,
  userId: string
): Promise<Order | null> {
  try {
    const response = await fetch(
      `/api/orders?user_id=${userId}&order_id=${orderId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch order");
    }

    const data = await response.json();
    if (Array.isArray(data.orders)) {
      const order = data.orders.find((o: Order) => o.id === orderId);
      return order || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}
