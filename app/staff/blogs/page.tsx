import BlogsPage from "@/components/Staff/Blogs/BlogsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs Management",
  description:
    "Create, edit, and manage blog posts and articles for your website.",
  keywords: ["blogs", "articles", "content management", "cms"],
  openGraph: {
    title: "Blogs Management | Cement Products",
    description:
      "Create, edit, and manage blog posts and articles for your website.",
    url: "/staff/blogs",
  },
};

export default function Page() {
  return <BlogsPage />;
}
