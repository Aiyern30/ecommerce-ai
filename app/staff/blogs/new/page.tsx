import NewBlogPage from "@/components/Staff/Blogs/NewBlogsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Blog",
  description: "Create a new blog post with images and tags.",
  keywords: ["blog", "create", "new", "content"],
  openGraph: {
    title: "Create New Blog | Cement Products",
    description: "Create a new blog post with images and tags.",
    url: "/staff/blogs/new",
  },
};

export default function Page() {
  return <NewBlogPage />;
}
