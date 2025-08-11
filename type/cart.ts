export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_type?: string | null;
  quantity: number;
  selected: boolean;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    grade: string;
    product_type: "concrete" | "mortar";
    normal_price: number | null;
    pump_price: number | null;
    tremie_1_price: number | null;
    tremie_2_price: number | null;
    tremie_3_price: number | null;
    unit: string | null;
    image_url: string;
    stock_quantity: number | null;
    product_images?:
      | {
          id: string;
          image_url: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
        }[]
      | null;
  };
}
export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  cart_items?: CartItem[];
}
