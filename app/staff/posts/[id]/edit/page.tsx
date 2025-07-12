/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import type React from "react";
import {
  ArrowLeft,
  X,
  ExternalLink,
  LinkIcon,
  FileText,
  Search,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import * as z from "zod";
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui/";
import Image from "next/image";
import { toast } from "sonner";
import { Post } from "@/type/posts";

// Zod schema for post editing
const postSchema = z.object({
  title: z
    .string()
    .min(1, "Post title is required")
    .max(200, "Title must be less than 200 characters"),
  body: z.string().min(1, "Post body is required"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .nullish(),
  link_name: z
    .string()
    .max(100, "Link name must be less than 100 characters")
    .nullish(),
  link: z.string().nullish().or(z.literal("")),
  linkType: z.enum(["internal", "external"]),
});

type PostFormData = z.infer<typeof postSchema>;

// Post Edit Skeleton Component
function PostEditSkeleton() {
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
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-12" />
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Post Details Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-64" />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-3 w-56" />
          </div>

          {/* Body Content Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-3 w-48" />
          </div>
        </CardContent>
      </Card>

      {/* Link Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Link Type Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-72" />
          </div>

          {/* Link Name Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-80" />
          </div>

          {/* Link Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-68" />
          </div>

          {/* Link Preview */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Image */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="w-48 h-48 rounded-md" />
          </div>

          {/* Upload Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-76" />
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons Skeleton */}
      <div className="flex justify-end gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-28" />
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
          <span>/</span>
          <span>Edit</span>
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
          The post you&apos;re trying to edit doesn&apos;t exist or may have
          been removed.
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

export default function EditPostPage() {
  const router = useRouter();
  const pathname = usePathname();
  const postId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[parts.length - 2];
  }, [pathname]);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      body: "",
      description: "",
      link_name: "",
      link: "",
      linkType: "internal",
    },
  });

  const linkType = form.watch("linkType");

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      if (!postId) return;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error || !data) {
        console.error("Post fetch failed:", error);
        toast.error("Failed to load post data");
        router.push("/staff/posts");
        return;
      }

      setPost(data);
      setCurrentImageUrl(data.image_url);

      // Determine link type
      const isExternal = data.link
        ? data.link.startsWith("http://") || data.link.startsWith("https://")
        : false;

      // Set form values
      form.reset({
        title: data.title,
        body: data.body,
        description: data.description || "",
        link_name: data.link_name || "",
        link: data.link || "",
        linkType: isExternal ? "external" : "internal",
      });

      setLoading(false);
    }

    fetchPost();
  }, [postId, form, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        setImageError("File must be an image.");
        setSelectedImageFile(null);
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setImageError("File size must be less than 5MB.");
        setSelectedImageFile(null);
        e.target.value = "";
        return;
      }

      setSelectedImageFile(file);
      setImageError(null);
      setRemoveCurrentImage(false); // If uploading new image, don't remove current
    } else {
      setSelectedImageFile(null);
      setImageError(null);
    }
  };

  const handleRemoveNewImage = () => {
    setSelectedImageFile(null);
    setImageError(null);
    // Reset the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleRemoveCurrentImage = () => {
    setRemoveCurrentImage(true);
    setCurrentImageUrl(null);
  };

  const handleKeepCurrentImage = () => {
    setRemoveCurrentImage(false);
    setCurrentImageUrl(post?.image_url || null);
  };

  const validateLink = (link: string, type: string) => {
    if (!link) return true; // Empty link is allowed

    if (type === "external") {
      return link.startsWith("http://") || link.startsWith("https://");
    } else {
      // Internal link should start with / and not be a full URL
      return link.startsWith("/") && !link.includes("://");
    }
  };

  const onSubmit = async (data: PostFormData) => {
    if (!post) return;

    setIsSubmitting(true);
    setImageError(null);

    // Validate link based on type
    if (data.link && !validateLink(data.link, data.linkType)) {
      if (data.linkType === "external") {
        toast.error("External links must start with http:// or https://");
      } else {
        toast.error("Internal links must start with / (e.g., /staff/products)");
      }
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl: string | null = currentImageUrl;

      // Handle image upload if new image is selected
      if (selectedImageFile) {
        const fileExt = selectedImageFile.name.split(".").pop();
        const filePath = `posts/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, selectedImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Image upload failed:", uploadError.message);
          toast.error(`Failed to upload image: ${uploadError.message}`);
          setIsSubmitting(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("posts")
          .getPublicUrl(filePath);
        imageUrl = publicData.publicUrl;

        if (post.image_url) {
          const oldImagePath = post.image_url.split("/").pop();
          if (oldImagePath) {
            await supabase.storage
              .from("posts")
              .remove([`posts/${oldImagePath}`]);
          }
        }
      } else if (removeCurrentImage) {
        if (post.image_url) {
          const oldImagePath = post.image_url.split("/").pop();
          if (oldImagePath) {
            await supabase.storage
              .from("posts")
              .remove([`posts/${oldImagePath}`]);
          }
        }
        imageUrl = null;
      }

      // Update post data
      const { error: postUpdateError } = await supabase
        .from("posts")
        .update({
          title: data.title,
          body: data.body,
          description: data.description || null,
          link_name: data.link_name || null,
          link: data.link || null,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (postUpdateError) {
        toast.error("Post update failed: " + postUpdateError.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Post updated successfully!");
      router.push(`/staff/posts/${post.id}`);
    } catch (error) {
      console.error("Unexpected error during post update:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PostEditSkeleton />;
  }

  if (!post) {
    return <PostNotFound />;
  }

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
              <BreadcrumbLink href={`/staff/posts/${post.id}`}>
                {post.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Edit</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <div className="flex items-center gap-2">
            <Link href={`/staff/posts/${post.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Edit the basic details of the post.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., How to Choose the Right Cement for Your Project"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The title of your post (max 200 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of the post content..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A short description or summary (max 500 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your post content here..."
                        className="resize-none min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The main content of your post.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Link Section */}
          <Card>
            <CardHeader>
              <CardTitle>Link (Optional)</CardTitle>
              <CardDescription>
                Edit the internal page link or external website link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="linkType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select link type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-green-500" />
                            Internal Page
                          </div>
                        </SelectItem>
                        <SelectItem value="external">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-blue-500" />
                            External Website
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose whether to link to an internal page or external
                      website.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          linkType === "external"
                            ? "Visit Our Website"
                            : "Explore Products"
                        }
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A human-readable name for the link (e.g., "Explore
                      Products", "Read More", "Visit Website")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {linkType === "external"
                        ? "External URL"
                        : "Internal Page Path"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          linkType === "external"
                            ? "https://example.com"
                            : "/staff/products"
                        }
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {linkType === "external"
                        ? "Full URL starting with http:// or https://"
                        : "Internal page path starting with / (e.g., /staff/products, /comparison)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link Preview */}
              {form.watch("link") && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    {linkType === "external" ? (
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                    ) : (
                      <LinkIcon className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium">
                      {linkType === "external"
                        ? "External Link:"
                        : "Internal Link:"}
                    </span>
                    <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {form.watch("link")}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Post Image</CardTitle>
              <CardDescription>
                Update the post image or keep the current one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentImageUrl && !removeCurrentImage && (
                <div className="space-x-5">
                  <FormLabel>Current Image</FormLabel>
                  <div className="mt-2 relative inline-block">
                    <Image
                      src={currentImageUrl || "/placeholder.svg"}
                      alt="Current post image"
                      className="object-cover rounded-md"
                      width={200}
                      height={200}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={handleRemoveCurrentImage}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove current image</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Show option to restore current image if removed */}
              {removeCurrentImage && post.image_url && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      Current image will be removed
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleKeepCurrentImage}
                    >
                      Keep Current Image
                    </Button>
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <FormItem>
                <FormLabel>Upload New Image (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </FormControl>
                <FormDescription>
                  Accepted formats: JPG, PNG, GIF. Max size: 5MB. Leave empty to
                  keep current image.
                </FormDescription>
                {imageError && <FormMessage>{imageError}</FormMessage>}
              </FormItem>

              {/* New Image Preview */}
              {selectedImageFile && (
                <div className="mt-4 space-x-5">
                  <FormLabel>New Image Preview</FormLabel>
                  <div className="mt-2 relative inline-block">
                    <Image
                      src={
                        URL.createObjectURL(selectedImageFile) ||
                        "/placeholder.svg"
                      }
                      alt="New image preview"
                      className="object-cover rounded-md"
                      width={200}
                      height={200}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={handleRemoveNewImage}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove new image</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href={`/staff/posts/${post.id}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating Post..." : "Update Post"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
