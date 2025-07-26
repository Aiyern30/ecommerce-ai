export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  selected: boolean;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    unit: string;
  };
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  cart_items?: CartItem[];
}
