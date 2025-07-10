"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Calendar, Edit, Trash2 } from "lucide-react";
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
  Badge,
} from "@/components/ui";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Blog } from "@/type/blogs";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

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

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

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

  if (loading) return <div>Loading blog...</div>;

  if (!blog) return <div>Blog not found.</div>;

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
      <div className="flex flex-col gap-2">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Blogs", href: "/staff/blogs" },
            { label: blog.title },
          ]}
        />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Blog Details</h1>
          <div className="flex items-center gap-2">
            <Link href="/staff/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
            <Link href={`/staff/blogs/${blog.id}/edit`}>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blog Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{blog.title}</CardTitle>
              {blog.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {blog.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created: {formatDate(blog.created_at)}
                </div>
                {blog.updated_at !== blog.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Updated: {formatDate(blog.updated_at)}
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Blog Images */}
          {blog.blog_images && blog.blog_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blog.blog_images.map((image, index) => (
                    <Image
                      key={index}
                      src={image.image_url || "/placeholder.svg"}
                      alt={`${blog.title} - Image ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {blog.blog_tags && blog.blog_tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blog Info */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Blog ID
                </label>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  #{blog.id}
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
                <p className="text-sm">{formatDate(blog.created_at)}</p>
              </div>

              {blog.updated_at !== blog.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </label>
                  <p className="text-sm">{formatDate(blog.updated_at)}</p>
                </div>
              )}

              {blog.external_link && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    External Link
                  </label>
                  <a
                    href={blog.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Link
                  </a>
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
                onClick={() => router.push(`/staff/blogs/${blog.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Blog
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
                    Delete Blog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this blog? This action
                      cannot be undone.
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
