"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, Calendar, Edit, LinkIcon, Trash2 } from "lucide-react";
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
} from "@/components/ui";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Post } from "@/type/posts";
import { formatDate } from "@/lib/format";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

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

  if (loading) return <div>Loading post...</div>;

  if (!post) return <div>Post not found.</div>;

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
          <Card className="overflow-hidden h-fit">
            <div className="aspect-[16/10] relative">
              <Image
                src={post.image_url || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Card>
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
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {post.description}
                </p>
              )}

              {/* Post Meta Information */}
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-700">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
