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
  Skeleton,
} from "@/components/ui/";
import { Button } from "@/components/ui/";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 4;

  const fetchBlogs = async (pageNumber: number) => {
    const from = pageNumber * LIMIT;
    const to = from + LIMIT - 1;

    const { data, error } = await supabase
      .from("blogs")
      .select(
        `
        id, title, description, external_link, status, created_at, updated_at,
        blog_images ( image_url ),
        blog_tags ( tags ( id, name ) )
      `
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Failed to fetch blogs:", error.message);
      return;
    }

    const validBlogs = data.filter(
      (blog) => blog.title && blog.blog_images && blog.blog_images.length > 0
    );

    setBlogs((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const uniqueNew = validBlogs.filter((b) => !existingIds.has(b.id));
      return [...prev, ...uniqueNew];
    });
    if (validBlogs.length < LIMIT) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBlogs(page).finally(() => setLoading(false));
  }, [page]);

  const loadMore = () => setPage((prev) => prev + 1);

  const columnCount =
    blogs.length === 1
      ? "grid-cols-1"
      : blogs.length === 2
      ? "grid-cols-2"
      : blogs.length === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">All Blogs</h2>

        <div className={`grid gap-6 sm:grid-cols-2 md:${columnCount}`}>
          {blogs.map((post) => (
            <Card key={post.id} className="overflow-hidden group relative py-0">
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

        {loading && (
          <div className={`grid gap-6 sm:grid-cols-2 md:${columnCount}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-0 relative h-52">
                  <Skeleton className="absolute inset-0 w-full h-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </CardContent>
                <CardFooter className="px-4 pb-4">
                  <Skeleton className="h-4 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && hasMore && (
          <div className="mt-8 text-center">
            <Button onClick={loadMore} className="bg-blue-700 text-white">
              Load More
            </Button>
          </div>
        )}

        {!hasMore && (
          <p className="mt-8 text-center text-muted-foreground">
            No more blogs to load.
          </p>
        )}
      </div>
    </section>
  );
}
