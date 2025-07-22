/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import type React from "react";
import { ArrowLeft, X, BookOpen, Search, Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
import { Blog, Tag } from "@/type/blogs";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

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
  external_link: z
    .string()
    .url("Must be a valid URL")
    .nullish()
    .or(z.literal("")),
  tags: z.array(z.object({ tag_id: z.string() })).optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

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
  const router = useRouter();

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

export default function EditBlogPage() {
  const router = useRouter();
  const pathname = usePathname();
  const blogId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[parts.length - 2];
  }, [pathname]);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      description: "",
      external_link: "",
      tags: [],
    },
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  // Fetch blog data and available tags
  useEffect(() => {
    async function fetchData() {
      if (!blogId) return;

      // Fetch blog data
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
        console.error("Blog fetch failed:", blogError);
        toast.error("Failed to load blog data");
        router.push("/staff/blogs");
        return;
      }

      setBlog(blogData);
      // Get the first image as the current image (since we're now using single image design)
      const firstImage =
        blogData.blog_images && blogData.blog_images.length > 0
          ? blogData.blog_images[0].image_url
          : null;
      setCurrentImageUrl(firstImage);

      // Set form values
      form.reset({
        title: blogData.title,
        description: blogData.description || "",
        external_link: blogData.external_link || "",
        tags:
          blogData.blog_tags?.map((bt: { tags: { id: any } }) => ({
            tag_id: bt.tags.id,
          })) || [],
      });

      // Fetch available tags
      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (tagsError) {
        console.error("Tags fetch failed:", tagsError);
        toast.error("Failed to load tags");
      } else {
        setAvailableTags(tagsData || []);
      }

      setLoading(false);
    }

    fetchData();
  }, [blogId, form, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        setImageError("File must be an image.");
        setSelectedImageFile(null);
        e.target.value = "";
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setImageError("File size must be less than 10MB.");
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
    // Get the first image from blog_images
    const firstImage =
      blog?.blog_images && blog.blog_images.length > 0
        ? blog.blog_images[0].image_url
        : null;
    setCurrentImageUrl(firstImage);
  };

  const addTag = (tagId: string) => {
    if (!tagFields.some((field) => field.tag_id === tagId)) {
      appendTag({ tag_id: tagId });
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    if (!blog) return;

    setIsSubmitting(true);
    setImageError(null);

    try {
      let imageUrl: string | null = currentImageUrl;

      // Handle image upload if new image is selected
      if (selectedImageFile) {
        const fileExt = selectedImageFile.name.split(".").pop();
        const filePath = `blogs/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("blogs")
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
          .from("blogs")
          .getPublicUrl(filePath);
        imageUrl = publicData.publicUrl;

        // Remove old image if it exists
        if (currentImageUrl) {
          const oldImagePath = currentImageUrl.split("/").pop();
          if (oldImagePath) {
            await supabase.storage
              .from("blogs")
              .remove([`blogs/${oldImagePath}`]);
          }
        }
      } else if (removeCurrentImage) {
        // Remove current image
        if (currentImageUrl) {
          const oldImagePath = currentImageUrl.split("/").pop();
          if (oldImagePath) {
            await supabase.storage
              .from("blogs")
              .remove([`blogs/${oldImagePath}`]);
          }
        }
        imageUrl = null;
      }

      // Update blog data
      const { error: blogUpdateError } = await supabase
        .from("blogs")
        .update({
          title: data.title,
          description: data.description || null,
          external_link: data.external_link || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", blog.id);

      if (blogUpdateError) {
        toast.error("Blog update failed: " + blogUpdateError.message);
        setIsSubmitting(false);
        return;
      }

      // Handle image updates in blog_images table
      if (removeCurrentImage || selectedImageFile) {
        // First, remove all existing images
        const { error: removeImagesError } = await supabase
          .from("blog_images")
          .delete()
          .eq("blog_id", blog.id);

        if (removeImagesError) {
          console.error("Failed to remove images:", removeImagesError.message);
        }

        // Add new image if we have one
        if (imageUrl) {
          const { error: addImageError } = await supabase
            .from("blog_images")
            .insert({ blog_id: blog.id, image_url: imageUrl });

          if (addImageError) {
            console.error("Failed to add new image:", addImageError.message);
            toast.error("Failed to add new image: " + addImageError.message);
          }
        }
      }

      // Update tags
      // First, remove all existing tags
      const { error: removeTagsError } = await supabase
        .from("blog_tags")
        .delete()
        .eq("blog_id", blog.id);

      if (removeTagsError) {
        console.error(
          "Failed to remove existing tags:",
          removeTagsError.message
        );
      }

      // Then add new tags
      if (data.tags && data.tags.length > 0) {
        const { error: addTagsError } = await supabase
          .from("blog_tags")
          .insert(
            data.tags.map((tag) => ({ blog_id: blog.id, tag_id: tag.tag_id }))
          );

        if (addTagsError) {
          console.error("Failed to add tags:", addTagsError.message);
          toast.error("Failed to update tags: " + addTagsError.message);
        }
      }

      toast.success("Blog updated successfully!");
      router.push(`/staff/blogs/${blog.id}`);
    } catch (error) {
      console.error("Unexpected error during blog update:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <BlogEditSkeleton />;
  }

  if (!blog) {
    return <BlogNotFound />;
  }

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
          <TypographyH2 className="border-none pb-0">Edit Blog</TypographyH2>
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
          {/* Main Blog Information - Two Column Layout */}
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

                <FormField
                  control={form.control}
                  name="external_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional external link related to this blog.
                      </FormDescription>
                      <div className="min-h-[10px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Tags Section */}
                <div className="space-y-4 pt-6 border-t">
                  <div>
                    <TypographyH3>Tags</TypographyH3>
                    <TypographyP className="!mt-0">
                      Select tags to categorize this blog.
                    </TypographyP>
                  </div>

                  <div>
                    <FormLabel>Add Tags</FormLabel>
                    <Select onValueChange={addTag}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tag to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTags
                          .filter(
                            (tag) =>
                              !tagFields.some(
                                (field) => field.tag_id === tag.id
                              )
                          )
                          .map((tag) => (
                            <SelectItem key={tag.id} value={tag.id}>
                              {tag.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tagFields.map((field, index) => {
                      const tag = availableTags.find(
                        (t) => t.id === field.tag_id
                      );
                      return (
                        <Badge
                          key={field.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag?.name || "Unknown Tag"}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => removeTag(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove tag</span>
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Side - Blog Image */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>Blog Image</TypographyH3>
                </CardTitle>
                <CardDescription>
                  <TypographyP className="!mt-0">
                    Update the blog image or keep the current one.
                  </TypographyP>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>Image File</FormLabel>
                  <FormDescription>
                    Upload a new image or keep the current one. Accepted
                    formats: JPG, PNG, GIF. Max size: 10MB.
                  </FormDescription>
                  <div className="min-h-[10px]">
                    {imageError && <FormMessage>{imageError}</FormMessage>}
                  </div>
                </FormItem>

                <div className="mt-4">
                  {/* Main Image Display */}
                  <AspectRatio ratio={4 / 3} className="mb-4">
                    <div className="relative w-full h-full border-2 border-dashed border-muted rounded-lg overflow-hidden bg-input">
                      {/* Show current image, new image, or upload placeholder */}
                      {(() => {
                        if (selectedImageFile) {
                          // Show new image preview
                          return (
                            <>
                              <Image
                                src={URL.createObjectURL(selectedImageFile)}
                                alt="New image preview"
                                className="w-full h-full object-cover"
                                fill
                                priority
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
                                onClick={handleRemoveNewImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {/* Change image overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label
                                  htmlFor="image-upload"
                                  className="cursor-pointer"
                                >
                                  <div className="bg-white rounded-lg px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 transition-colors">
                                    Change Image
                                  </div>
                                </label>
                              </div>
                            </>
                          );
                        } else if (currentImageUrl && !removeCurrentImage) {
                          // Show current image
                          return (
                            <>
                              <Image
                                src={currentImageUrl}
                                alt="Current blog image"
                                className="w-full h-full object-cover"
                                fill
                                priority
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
                                onClick={handleRemoveCurrentImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {/* Change image overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label
                                  htmlFor="image-upload"
                                  className="cursor-pointer"
                                >
                                  <div className="bg-white rounded-lg px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 transition-colors">
                                    Change Image
                                  </div>
                                </label>
                              </div>
                            </>
                          );
                        } else {
                          // Show upload placeholder
                          return (
                            <label
                              htmlFor="image-upload"
                              className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground text-center">
                                Click to upload image
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG, GIF up to 10MB
                              </p>
                            </label>
                          );
                        }
                      })()}
                    </div>
                  </AspectRatio>

                  {/* Hidden file input */}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {/* Show option to restore current image if removed */}
                  {removeCurrentImage &&
                    blog?.blog_images &&
                    blog.blog_images.length > 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md mb-4">
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

                  <p className="text-xs text-muted-foreground">
                    {selectedImageFile
                      ? "New image preview. This will replace the current image when you save."
                      : currentImageUrl && !removeCurrentImage
                      ? "Current blog image. Click to change or use the X button to remove."
                      : "Upload an image for your blog. Recommended aspect ratio is 4:3."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href={`/staff/blogs/${blog.id}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating Blog..." : "Update Blog"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
