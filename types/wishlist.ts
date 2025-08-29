export interface Wishlist {
  id: string;
  user_id: string;
  item_type: "blog" | "product";
  item_id: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistWithItem extends Wishlist {
  blog?: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    created_at: string;
    blog_images: { image_url: string }[];
    blog_tags: { tags: { id: string; name: string } }[];
  };
  product?: {
    id: string;
    name: string;
    description: string;
    grade: string;
    normal_price: number;
    product_images: { image_url: string; is_primary: boolean }[];
  };
}
