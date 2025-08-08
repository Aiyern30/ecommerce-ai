export interface Post {
  id: string;
  title: string;
  description: string | null;
  mobile_description?: string | null;
  link_name: string | null;
  link: string | null;
  image_url: string | null;
  status?: "draft" | "published";
  created_at: string;
  updated_at: string;
}
