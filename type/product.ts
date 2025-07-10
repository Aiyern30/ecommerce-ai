export interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  price: number;
  unit: string | null;
  stock_quantity: number | null;
  grade?: string | null;
  created_at: string;
  updated_at: string;
  product_images: { image_url: string }[] | null;
  product_tags:
    | {
        tags: {
          id: string;
          name: string;
        };
      }[]
    | null;
  product_certificates: { certificate: string }[] | null;
  product_variants?:
    | {
        id: string;
        variant_type: string;
        price: number;
      }[]
    | null;
}
