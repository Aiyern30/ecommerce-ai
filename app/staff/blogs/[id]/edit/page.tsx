/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import type React from "react";
import { ArrowLeft, X, BookOpen, Search, Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import * as z from "zod";
import {
  Button,
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
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  AspectRatio,
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import Image from "next/image";
import { toast } from "sonner";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import TagMultiSelect from "@/components/TagMultiSelect";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useDeviceType } from "@/utils/useDeviceTypes";
import rehypeSanitize from "rehype-sanitize";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Zod schema for blog editing
const blogSchema = z.object({
  title: z
    .string()
    .min(1, "Blog title is required")
    .max(200, "Title must be less than 200 characters"),
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
  content: z.string().min(1, "Content is required"),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function EditBlogPage() {
  const router = useRouter();
  const { isMobile } = useDeviceType();

  const pathname = usePathname();
  const blogId = useMemo(() => {
    const parts = (pathname ?? "").split("/");
    return parts[parts.length - 2];
  }, [pathname]);

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // Multi-image state
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  // Tag multiselect state
  const [selectedTags, setSelectedTags] = useState<
    { id: string; name: string }[]
  >([]);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      description: "",
      link_name: "",
      link: "",
      linkType: "internal",
      content: "",
    },
  });

  // Fetch blog data and tags
  useEffect(() => {
    async function fetchData() {
      if (!blogId) return;
      const { data: blogData, error: blogError } = await supabase
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

      if (blogError || !blogData) {
        toast.error("Failed to load blog data");
        router.push("/staff/blogs");
        return;
      }

      setBlog(blogData);

      // Set images
      setExistingImages(
        blogData.blog_images?.map(
          (img: { image_url: string }) => img.image_url
        ) || []
      );
      setSelectedImageFiles([]);
      setImagesToRemove([]);

      // Set tags
      setSelectedTags(
        blogData.blog_tags?.map(
          (bt: { tags: { id: string; name: string } }) => ({
            id: bt.tags.id,
            name: bt.tags.name,
          })
        ) || []
      );

      // Set form values
      form.reset({
        title: blogData.title,
        description: blogData.description || "",
        link_name: blogData.link_name || "",
        link: blogData.link || "",
        linkType:
          blogData.link && blogData.link.startsWith("http")
            ? "external"
            : "internal",
        content: blogData.content || "",
      });

      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [blogId]);

  // Image handlers (same as blogs new)
  const MAX_IMAGES = 5;
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const currentCount =
      existingImages.length + selectedImageFiles.length - imagesToRemove.length;
    const remainingSlots = MAX_IMAGES - currentCount;
    if (files.length > remainingSlots) {
      setImageError(
        `You can only upload ${remainingSlots} more image${
          remainingSlots === 1 ? "" : "s"
        }. Maximum total: ${MAX_IMAGES} images.`
      );
      e.target.value = "";
      return;
    }
    const newFiles: File[] = [];
    let hasError = false;
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setImageError(`File "${file.name}" is not an image.`);
        hasError = true;
      } else if (file.size > 10 * 1024 * 1024) {
        setImageError(`File "${file.name}" exceeds 10MB.`);
        hasError = true;
      } else {
        newFiles.push(file);
      }
    });
    if (hasError) {
      e.target.value = "";
      return;
    }
    setSelectedImageFiles((prev) => [...prev, ...newFiles]);
    setImageError(null);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const url = existingImages[index];
      setImagesToRemove((prev) => [...prev, url]);
    } else {
      setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Save logic: remove all blog_images, insert new ones (existing - removed + new uploads)
  const handleSubmit = async (data: BlogFormData, isDraft: boolean = false) => {
    if (!blog) return;

    const setLoadingState = isDraft ? setIsDraftSaving : setIsSubmitting;
    setLoadingState(true);
    setImageError(null);

    try {
      // 1. Upload new images
      const finalImages: string[] = [];

      // Keep existing images not marked for removal
      for (const url of existingImages) {
        if (!imagesToRemove.includes(url)) {
          finalImages.push(url);
        }
      }

      // Upload new images to Supabase Storage
      for (const file of selectedImageFiles) {
        const fileExt = file.name.split(".").pop();
        const filePath = `blogs/${blog.id}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("blogs")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          toast.error("Failed to upload image: " + uploadError.message);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("blogs")
          .getPublicUrl(filePath);
        finalImages.push(publicData.publicUrl);
      }

      // 2. Call custom API route to update blog data
      const res = await fetch("/api/admin/blogs/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: blog.id,
          title: data.title,
          description: data.description || null,
          link_name: data.link_name || null,
          link: data.link || null,
          content: data.content,
          status: isDraft ? "draft" : "published",
          tags: selectedTags.map((tag) => tag.id),
          images: finalImages,
          removedImages: imagesToRemove,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        toast.error("Failed to update blog: " + error);
        return;
      }

      toast.success(
        isDraft ? "Blog saved as draft!" : "Blog updated successfully!"
      );
      router.push(`/staff/blogs/${blog.id}`);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoadingState(false);
    }
  };

  const onSubmit = (data: BlogFormData) => handleSubmit(data, false);
  const onSaveDraft = () => {
    const data = form.getValues();
    handleSubmit(data, true);
  };
  // Blog Edit Skeleton Component
  function BlogEditSkeleton() {
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
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Main Blog Information - Two Column Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Blog Information Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" /> {/* Blog Information */}
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-10" /> {/* min-h container */}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-10" />
              </div>

              {/* External Link Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-52" />
                <Skeleton className="h-3 w-10" />
              </div>

              {/* Tags Section */}
              <div className="space-y-4 pt-6 border-t">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16" /> {/* Tags */}
                  <Skeleton className="h-4 w-44" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Blog Image Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" /> {/* Blog Image */}
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-24" /> {/* Image File label */}
                <Skeleton className="h-3 w-76" /> {/* Description */}
                <Skeleton className="h-3 w-10" /> {/* Error container */}
              </div>

              <div className="space-y-4">
                {/* Main Image Skeleton */}
                <div className="mb-4">
                  <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                </div>
                <Skeleton className="h-3 w-72" /> {/* Bottom description */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Buttons Skeleton */}
        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    );
  }

  // Blog Not Found Component
  function BlogNotFound() {
    return (
      <div className="flex flex-col gap-6 w-full max-w-full">
        {/* Header with Breadcrumb */}
        <div className="flex flex-col gap-2">
          <BreadcrumbNav
            customItems={[
              { label: "Dashboard", href: "/staff/dashboard" },
              { label: "Blogs", href: "/staff/blogs" },
              { label: "Not Found" },
              { label: "Edit" },
            ]}
          />

          <div className="flex items-center justify-between">
            <TypographyH2 className="border-none pb-0">
              Blog Not Found
            </TypographyH2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/staff/blogs")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </div>
          </div>
        </div>

        {/* Not Found Content */}
        <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[500px]">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>

          <TypographyH3 className="mb-2">Blog Not Found</TypographyH3>

          <TypographyP className="text-muted-foreground text-center mb-2 max-w-md">
            The blog you&apos;re trying to edit doesn&apos;t exist or may have
            been removed.
          </TypographyP>

          <TypographyP className="text-sm text-muted-foreground text-center mb-8 max-w-md">
            Please check the URL or try searching for the blog again.
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
              Need to create a new blog?
            </TypographyP>
            <Button
              variant="default"
              onClick={() => router.push("/staff/blogs/new")}
              className="w-full flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Create New Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <BlogEditSkeleton />;
  if (!blog) return <BlogNotFound />;

  // Compose all images to show (existing - removed + new)
  const imagesToShow = [
    ...existingImages.filter((url) => !imagesToRemove.includes(url)),
    ...selectedImageFiles.map((file) => URL.createObjectURL(file)),
  ].slice(0, MAX_IMAGES);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Blogs", href: "/staff/blogs" },
            { label: blog.title, href: `/staff/blogs/${blog.id}` },
            { label: "Edit" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TypographyH2 className="border-none pb-0">Edit Blog</TypographyH2>
            <Badge
              variant={blog.status === "published" ? "default" : "secondary"}
              className={
                blog.status === "published"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }
            >
              {blog.status === "published" ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/staff/blogs/${blog.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Blog Information */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>Blog Information</TypographyH3>
                </CardTitle>
                <CardDescription>
                  <TypographyP className="!mt-0">
                    Edit the basic details of the blog.
                  </TypographyP>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blog Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., How to Choose the Right Cement for Your Project"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The title of your blog (max 200 characters).
                      </FormDescription>
                      <div className="min-h-[10px]">
                        <FormMessage />
                      </div>
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
                          placeholder="A brief description of the blog content..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A short description or summary (max 500 characters).
                      </FormDescription>
                      <div className="min-h-[10px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Link Section */}
                <div className="space-y-6 pt-6 border-t">
                  <FormField
                    control={form.control}
                    name="linkType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
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
                              form.watch("linkType") === "external"
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
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("linkType") === "external"
                            ? "External URL"
                            : "Internal Page Path"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              form.watch("linkType") === "external"
                                ? "https://example.com"
                                : "/staff/products"
                            }
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch("linkType") === "external"
                            ? "Full URL starting with http:// or https://"
                            : "Internal page path starting with / (e.g., /staff/products, /comparison)"}
                        </FormDescription>
                        <div className="min-h-[10px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Link Preview */}
                  {form.watch("link") && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center gap-2 text-sm">
                        {form.watch("linkType") === "external" ? (
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        ) : (
                          <LinkIcon className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium">
                          {form.watch("linkType") === "external"
                            ? "External Link:"
                            : "Internal Link:"}
                        </span>
                        <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {form.watch("link")}
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags Section - use TagMultiSelect */}
                <div className="space-y-4 pt-6 border-t">
                  <div>
                    <TypographyH3>Tags</TypographyH3>
                    <TypographyP className="!mt-0">
                      Select or create tags to categorize this blog.
                    </TypographyP>
                  </div>
                  <TagMultiSelect
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                  />
                </div>
              </CardContent>
            </Card>
            {/* Right Side - Upload Images */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>Upload Images</TypographyH3>
                </CardTitle>
                <CardDescription>
                  Upload 1 main image and up to 4 additional images for the
                  blog.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>Image Files</FormLabel>
                  <FormDescription>
                    Upload 1 main image and up to 4 additional images. Accepted
                    formats: JPG, PNG, GIF. Max size: 10MB per file.
                  </FormDescription>
                  <div className="min-h-[10px]">
                    {imageError && <FormMessage>{imageError}</FormMessage>}
                  </div>
                </FormItem>
                <div className="mt-4">
                  {/* Main Image Display */}
                  <AspectRatio ratio={4 / 3} className="mb-4">
                    <div className="relative w-full h-full border-2 border-dashed border-muted rounded-lg overflow-hidden bg-input">
                      {imagesToShow.length > 0 ? (
                        <>
                          <Image
                            src={imagesToShow[0]}
                            alt="Main blog image"
                            className="w-full h-full object-cover"
                            fill
                            priority
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
                            onClick={() =>
                              handleRemoveImage(
                                0,
                                0 <
                                  existingImages.filter(
                                    (url) => !imagesToRemove.includes(url)
                                  ).length
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {/* Change main image overlay */}
                          <label
                            htmlFor="main-image-upload"
                            className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <div className="bg-white/90 hover:bg-white text-gray-700 px-3 py-2 rounded-md opacity-0 hover:opacity-100 transition-opacity">
                              Change Image
                            </div>
                          </label>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </>
                      ) : (
                        <label
                          htmlFor="main-image-upload"
                          className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-input/80 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                              <Plus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                Upload main blog image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Click to browse files
                              </p>
                            </div>
                          </div>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </label>
                      )}
                    </div>
                  </AspectRatio>
                  {/* Additional Images Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Additional Images</h4>
                      <span className="text-xs text-muted-foreground">
                        {Math.max(0, imagesToShow.length - 1)} of 4 uploaded
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {imagesToShow.slice(1).map((src, index) => (
                        <AspectRatio key={index + 1} ratio={1}>
                          <div className="relative group w-full h-full border border-muted rounded-md overflow-hidden">
                            <Image
                              src={src}
                              alt={`Additional image ${index + 1}`}
                              className="w-full h-full object-cover"
                              fill
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                              onClick={() =>
                                handleRemoveImage(
                                  index + 1,
                                  index + 1 <
                                    existingImages.filter(
                                      (url) => !imagesToRemove.includes(url)
                                    ).length
                                )
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </AspectRatio>
                      ))}
                      {/* Empty slots for additional images */}
                      {Array.from(
                        {
                          length: Math.max(
                            0,
                            4 - Math.max(0, imagesToShow.length - 1)
                          ),
                        },
                        (_, index) => {
                          const currentAdditionalImages = Math.max(
                            0,
                            imagesToShow.length - 1
                          );
                          const slotIndex = currentAdditionalImages + index;
                          return (
                            <AspectRatio key={`empty-${index}`} ratio={1}>
                              <div className="relative w-full h-full border-2 border-dashed border-muted rounded-md bg-input hover:bg-input/80 transition-colors cursor-pointer">
                                <label
                                  htmlFor={`additional-image-upload-${slotIndex}`}
                                  className="flex items-center justify-center w-full h-full cursor-pointer"
                                >
                                  <Plus className="h-6 w-6 text-muted-foreground" />
                                  <span className="sr-only">
                                    Add additional image
                                  </span>
                                </label>
                                <input
                                  id={`additional-image-upload-${slotIndex}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                            </AspectRatio>
                          );
                        }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload up to 4 additional images. Accepted formats: JPG,
                      PNG, GIF. Max size: 10MB per file.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Section - Markdown Editor */}
          <Card>
            <CardHeader>
              <CardTitle>
                <TypographyH3>Blog Content</TypographyH3>
              </CardTitle>
              <CardDescription>
                <TypographyP className="!mt-0">
                  Write or edit the main content of your blog using the Markdown
                  editor.
                </TypographyP>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <div className="flex flex-col" data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                          height={isMobile ? 400 : 500}
                          preview={isMobile ? "edit" : "live"}
                          previewOptions={{
                            rehypePlugins: isMobile
                              ? [rehypeSanitize]
                              : undefined,
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Write your blog content in Markdown. You can use headings,
                      lists, images, etc.
                    </FormDescription>
                    <div className="min-h-[10px]">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link href={`/staff/blogs/${blog.id}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={onSaveDraft}
              disabled={isSubmitting || isDraftSaving}
            >
              {isDraftSaving ? "Saving Draft..." : "Save Draft"}
            </Button>
            <Button type="submit" disabled={isSubmitting || isDraftSaving}>
              {isSubmitting
                ? blog.status === "published"
                  ? "Updating Blog..."
                  : "Publishing Blog..."
                : blog.status === "published"
                ? "Update Blog"
                : "Publish Blog"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
