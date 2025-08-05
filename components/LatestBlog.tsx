"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ZoomIn } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Blog } from "@/type/blogs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/";
import { Button } from "@/components/ui/";

export default function LatestBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select(
          `
          id, title, description, external_link, status, created_at, updated_at,
          link, link_name,
          blog_images ( image_url ),
          blog_tags ( tags ( id, name ) )
        `
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Failed to fetch blogs:", error.message);
      } else {
        const validBlogs = data.filter(
          (blog) =>
            blog.title && blog.blog_images && blog.blog_images.length > 0
        );
        setBlogs(validBlogs);
      }

      setLoading(false);
    };

    fetchBlogs();
  }, []);

  const columnCount =
    blogs.length === 1
      ? "grid-cols-1"
      : blogs.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">LATEST BLOG</h2>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : blogs.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No blog posts found.
          </p>
        ) : (
          <div className={`grid gap-6 sm:grid-cols-2 md:${columnCount}`}>
            {blogs.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden group relative py-0"
              >
                <CardHeader className="p-0 relative h-52">
                  <Image
                    src={post.blog_images?.[0]?.image_url || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-3 bottom-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-2 bg-white rounded-full shadow hover:bg-gray-200">
                      <ZoomIn className="h-4 w-4 text-blue-600" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow hover:bg-gray-200">
                      <Heart className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <CardTitle className="text-base">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {post.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="px-4 pb-4">
                  <Button
                    asChild
                    variant="link"
                    className="p-0 text-sm text-blue-800"
                  >
                    <Link href={`/blogs/${post.id}`}>Read More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* View More Button */}
        {blogs.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/blogs">View More Blogs</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
