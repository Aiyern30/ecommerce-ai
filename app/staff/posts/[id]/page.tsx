"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, Calendar, Edit, LinkIcon, Trash2 } from "lucide-react";
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
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
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/posts">Posts</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{post.title}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{post.title}</CardTitle>
              {post.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {post.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created: {formatDate(post.created_at)}
                </div>
                {post.updated_at !== post.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Updated: {formatDate(post.updated_at)}
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Post Image */}
          {post.image_url && (
            <Card>
              <CardContent className="p-6">
                <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-auto rounded-lg object-cover"
                  priority
                />
              </CardContent>
            </Card>
          )}

          {/* Post Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.body}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Post ID
                </label>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  #{post.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <p className="text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Published
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <p className="text-sm">{formatDate(post.created_at)}</p>
              </div>

              {post.updated_at !== post.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </label>
                  <p className="text-sm">{formatDate(post.updated_at)}</p>
                </div>
              )}

              {post.link && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isExternalLink(post.link)
                      ? "External Link"
                      : "Internal Link"}
                  </label>
                  <div className="mt-1">
                    {post.link_name && (
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {post.link_name}
                      </p>
                    )}
                    {isExternalLink(post.link) ? (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {post.link}
                      </a>
                    ) : (
                      <Link
                        href={post.link}
                        className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {post.link}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="default"
                onClick={() => router.push(`/staff/posts/${post.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Post
              </Button>

              {/* Delete Dialog */}
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={openDeleteDialog}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this post? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Post Preview in Dialog */}
                  <div className="overflow-y-auto p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          post.image_url ||
                          "/placeholder.svg?height=48&width=48"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
