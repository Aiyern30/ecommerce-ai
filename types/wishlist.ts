import type { Blog } from "@/type/blogs";
import type { Product } from "@/type/product";

export interface Wishlist {
  id: string;
  user_id: string;
  item_type: "blog" | "product";
  item_id: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistWithItem extends Wishlist {
  blog?: Blog;
  product?: Product;
}
