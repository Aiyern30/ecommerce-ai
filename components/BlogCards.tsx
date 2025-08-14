// components/BlogCard.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { ZoomIn } from "lucide-react";
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

interface BlogCardProps {
  post: Blog;
  onZoomImage?: (imageUrl: string) => void;
}

export function BlogCard({ post, onZoomImage }: BlogCardProps) {
  const images =
    post.blog_images?.map((img) => img.image_url).filter(Boolean) || [];
  const mainImage = images[0] || "/placeholder.svg?height=300&width=400";
  const hoverImage = images[1] || null;

  return (
    <Card className="overflow-hidden group relative py-0 shadow-lg border border-gray-200 dark:border-gray-800 transition-all hover:shadow-2xl flex flex-col h-full">
      <CardHeader className="p-0 relative h-52 flex-shrink-0">
        <Image
          src={mainImage || "/placeholder.svg"}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={`object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105
            ${hoverImage ? "opacity-100 group-hover:opacity-0" : ""}
          `}
          priority
          style={{ transition: "opacity 0.3s, transform 0.3s" }}
        />

        {hoverImage && (
          <Image
            src={hoverImage || "/placeholder.svg"}
            alt={`${post.title} (alt)`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover rounded-t-lg absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ zIndex: 1, transition: "opacity 0.3s" }}
            priority
          />
        )}

        {/* Action buttons */}
        <div className="absolute left-3 bottom-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            className="p-2 bg-white rounded-full shadow hover:bg-gray-200"
            onClick={() => onZoomImage?.(mainImage)}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4 text-blue-600" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </div>
          {post.blog_tags && post.blog_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.blog_tags
                .flatMap((bt) => bt.tags)
                .slice(0, 2)
                .map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {tag.name}
                  </span>
                ))}
              {post.blog_tags.flatMap((bt) => bt.tags).length > 2 && (
                <span className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium">
                  +{post.blog_tags.flatMap((bt) => bt.tags).length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
          {post.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="px-4 pb-4 mt-auto flex-shrink-0">
        <Button asChild variant="link" className="p-0 text-sm text-blue-800">
          <Link href={`/blogs/${post.id}`}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
