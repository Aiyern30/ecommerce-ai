/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, X, Plus, ExternalLink, LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  AspectRatio,
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
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
  link_name: z
    .string()
    .max(100, "Link name must be less than 100 characters")
    .nullish(),
  link: z.string().nullish().or(z.literal("")),
  linkType: z.enum(["internal", "external"]),
  tags: z.array(z.object({ tag_id: z.string() })).optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function Page() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      description: "",
      link_name: "",
      link: "",
      linkType: "internal",
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
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      let error: string | null = null;

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          error = "All files must be images.";
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          error = "Each file must be less than 10MB.";
          continue;
        }
        validFiles.push(file);
      }

      setSelectedImageFiles(validFiles);
      setImageError(error);
    } else {
      setSelectedImageFiles([]);
      setImageError(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImageError(null);
    // Reset the file input if no images left
    if (selectedImageFiles.length === 1) {
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  const addTag = (tagId: string) => {
    if (!tagFields.some((field) => field.tag_id === tagId)) {
      appendTag({ tag_id: tagId });
    }
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

  const handleSubmit = async (data: BlogFormData, isDraft = false) => {
    if (isDraft) {
      setIsDraftSaving(true);
    } else {
      setIsSubmitting(true);
    }
    setImageError(null);

    // Validate link based on type
    if (data.link && !validateLink(data.link, data.linkType)) {
      if (data.linkType === "external") {
        toast.error("External links must start with http:// or https://");
      } else {
        toast.error("Internal links must start with / (e.g., /staff/products)");
      }
      if (isDraft) {
        setIsDraftSaving(false);
      } else {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      // Insert blog data
      const { data: blogInsertData, error: blogInsertError } = await supabase
        .from("blogs")
        .insert({
          title: data.title,
          description: data.description || null,
          link_name: data.link_name || null,
          link: data.link || null,
          status: isDraft ? "draft" : "published",
        })
        .select("id")
        .single();

      if (blogInsertError) {
        toast.error("Blog creation failed: " + blogInsertError.message);
        if (isDraft) {
          setIsDraftSaving(false);
        } else {
          setIsSubmitting(false);
        }
        return;
      }

      const blogId = blogInsertData.id;

      // Upload images if selected
      if (selectedImageFiles.length > 0) {
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
            toast.error("Failed to upload image: " + uploadError.message);
            continue;
          }

          const { data: publicData } = supabase.storage
            .from("blogs")
            .getPublicUrl(filePath);
          const imageUrl = publicData.publicUrl;

          // Insert image record into blog_images table
          const { error: imageInsertError } = await supabase
            .from("blog_images")
            .insert({
              blog_id: blogId,
              image_url: imageUrl,
            });

          if (imageInsertError) {
            console.error(
              "Failed to insert blog image:",
              imageInsertError.message
            );
            toast.error(
              "Failed to save blog image: " + imageInsertError.message
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

      if (isDraft) {
        toast.success("Blog saved as draft successfully!");
      } else {
        toast.success("Blog created successfully!");
      }
      router.push("/staff/blogs");
    } catch (error) {
      console.error("Unexpected error during blog creation:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      if (isDraft) {
        setIsDraftSaving(false);
      } else {
        setIsSubmitting(false);
      }
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    await handleSubmit(data, false);
  };

  const onSaveDraft = async () => {
    const formData = form.getValues();
    // For drafts, we don't need to validate as strictly
    // Just ensure we have at least a title
    if (!formData.title.trim()) {
      toast.error("Blog title is required even for drafts.");
      return;
    }
    await handleSubmit(formData, true);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Blogs", href: "/staff/blogs" },
            { label: "New Blog" },
          ]}
        />

        <div className="flex items-center justify-between">
          <TypographyH2 className="border-none pb-0">
            Create New Blog
          </TypographyH2>
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
                    Enter the basic details of the blog.
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
                  <div>
                    <TypographyH3>Link (Optional)</TypographyH3>
                    <TypographyP className="!mt-0">
                      Add an internal page link or external website link.
                    </TypographyP>
                  </div>

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

            {/* Right Side - Upload Image */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>Blog Image</TypographyH3>
                </CardTitle>
                <CardDescription>
                  <TypographyP className="!mt-0">
                    Upload one or more images for the blog.
                  </TypographyP>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>Image File(s)</FormLabel>
                  <FormDescription>
                    Upload one or more images for your blog. Accepted formats:
                    JPG, PNG, GIF. Max size: 10MB per image.
                  </FormDescription>
                  <div className="min-h-[10px]">
                    {imageError && <FormMessage>{imageError}</FormMessage>}
                  </div>
                </FormItem>

                <div className="mt-4">
                  {/* Main Image Display */}
                  <AspectRatio ratio={4 / 3} className="mb-4">
                    <div className="relative w-full h-full border-2 border-dashed border-muted rounded-lg overflow-hidden bg-input">
                      {selectedImageFiles.length > 0 ? (
                        <div className="flex flex-wrap gap-2 w-full h-full items-center justify-center">
                          {selectedImageFiles.map((file, idx) => (
                            <div key={idx} className="relative w-24 h-20">
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={`Blog image preview ${idx + 1}`}
                                className="w-full h-full object-cover rounded"
                                fill
                                priority
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-lg z-10"
                                onClick={() => handleRemoveImage(idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {/* Change image overlay */}
                          <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-24 h-20 cursor-pointer hover:bg-muted/50 transition-colors border border-dashed border-muted rounded"
                          >
                            <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">
                              Add More
                            </span>
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground text-center">
                            Click to upload image(s)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, GIF up to 10MB each
                          </p>
                        </label>
                      )}
                    </div>
                  </AspectRatio>

                  {/* Hidden file input */}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center">
            <Link href="/staff/blogs">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <div className="flex gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={onSaveDraft}
                disabled={isSubmitting || isDraftSaving}
              >
                {isDraftSaving ? "Saving Draft..." : "Save Draft"}
              </Button>
              <Button type="submit" disabled={isSubmitting || isDraftSaving}>
                {isSubmitting ? "Publishing..." : "Publish Blog"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
