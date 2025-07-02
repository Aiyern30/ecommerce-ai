/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import type React from "react";
import { ArrowLeft, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/";
import Image from "next/image";
import { toast } from "sonner";
import { Blog, Tag } from "@/type/blogs";

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
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<{ image_url: string }[]>(
    []
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

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
      setCurrentImages(blogData.blog_images || []);

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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles: File[] = [];
      let hasError = false;

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          setImageError(`File "${file.name}" is not an image.`);
          hasError = true;
        } else if (file.size > 5 * 1024 * 1024) {
          setImageError(`File "${file.name}" size exceeds 5MB.`);
          hasError = true;
        } else {
          newFiles.push(file);
        }
      });

      if (hasError) {
        setSelectedImageFiles([]);
        e.target.value = "";
      } else {
        setSelectedImageFiles(newFiles);
        setImageError(null);
      }
    } else {
      setSelectedImageFiles([]);
      setImageError(null);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setSelectedImageFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const handleRemoveCurrentImage = (imageUrl: string) => {
    setRemovedImages((prev) => [...prev, imageUrl]);
    setCurrentImages((prev) =>
      prev.filter((img) => img.image_url !== imageUrl)
    );
  };

  const handleRestoreCurrentImage = (imageUrl: string) => {
    setRemovedImages((prev) => prev.filter((url) => url !== imageUrl));
    if (blog?.blog_images) {
      const originalImage = blog.blog_images.find(
        (img) => img.image_url === imageUrl
      );
      if (originalImage) {
        setCurrentImages((prev) => [...prev, originalImage]);
      }
    }
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
      // Upload new images if any
      const newImageUrls: string[] = [];
      for (const file of selectedImageFiles) {
        const fileExt = file.name.split(".").pop();
        const filePath = `blogs/${blogId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("blogs")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Image upload failed:", uploadError.message);
          toast.error(
            `Failed to upload image ${file.name}: ${uploadError.message}`
          );
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("blogs")
          .getPublicUrl(filePath);
        newImageUrls.push(publicData.publicUrl);
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

      // Handle image updates
      if (removedImages.length > 0) {
        // Remove images from blog_images table
        const { error: removeImagesError } = await supabase
          .from("blog_images")
          .delete()
          .eq("blog_id", blog.id)
          .in("image_url", removedImages);

        if (removeImagesError) {
          console.error("Failed to remove images:", removeImagesError.message);
        }
      }

      // Add new images to blog_images table
      if (newImageUrls.length > 0) {
        const { error: addImagesError } = await supabase
          .from("blog_images")
          .insert(
            newImageUrls.map((url) => ({ blog_id: blog.id, image_url: url }))
          );

        if (addImagesError) {
          console.error("Failed to add new images:", addImagesError.message);
          toast.error("Failed to add new images: " + addImagesError.message);
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
    return (
      <div className="flex flex-col gap-6 w-full max-w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading blog...</div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Blog not found.</div>
        </div>
      </div>
    );
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
              <BreadcrumbLink href="/staff/blogs">Blogs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/staff/blogs/${blog.id}`}>
                {blog.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Edit</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Blog</h1>
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
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Details</CardTitle>
              <CardDescription>
                Edit the basic details of the blog.
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Select tags to categorize this blog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          !tagFields.some((field) => field.tag_id === tag.id)
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
                  const tag = availableTags.find((t) => t.id === field.tag_id);
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
            </CardContent>
          </Card>

          {/* Image Management */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Images</CardTitle>
              <CardDescription>
                Manage the images for this blog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Images */}
              {currentImages.length > 0 && (
                <div>
                  <FormLabel>Current Images</FormLabel>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {currentImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={image.image_url || "/placeholder.svg"}
                          alt={`Current image ${index + 1}`}
                          className="object-cover rounded-md aspect-square"
                          width={128}
                          height={128}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleRemoveCurrentImage(image.image_url)
                          }
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Removed Images (with restore option) */}
              {removedImages.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      {removedImages.length} image(s) will be removed
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        removedImages.forEach(handleRestoreCurrentImage);
                        setRemovedImages([]);
                      }}
                    >
                      Restore All
                    </Button>
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <FormItem>
                <FormLabel>Upload New Images (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </FormControl>
                <FormDescription>
                  Accepted formats: JPG, PNG, GIF. Max size: 5MB per file. Leave
                  empty to keep current images.
                </FormDescription>
                {imageError && <FormMessage>{imageError}</FormMessage>}
              </FormItem>

              {/* New Images Preview */}
              {selectedImageFiles.length > 0 && (
                <div className="mt-4">
                  <FormLabel>New Images Preview</FormLabel>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedImageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`New image preview ${index + 1}`}
                          className="object-cover rounded-md aspect-square"
                          width={128}
                          height={128}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove new image</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
