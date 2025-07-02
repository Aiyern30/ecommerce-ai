"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ZoomIn } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Blog } from "@/type/blogs";

export default function LatestBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select(
          `
          id, title, description, external_link, created_at, updated_at,
          blog_images ( image_url ),
          blog_tags ( tags ( id, name ) )
        `
        )
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Failed to fetch blogs:", error.message);
      } else {
        // Optional validation
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

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {blogs.map((post) => (
        <div key={post.id} className="group block relative">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={post.blog_images?.[0]?.image_url || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute left-4 bottom-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200">
                <ZoomIn className="h-5 w-5 text-blue-600" />
              </button>
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200">
                <Heart className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <h3 className="font-medium text-gray-800">{post.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {post.description}
            </p>
            <Link
              href={post.external_link || "#"}
              className="text-sm font-medium text-blue-800"
            >
              Read More
            </Link>
          </div>
        </div>
      ))}
    </>
  );
}
