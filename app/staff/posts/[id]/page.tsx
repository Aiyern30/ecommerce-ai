"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  Calendar,
  Edit,
  LinkIcon,
  Trash2,
  FileText,
  ArrowLeft,
  Search,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
} from "@/components/ui";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Post } from "@/type/posts";
import { formatDate } from "@/lib/format";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

// Post Detail Skeleton Component
function PostDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-16" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Image Skeleton */}
          <Skeleton className="w-full h-[600px] rounded-lg" />
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardHeader>

            <CardContent className="pt-0 space-y-6">
              {/* Content Section */}
              <div>
                <Skeleton className="h-6 w-20 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* Link Section */}
              <div>
                <Skeleton className="h-6 w-28 mb-3" />
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>

              {/* Meta Information */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Post Not Found Component
function PostNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <span>/</span>
          <span>Posts</span>
          <span>/</span>
          <span>Not Found</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Post Not Found</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/staff/posts")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Button>
          </div>
        </div>
      </div>

      {/* Not Found Content */}
      <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[500px]">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Post Not Found
        </h2>

        <p className="text-gray-500 dark:text-gray-400 text-center mb-2 max-w-md">
          The post you&apos;re looking for doesn&apos;t exist or may have been
          removed.
        </p>

        <p className="text-sm text-gray-400 dark:text-gray-500 text-center mb-8 max-w-md">
          Please check the URL or try searching for the post again.
        </p>

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
            onClick={() => router.push("/staff/posts")}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Search className="w-4 h-4" />
            Browse Posts
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 w-full max-w-md">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            Need to create a new post?
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/staff/posts/new")}
            className="w-full flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create New Post
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const postId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[parts.length - 1];
  }, [pathname]);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error || !data) {
        console.error("post fetch failed:", error);
        setPost(null);
      } else {
        setPost(data);
      }
      setLoading(false);
    }

    if (postId) fetchPost();
  }, [postId]);

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePost = async () => {
    if (!post) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) {
        console.error("Error deleting post:", error.message);
        toast.error(`Error deleting post: ${error.message}`);
      } else {
        toast.success("Post deleted successfully!");
        // Navigate back to posts list after successful deletion
        router.push("/staff/posts");
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) return <PostDetailSkeleton />;

  if (!post) return <PostNotFound />;

  const isExternalLink = (link: string) => {
    return link.startsWith("http://") || link.startsWith("https://");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Posts", href: "/staff/posts" },
            { label: post.title },
          ]}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/staff/posts/${post.id}/edit`)}
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
                onClick={openDeleteDialog}
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
                  Are you sure you want to delete this post? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>

              {/* Post Preview in Dialog */}
              <div className="overflow-y-auto p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      post.image_url || "/placeholder.svg?height=48&width=48"
                    }
                    alt={post.title}
                    width={48}
                    height={48}
                    className="rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {post.title}
                    </p>
                    {post.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {post.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Created: {formatDate(post.created_at)}
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
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Large Image */}
        <div className="lg:col-span-2">
          <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
            <Image
              src={post.image_url || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-fill"
              priority
            />
          </div>
        </div>

        {/* Right Side - All Content in One Card */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <CardTitle className="text-2xl font-bold leading-tight flex-1">
                  {post.title}
                </CardTitle>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex-shrink-0">
                  Published
                </span>
              </div>

              {post.description && (
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {post.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="pt-0 space-y-6">
              {/* Post Content */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Content
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {post.body}
                  </div>
                </div>
              </div>

              {/* Post Link (if exists) */}
              {post.link && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    {isExternalLink(post.link)
                      ? "External Link"
                      : "Internal Link"}
                  </h3>
                  <div className="space-y-2">
                    {post.link_name && (
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {post.link_name}
                      </p>
                    )}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {isExternalLink(post.link) ? (
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline group text-sm"
                        >
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                          <span className="break-all group-hover:text-blue-700 dark:group-hover:text-blue-300">
                            {post.link}
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={post.link}
                          className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:underline group text-sm"
                        >
                          <LinkIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="break-all group-hover:text-green-700 dark:group-hover:text-green-300">
                            {post.link}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Post Meta Information - At the bottom */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(post.created_at)}</span>
                  </div>
                  {post.updated_at !== post.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Updated: {formatDate(post.updated_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                      ID: #{post.id}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
