export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "payment" | "shipping";
  read: boolean;
  order_id?: string;
  order?: {
    id: string;
    status: string;
    payment_status: string;
    total: number;
    created_at: string;
    order_items?: {
      id: string;
      name: string;
      grade: string;
      price: number;
      quantity: number;
      variant_type?: string | null;
    }[];
  };
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "payment" | "shipping";
  id?: string;
}
