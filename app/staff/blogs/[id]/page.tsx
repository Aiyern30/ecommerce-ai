"use client";

import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Edit,
  Trash2,
  FileText,
  Search,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  Skeleton,
  AspectRatio,
} from "@/components/ui";
import {
  TypographyH2,
  TypographyP,
  TypographySmall,
  TypographyInlineCode,
  TypographyH1,
} from "@/components/ui/Typography";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Blog } from "@/type/blogs";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

// Blog Not Found Component
function BlogNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Blogs", href: "/staff/blogs" },
            { label: "Not Found" },
          ]}
        />
      </div>

      {/* Not Found Content */}
      <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[500px]">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>

        <TypographyH1 className="mb-2">Blog Not Found</TypographyH1>

        <TypographyP className="text-muted-foreground text-center mb-2 max-w-md">
          The blog post you&apos;re looking for doesn&apos;t exist or may have
          been removed.
        </TypographyP>

        <TypographyP className="text-sm text-muted-foreground text-center mb-8 max-w-md">
          Please check the URL or try searching for the blog post again.
        </TypographyP>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Button
            onClick={() => router.push("/staff/blogs")}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            Browse Blogs
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 w-full max-w-md">
          <TypographyP className="text-center text-sm text-muted-foreground mb-4">
            Need to create a new blog post?
          </TypographyP>
          <Button
            variant="default"
            onClick={() => router.push("/staff/blogs/new")}
            className="w-full flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create New Blog
          </Button>
        </div>
      </div>
    </div>
  );
}

// Blog Detail Skeleton Component
function BlogDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb and Actions Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-16" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6">
        {/* Left Side - Blog Information Skeleton */}
        <div className="lg:col-span-7 xl:col-span-6">
          <div className="border rounded-lg p-6 h-fit">
            {/* Header Skeleton */}
            <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {/* Title Skeleton */}
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-8 w-3/4" />
                </div>

                {/* Description Skeleton */}
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Status Skeleton */}
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="pt-6 space-y-6">
              {/* Publication Details Skeleton */}
              <div>
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              </div>

              {/* Tags Skeleton */}
              <div>
                <Skeleton className="h-4 w-16 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-6 w-16" />
                  ))}
                </div>
              </div>

              {/* Meta Information Skeleton */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Images Skeleton */}
        <div className="lg:col-span-5 xl:col-span-6">
          <div className="space-y-4">
            {/* Main Image Skeleton */}
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="w-full aspect-[4/3] rounded-lg" />
            </div>

            {/* Additional Images Skeleton */}
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-full aspect-square rounded-md"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const blogId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[parts.length - 1];
  }, [pathname]);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchBlog() {
      const { data, error } = await supabase
        .from("blogs")
        .select(
          `
          *,
          blog_images(image_url),
          blog_tags(tags(id, name))
        `
        )
        .eq("id", blogId)
        .single();

      if (error || !data) {
        console.error("blog fetch failed:", error);
        setBlog(null);
      } else {
        setBlog(data);
        // Update page title dynamically
        document.title = `${data.title} | Cement Products`;
      }
      setLoading(false);
    }

    if (blogId) fetchBlog();
  }, [blogId]);

  const handleDeleteBlog = async () => {
    if (!blog) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", blog.id);

      if (error) {
        console.error("Error deleting blog:", error.message);
        toast.error(`Error deleting blog: ${error.message}`);
      } else {
        toast.success("Blog deleted successfully!");
        router.push("/staff/blogs");
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) return <BlogDetailSkeleton />;

  if (!blog) return <BlogNotFound />;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Blogs", href: "/staff/blogs" },
            { label: blog.title },
          ]}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/staff/blogs/${blog.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          {/* Delete Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this blog? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>

              {/* Blog Preview in Dialog */}
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      blog.blog_images?.[0]?.image_url ||
                      "/placeholder.svg?height=48&width=48"
                    }
                    alt={blog.title}
                    width={48}
                    height={48}
                    className="rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {blog.title}
                    </p>
                    {blog.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {blog.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Created: {formatDate(blog.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteBlog}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Blog"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6">
        {/* Left Side - Blog Information */}
        <div className="lg:col-span-7 xl:col-span-6">
          <div className="border rounded-lg p-6 h-fit">
            {/* Blog Header */}
            <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <TypographySmall className="font-medium text-muted-foreground mb-1">
                    Title:
                  </TypographySmall>
                  <TypographyH2 className="leading-tight">
                    {blog.title}
                  </TypographyH2>
                </div>

                {/* Description */}
                {blog.description && (
                  <div>
                    <TypographySmall className="font-medium text-muted-foreground mb-1">
                      Description:
                    </TypographySmall>
                    <TypographyP className="text-muted-foreground">
                      {blog.description}
                    </TypographyP>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2">
                  <TypographySmall className="font-medium text-muted-foreground mb-1">
                    Status:
                  </TypographySmall>
                  <Badge
                    variant={
                      blog.status === "published" ? "default" : "secondary"
                    }
                    className={`px-3 py-1 ${
                      blog.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {blog.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Blog Details */}
            <div className="pt-6 space-y-6">
              {/* Publication Details */}
              <div>
                <TypographySmall className="font-medium text-muted-foreground mb-3">
                  Publication Details:
                </TypographySmall>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <TypographySmall>
                      Created: {formatDate(blog.created_at)}
                    </TypographySmall>
                  </div>
                  {blog.updated_at !== blog.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <TypographySmall>
                        Updated: {formatDate(blog.updated_at)}
                      </TypographySmall>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {blog.blog_tags && blog.blog_tags.length > 0 && (
                <div>
                  <TypographySmall className="font-medium text-muted-foreground mb-3">
                    Tags:
                  </TypographySmall>
                  <div className="flex flex-wrap gap-2">
                    {blog.blog_tags
                      .flatMap((blogTag) => blogTag.tags)
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-sm"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* External Link */}
              {blog.external_link && (
                <div>
                  <TypographySmall className="font-medium text-muted-foreground mb-3">
                    External Link:
                  </TypographySmall>
                  <a
                    href={blog.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <TypographySmall>View External Link</TypographySmall>
                  </a>
                </div>
              )}

              {/* Meta Information */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <TypographySmall className="text-muted-foreground">
                  Blog ID:{" "}
                  <TypographyInlineCode>#{blog.id}</TypographyInlineCode>
                </TypographySmall>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Images */}
        <div className="lg:col-span-5 xl:col-span-6">
          <div className="space-y-4">
            {/* Main Image with AspectRatio */}
            <div>
              <TypographySmall className="font-medium text-muted-foreground mb-2">
                Main Image:
              </TypographySmall>
              <AspectRatio ratio={4 / 3} className="w-full">
                {blog.blog_images && blog.blog_images.length > 0 ? (
                  <Image
                    src={blog.blog_images[0]?.image_url || "/placeholder.svg"}
                    alt={`${blog.title} - Main Image`}
                    className="w-full h-full rounded-lg object-cover"
                    fill
                    priority
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <TypographyP className="text-muted-foreground">
                        No image available
                      </TypographyP>
                    </div>
                  </div>
                )}
              </AspectRatio>
            </div>

            {/* Additional Images */}
            {blog.blog_images && blog.blog_images.length > 1 && (
              <div>
                <TypographySmall className="font-medium text-muted-foreground mb-2">
                  Additional Images:
                </TypographySmall>
                <div className="grid grid-cols-2 gap-2">
                  {blog.blog_images.slice(1).map((image, index) => (
                    <AspectRatio key={index + 1} ratio={1} className="w-full">
                      <Image
                        src={image.image_url || "/placeholder.svg"}
                        alt={`${blog.title} - Image ${index + 2}`}
                        className="w-full h-full rounded-md object-cover"
                        fill
                      />
                    </AspectRatio>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
