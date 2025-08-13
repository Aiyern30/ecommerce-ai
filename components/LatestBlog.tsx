"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ZoomIn } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Blog } from "@/type/blogs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/";
import { Button } from "@/components/ui/";
import { Dialog, DialogContent } from "@/components/ui/";
import { TypographyH1 } from "./ui/Typography";

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
          id, title, description, link, link_name, status, created_at, updated_at,
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
        setBlogs((data ?? []).filter((blog) => blog.title));
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
      : blogs.length === 3
      ? "grid-cols-3"
      : "grid-cols-4";

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
              className={`grid gap-6 sm:grid-cols-2 md:${columnCount} w-full`}
            >
              {blogs.map((post) => {
                const images =
                  post.blog_images
                    ?.map((img) => img.image_url)
                    .filter(Boolean) || [];
                const mainImage =
                  images[0] || "/placeholder.svg?height=300&width=400";
                const hoverImage = images[1] || null;
                return (
                  <Card
                    key={post.id}
                    className="overflow-hidden group relative py-0 flex flex-col h-full"
                  >
                    <CardHeader className="p-0 relative h-52 flex-shrink-0">
                      <Image
                        src={mainImage || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className={`object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105
                        ${hoverImage ? "opacity-100 group-hover:opacity-0" : ""}
                      `}
                        style={{ transition: "opacity 0.3s, transform 0.3s" }}
                      />
                      {hoverImage && (
                        <Image
                          src={hoverImage || "/placeholder.svg"}
                          alt={post.title + " (alt)"}
                          fill
                          className="object-cover rounded-t-lg absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            zIndex: 1,
                            transition: "opacity 0.3s",
                          }}
                        />
                      )}

                      <div>
                        <div className="absolute left-3 bottom-3 flex flex-col gap-2 sm:hidden opacity-100 pointer-events-auto z-10">
                          <button
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-200"
                            onClick={() => setZoomImage(mainImage)}
                            title="Zoom In"
                          >
                            <ZoomIn className="h-4 w-4 text-blue-600" />
                          </button>
                          <button className="p-2 bg-white rounded-full shadow hover:bg-gray-200">
                            <Heart className="h-4 w-4 text-blue-600" />
                          </button>
                        </div>
                        <div className="absolute left-3 bottom-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hidden sm:flex pointer-events-none group-hover:pointer-events-auto">
                          <button
                            className="p-2 bg-white rounded-full shadow hover:bg-gray-200"
                            onClick={() => setZoomImage(mainImage)}
                            title="Zoom In"
                          >
                            <ZoomIn className="h-4 w-4 text-blue-600" />
                          </button>
                          <button className="p-2 bg-white rounded-full shadow hover:bg-gray-200">
                            <Heart className="h-4 w-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
                      <div className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm flex-1">
                        {post.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="px-4 pb-4 mt-auto">
                      <Button
                        asChild
                        variant="link"
                        className="p-0 text-sm text-blue-800"
                      >
                        <Link href={`/blogs/${post.id}`}>Read More</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
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
