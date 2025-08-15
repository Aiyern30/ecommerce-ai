export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  grade: string;
  price: number;
  quantity: number;
  variant_type?: string | null;
  image_url?: string | null;
  created_at: string;
}
export interface ShippingAddress {
  id: string; // <-- Add if you plan to ref the address
  user_id: string;
  full_name: string;
  phone?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdditionalService {
  id: string;
  additional_service_id: string;
  service_name: string;
  rate_per_m3: number;
  quantity: number;
  total_price: number;
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
  address_id: string;
  addresses?: ShippingAddress;
  order_items?: OrderItem[];
  additional_services?: AdditionalService[];
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
