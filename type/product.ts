export interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  price: number;
  unit: string | null;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
}
