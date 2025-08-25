/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Blog } from "@/type/blogs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/";
import { Skeleton } from "@/components/ui/";
import { Button } from "@/components/ui/";
import { BlogCard } from "@/components/BlogCards";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
        id, title, description, status, created_at, updated_at,
        link, link_name, content,
        blog_images ( image_url ),
        blog_tags ( tags ( id, name ) )
      `
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Failed to fetch blogs:", error.message);
      return [];
    }

    if (!data) {
      return [];
    }

    const validBlogs = data.filter(
      (blog) => blog.title && blog.blog_images && blog.blog_images.length > 0
    );

    return validBlogs;
  };

  const loadInitialBlogs = useCallback(async () => {
    setLoading(true);
    const newBlogs = await fetchBlogs(0);
    setBlogs(newBlogs);
    setHasMore(newBlogs.length === LIMIT);
    setLoading(false);
  }, [LIMIT]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const newBlogs = await fetchBlogs(nextPage);

    if (newBlogs.length > 0) {
      setBlogs((prev) => {
        const existingIds = new Set(prev.map((b) => b.id));
        const uniqueNew = newBlogs.filter((b) => !existingIds.has(b.id));
        return [...prev, ...uniqueNew];
      });
      setPage(nextPage);
    }

    setHasMore(newBlogs.length === LIMIT);
    setLoadingMore(false);
  };

  useEffect(() => {
    loadInitialBlogs();
  }, [loadInitialBlogs]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">All Blogs</h2>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {blogs.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* Initial loading skeleton */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden p-0">
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

        {/* Load more skeleton */}
        {loadingMore && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={`loading-${i}`} className="overflow-hidden p-0">
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

        {/* Load More Button - Only show if not loading initially, not loading more, and has more blogs */}
        {!loading && !loadingMore && hasMore && blogs.length > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={loadMore} className="bg-blue-700 text-white">
              Load More
            </Button>
          </div>
        )}

        {/* No more blogs message */}
        {!loading && !loadingMore && !hasMore && blogs.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You've reached the end of our blog posts.
            </p>
          </div>
        )}

        {/* No blogs found */}
        {!loading && blogs.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No blog posts found.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
