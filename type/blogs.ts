export interface Blog {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  blog_images: { image_url: string }[] | null;
  blog_tags:
    | {
        tags: {
          id: string;
          name: string;
        }[];
      }[]
    | null;
  link: string | null;
  link_name: string | null;
  content?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
