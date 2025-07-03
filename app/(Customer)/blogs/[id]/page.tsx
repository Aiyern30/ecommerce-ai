"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Blog } from "@/type/blogs";
import { Card } from "@/components/ui";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export default function BlogPost() {
  const { id } = useParams();
  const router = useRouter();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [prevBlog, setPrevBlog] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [nextBlog, setNextBlog] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);

      const { data: current, error: currentError } = await supabase
        .from("blogs")
        .select(
          `
    id, title, description, external_link, created_at, updated_at,
    blog_images ( image_url ),
    blog_tags ( tags ( id, name ) )
  `
        )
        .eq("id", id)
        .single();
      if (currentError) {
        console.error("Failed to fetch blog:", currentError.message);
        router.push("/blogs");
        return;
      }

      setBlog(current);

      // Fetch previous blog (older than current)
      const { data: prev } = await supabase
        .from("blogs")
        .select("id, title")
        .lt("created_at", current.created_at)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setPrevBlog(prev ?? null);

      // Fetch next blog (newer than current)
      const { data: next } = await supabase
        .from("blogs")
        .select("id, title")
        .gt("created_at", current.created_at)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      setNextBlog(next ?? null);

      setLoading(false);
    };

    if (id) fetchBlogData();
  }, [id, router]);

  if (loading || !blog) {
    return (
      <div className="container mx-auto py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <article className="container mx-auto py-8">
      <div className="py-4">
        <BreadcrumbNav showFilterButton={false} />
      </div>

      <div className="lg:w-3/4 mx-auto">
        <Card>
          <div className="relative w-full h-[300px] md:h-[400px] mb-6">
            <Image
              src={blog.blog_images?.[0]?.image_url || "/placeholder.svg"}
              alt={blog.title}
              fill
              className="object-cover rounded-md"
            />
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900 mb-6 px-6">
            {blog.title}
          </h1>

          <div className="space-y-6 text-gray-700 px-6 mb-12">
            <p>{blog.description}</p>
          </div>

          {/* Previous / Next Navigation */}
          <div className="border-t pt-6 flex justify-between items-center px-6">
            <div className="flex text-sm text-gray-500">
              {prevBlog ? (
                <Link
                  href={`/blogs/${prevBlog.id}`}
                  className="flex items-center mr-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="text-muted-foreground mr-4 flex items-center opacity-50">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  No previous
                </span>
              )}

              {nextBlog ? (
                <Link
                  href={`/blogs/${nextBlog.id}`}
                  className="flex items-center"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <span className="text-muted-foreground flex items-center opacity-50">
                  No next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </article>
  );
}
