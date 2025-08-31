/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/";
import { Button } from "@/components/ui/";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import type { Blog } from "@/type/blogs";
import { TypographyH1 } from "./ui/Typography";
import { BlogCard } from "./BlogCards";

export default function LatestBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select(
          `
          id, title, description, link, link_name, status, created_at, updated_at, image_url,
          blog_images ( image_url ),
          blog_tags ( tags ( id, name ) )
        `
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Failed to fetch blogs:", error.message);
      } else {
        // Transform the data to match our Blog type
        const transformedBlogs: Blog[] = (data ?? [])
          .filter((blog) => blog.title)
          .map((blog: any) => ({
            id: blog.id,
            title: blog.title,
            description: blog.description,
            status: blog.status,
            created_at: blog.created_at,
            updated_at: blog.updated_at,
            link: blog.link,
            link_name: blog.link_name,
            image_url: blog.image_url,
            blog_images:
              blog.blog_images?.map((img: any) => ({
                image_url: img.image_url,
              })) || null,
            blog_tags:
              blog.blog_tags?.map((blogTag: any) => ({
                tags: {
                  id: blogTag.tags.id,
                  name: blogTag.tags.name,
                },
              })) || null,
          }));

        setBlogs(transformedBlogs);
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center">
      <div className="container mx-auto px-4 flex flex-col flex-1 justify-center">
        <div className="flex flex-col items-center justify-center gap-8 py-12">
          <TypographyH1 className="text-center">LATEST BLOG</TypographyH1>

          <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
            <DialogContent className="max-w-4xl p-0">
              {zoomImage && (
                <Image
                  src={zoomImage || "/placeholder.svg"}
                  alt="Zoomed Blog"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain rounded-md"
                />
              )}
            </DialogContent>
          </Dialog>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : blogs.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No blog posts found.
            </p>
          ) : (
            <div
              className={`grid gap-6 
                grid-cols-1 
                sm:grid-cols-2 
                md:grid-cols-${blogs.length > 3 ? 3 : blogs.length} 
                lg:grid-cols-${blogs.length}
              `}
            >
              {blogs.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onZoomImage={setZoomImage}
                />
              ))}
            </div>
          )}

          {blogs.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/blogs">View More Blogs</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
