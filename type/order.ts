export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  variant_type?: string;
  image_url?: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_intent_id?: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface CreateOrderRequest {
  items: {
    product_id: string;
    quantity: number;
    variant_type?: string;
  }[];
  shipping_address: ShippingAddress;
  notes?: string;
}
