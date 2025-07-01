import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Edit,
  LinkIcon,
} from "lucide-react";
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
} from "@/components/ui";
import Image from "next/image";

// interface Post {
//   id: number;
//   title: string;
//   body: string;
//   description: string | null;
//   link: string | null;
//   image_url: string | null;
//   created_at: string;
//   updated_at: string;
// }

interface PostDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", Number.parseInt(id))
    .single();

  if (error || !post) {
    console.error(
      "Error fetching post details:",
      error?.message || "Post not found"
    );
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Post Details</h1>
          <div className="flex items-center gap-2">
            <Link href="/staff/posts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
              </Button>
            </Link>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Post
            </Button>
          </div>
        </div>
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
                  {isExternalLink(post.link) ? (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open External Link
                    </a>
                  ) : (
                    <Link
                      href={post.link}
                      className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline mt-1"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Go to {post.link}
                    </Link>
                  )}
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
              <Button className="w-full" variant="default">
                <Edit className="mr-2 h-4 w-4" />
                Edit Post
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Duplicate Post
              </Button>
              <Button className="w-full" variant="destructive">
                Delete Post
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
