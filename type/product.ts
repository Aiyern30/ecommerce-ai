export interface Product {
  id: string;
  name: string;
  description: string | null;
  grade: string;
  product_type: "concrete" | "mortar";
  mortar_ratio: string | null;
  category: string | null;
  normal_price: number | null;
  pump_price: number | null;
  tremie_1_price: number | null;
  tremie_2_price: number | null;
  tremie_3_price: number | null;
  unit: string | null;
  stock_quantity: number | null;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  created_at: string;
  updated_at: string;

  // Related data from joins
  product_images:
    | {
        id: string;
        image_url: string;
        alt_text: string | null;
        is_primary: boolean;
        sort_order: number;
      }[]
    | null;
}
