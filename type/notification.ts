export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "payment" | "shipping";
  read: boolean;
  order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system" | "payment" | "shipping";
  order_id?: string;
}
