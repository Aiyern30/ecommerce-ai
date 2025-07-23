"use client";
import Link from "next/link";
import type React from "react";

import { ArrowLeft, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
  external_link: z
    .string()
    .url("Must be a valid URL")
    .nullish()
    .or(z.literal("")),
  status: z.enum(["draft", "published"]).optional(),
  tags: z.array(z.object({ tag_id: z.string() })).optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function Page() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      description: "",
      external_link: "",
      status: "draft",
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
    } else {
      setSelectedImageFile(null);
      setImageError(null);
    }
  };

  const handleRemoveImage = () => {
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

  const addTag = (tagId: string) => {
    if (!tagFields.some((field) => field.tag_id === tagId)) {
      appendTag({ tag_id: tagId });
    }
  };

  const handleSubmit = async (data: BlogFormData, isDraft = false) => {
    if (isDraft) {
      setIsDraftSaving(true);
    } else {
      setIsSubmitting(true);
    }
    setImageError(null);

    try {
      // Insert blog data
      const { data: blogInsertData, error: blogInsertError } = await supabase
        .from("blogs")
        .insert({
          title: data.title,
          description: data.description || null,
          external_link: data.external_link || null,
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

      // Upload image if selected
      let imageUrl = null;
      if (selectedImageFile) {
        const fileExt = selectedImageFile.name.split(".").pop();
        const filePath = `blogs/${blogId}/${Date.now()}-${Math.random()
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
          toast.error("Failed to upload image: " + uploadError.message);
          setIsSubmitting(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("blogs")
          .getPublicUrl(filePath);
        imageUrl = publicData.publicUrl;
      }

      // Update blog with image URL if uploaded
      if (imageUrl) {
        const { error: updateError } = await supabase
          .from("blogs")
          .update({ image_url: imageUrl })
          .eq("id", blogId);

        if (updateError) {
          console.error(
            "Failed to update blog with image:",
            updateError.message
          );
          toast.error("Failed to link image to blog: " + updateError.message);
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "draft"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Draft blogs are not visible to customers. Published
                        blogs are live on the website.
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

            {/* Right Side - Upload Image */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TypographyH3>Blog Image</TypographyH3>
                </CardTitle>
                <CardDescription>
                  <TypographyP className="!mt-0">
                    Upload an optional image for the blog.
                  </TypographyP>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>Image File</FormLabel>
                  <FormDescription>
                    Upload an image for your blog. Accepted formats: JPG, PNG,
                    GIF. Max size: 10MB.
                  </FormDescription>
                  <div className="min-h-[10px]">
                    {imageError && <FormMessage>{imageError}</FormMessage>}
                  </div>
                </FormItem>

                <div className="mt-4">
                  {/* Main Image Display */}
                  <AspectRatio ratio={4 / 3} className="mb-4">
                    <div className="relative w-full h-full border-2 border-dashed border-muted rounded-lg overflow-hidden bg-input">
                      {selectedImageFile ? (
                        <>
                          <Image
                            src={URL.createObjectURL(selectedImageFile)}
                            alt="Blog image preview"
                            className="w-full h-full object-cover"
                            fill
                            priority
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
                            onClick={handleRemoveImage}
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
                      ) : (
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
                      )}
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
