"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
  Badge,
} from "@/components/ui/";
import Image from "next/image";
import { toast } from "sonner";
import { Tag } from "@/type/blogs";

// Zod schema for blog creation
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

export default function Page() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

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

  // Fetch available tags
  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) {
        console.error("Failed to fetch tags:", error);
        toast.error("Failed to load tags");
      } else {
        setAvailableTags(data || []);
      }
    }

    fetchTags();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles: File[] = [];
      let hasError = false;

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          setImageError(`File "${file.name}" is not an image.`);
          hasError = true;
        } else if (file.size > 10 * 1024 * 1024) {
          setImageError(`File "${file.name}" size exceeds 10MB.`);
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

  const handleRemoveImage = (index: number) => {
    setSelectedImageFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const addTag = (tagId: string) => {
    if (!tagFields.some((field) => field.tag_id === tagId)) {
      appendTag({ tag_id: tagId });
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    setImageError(null);

    try {
      // Insert blog data
      const { data: blogInsertData, error: blogInsertError } = await supabase
        .from("blogs")
        .insert({
          title: data.title,
          description: data.description || null,
          external_link: data.external_link || null,
        })
        .select("id")
        .single();

      if (blogInsertError) {
        toast.error("Blog creation failed: " + blogInsertError.message);
        setIsSubmitting(false);
        return;
      }

      const blogId = blogInsertData.id;

      // Upload images if any
      if (selectedImageFiles.length > 0) {
        const imageUrls: string[] = [];
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
            console.error(
              `Image upload failed for ${file.name}:`,
              uploadError.message
            );
            toast.error(
              `Failed to upload image ${file.name}: ${uploadError.message}`
            );
            continue;
          }

          const { data: publicData } = supabase.storage
            .from("blogs")
            .getPublicUrl(filePath);
          imageUrls.push(publicData.publicUrl);
        }

        if (imageUrls.length > 0) {
          const { error: imagesInsertError } = await supabase
            .from("blog_images")
            .insert(
              imageUrls.map((url) => ({ blog_id: blogId, image_url: url }))
            );

          if (imagesInsertError) {
            console.error(
              "Blog images insert failed:",
              imagesInsertError.message
            );
            toast.error(
              "Failed to link blog images: " + imagesInsertError.message
            );
          }
        }
      }

      // Insert tags if any
      if (data.tags && data.tags.length > 0) {
        const { error: tagsInsertError } = await supabase
          .from("blog_tags")
          .insert(
            data.tags.map((tag) => ({ blog_id: blogId, tag_id: tag.tag_id }))
          );

        if (tagsInsertError) {
          console.error("Blog tags insert failed:", tagsInsertError.message);
          toast.error("Failed to add blog tags: " + tagsInsertError.message);
        }
      }

      toast.success("Blog created successfully!");
      router.push("/staff/blogs");
    } catch (error) {
      console.error("Unexpected error during blog creation:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
              <BreadcrumbLink href="/staff/blogs">Blogs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>New Blog</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Blog</h1>
          <div className="flex items-center gap-2">
            <Link href="/staff/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
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
                Enter the basic details of the blog.
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

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Images</CardTitle>
              <CardDescription>Upload images for the blog.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormItem>
                <FormLabel>Image Files</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </FormControl>
                <FormDescription>
                  Accepted formats: JPG, PNG, GIF. Max size: 10MB per file.
                </FormDescription>
                {imageError && <FormMessage>{imageError}</FormMessage>}
              </FormItem>
              {selectedImageFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedImageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="object-cover rounded-md aspect-square"
                        width={128}
                        height={128}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/staff/blogs">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Blog..." : "Create Blog"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
