"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Blog } from "@/type/blogs";
import { Button, Card, Skeleton } from "@/components/ui";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { TypographyH1, TypographyP } from "@/components/ui/Typography";
import dynamic from "next/dynamic";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();

  const id =
    params && typeof params.id === "string"
      ? params.id
      : params && Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [blog, setBlog] = useState<Blog | null>(null);
  console.log("Blog:", blog);
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
    id, title, description, status, created_at, updated_at,
    link, link_name, content, image_url,
    blog_images ( image_url ),
    blog_tags ( tags ( id, name ) )
  `
        )
        .eq("id", id)
        .eq("status", "published")
        .single();
      if (currentError) {
        console.error("Failed to fetch blog:", currentError.message);
        router.push("/blogs");
        return;
      }

      setBlog(current as Blog);

      const { data: prev } = await supabase
        .from("blogs")
        .select("id, title")
        .lt("created_at", current.created_at)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setPrevBlog(prev ?? null);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-6 w-1/2 mb-2" />
          </div>
          <Card className="pt-0">
            <div className="relative w-full h-[300px] md:h-[400px] mb-6">
              <Skeleton className="w-full h-full rounded-md" />
            </div>
            <Skeleton className="h-8 w-3/4 mb-6 mx-6" />
            <div className="space-y-6 text-gray-700 px-6 mb-12">
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-10 w-32 mt-4" />
            </div>
            <div className="w-full mb-6">
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
            <div className="border-t pt-6 flex justify-between items-center px-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <BreadcrumbNav
            customItems={[
              { label: "Home", href: "/" },
              { label: "Blogs", href: "/blogs" },
              { label: blog.title },
            ]}
          />
        </div>
        <Card className="pt-0">
          {blog.blog_images && blog.blog_images.length === 1 && (
            <div className="relative w-full h-[300px] md:h-[400px] mb-6">
              <Image
                src={blog.blog_images[0].image_url}
                alt={blog.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                className="object-cover rounded-md"
                priority
              />
            </div>
          )}
          {blog.blog_images && blog.blog_images.length === 2 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  src={blog.blog_images[0].image_url}
                  alt={blog.title + " 1"}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  src={blog.blog_images[1].image_url}
                  alt={blog.title + " 2"}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          <TypographyH1 className="mb-6 px-6">{blog.title}</TypographyH1>

          <div className="space-y-6 px-6 mb-12">
            <TypographyP>{blog.description}</TypographyP>
            {blog.content && (
              <MarkdownPreview
                source={blog.content}
                style={{
                  background: "transparent",
                  fontSize: 16,
                  color: "#334155",
                  padding: 0,
                }}
                className="!bg-transparent dark:!text-white dark:!prose-invert"
              />
            )}
            {blog.link && (
              <div className="mt-4">
                {blog.link.startsWith("http://") ||
                blog.link.startsWith("https://") ? (
                  <a
                    href={blog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
                  >
                    {blog.link_name || "Visit Link"}
                  </a>
                ) : (
                  <Button
                    variant={"default"}
                    onClick={() => router.push(blog.link!)}
                  >
                    {blog.link_name || "Go to Page"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {blog.blog_images && blog.blog_images.length >= 3 && (
            <div className="w-full mb-6">
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  src={blog.blog_images[2].image_url}
                  alt={blog.title + " 3"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
          {blog.blog_images && blog.blog_images.length === 4 && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  src={blog.blog_images[2].image_url}
                  alt={blog.title + " 3"}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  src={blog.blog_images[3].image_url}
                  alt={blog.title + " 4"}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 40vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {(prevBlog || nextBlog) && (
            <div className="border-t pt-6 flex justify-between items-center px-6">
              <div className="flex text-sm text-gray-500 w-full justify-between">
                {prevBlog ? (
                  <Link
                    href={`/blogs/${prevBlog.id}`}
                    className="flex items-center text-blue-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span>Previous</span>
                  </Link>
                ) : (
                  <span />
                )}

                {nextBlog ? (
                  <Link
                    href={`/blogs/${nextBlog.id}`}
                    className="flex items-center text-blue-700"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
