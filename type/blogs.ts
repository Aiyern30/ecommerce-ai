export interface Blog {
  id: string;
  title: string;
  description: string | null;
  external_link: string | null;
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
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
